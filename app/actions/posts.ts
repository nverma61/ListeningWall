"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile, isStaffRole } from "@/lib/auth/profile";
import { postSchema } from "@/lib/validations/schemas";
import { scanContent } from "@/lib/moderation/scan";
import { bodyHash } from "@/lib/hash";

export async function createPost(input: unknown) {
  const profile = await requireProfile();
  if (profile.is_muted) {
    return { error: "Your account cannot post right now." };
  }

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (!isStaffRole(profile.role_type)) {
    if (profile.role_type === "teen" && parsed.data.audience !== "teens") {
      return { error: "Teen accounts post on the teen side of the wall only." };
    }
    if (profile.role_type === "parent" && parsed.data.audience !== "parents") {
      return { error: "Parent accounts post on the parent side of the wall only." };
    }
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("author_profile_id", profile.id)
    .gte("created_at", since);

  if ((count ?? 0) >= 5) {
    return { error: "You are posting a little fast. Take a short break and try again." };
  }

  const hash = bodyHash(parsed.data.body);
  const dayAgo = new Date(Date.now() - 86400_000).toISOString();
  const { data: dup } = await supabase
    .from("posts")
    .select("id")
    .eq("author_profile_id", profile.id)
    .eq("body_hash", hash)
    .gte("created_at", dayAgo)
    .maybeSingle();

  if (dup) {
    return { error: "You recently shared something very similar. Try adding a new detail or waiting a day." };
  }

  if (parsed.data.promptId) {
    const { data: pr } = await supabase
      .from("prompts")
      .select("id")
      .eq("id", parsed.data.promptId)
      .eq("is_published", true)
      .maybeSingle();
    if (!pr) {
      return { error: "That official prompt is not available." };
    }
  }

  if (parsed.data.promptSuggestionId) {
    const { data: sug } = await supabase
      .from("prompt_suggestions")
      .select("id")
      .eq("id", parsed.data.promptSuggestionId)
      .eq("moderation_status", "published")
      .maybeSingle();
    if (!sug) {
      return { error: "That community prompt idea is not available." };
    }
  }

  const scan = scanContent(parsed.data.body);
  const row = {
    author_profile_id: profile.id,
    title: parsed.data.title ?? null,
    body: parsed.data.body,
    audience: parsed.data.audience,
    topic_id: parsed.data.topicId ?? null,
    prompt_id: parsed.data.promptId ?? null,
    prompt_suggestion_id: parsed.data.promptSuggestionId ?? null,
    moderation_status: scan.suggestedStatus,
    risk_level: scan.riskLevel,
    body_hash: hash,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (scan.labels.length && data?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("moderation_events").insert({
        content_type: "post",
        content_id: data.id,
        moderation_label: scan.labels.join(","),
        confidence: null,
        action_taken: "auto_scan",
        notes: null,
      });
    } catch {
      /* non-fatal */
    }
  }

  revalidatePath("/wall");
  revalidatePath("/create");
  revalidatePath("/topics");
  revalidatePath("/prompts");
  return { success: true, id: data.id };
}

const EDIT_WINDOW_MS = 15 * 60 * 1000;

const updatePostSchema = z
  .object({
    title: z.string().max(200).optional().nullable(),
    body: z.string().min(1).max(8000).optional(),
    topicId: z.string().uuid().optional().nullable(),
    promptId: z.string().uuid().optional().nullable(),
  })
  .refine(
    (d) =>
      d.body !== undefined ||
      d.title !== undefined ||
      d.topicId !== undefined ||
      d.promptId !== undefined,
    { message: "Nothing to update", path: ["_form"] }
  );

export async function updatePost(postId: string, input: unknown) {
  const profile = await requireProfile();
  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: post, error: fetchErr } = await supabase
    .from("posts")
    .select("id, author_profile_id, created_at, moderation_status")
    .eq("id", postId)
    .single();

  if (fetchErr || !post || post.author_profile_id !== profile.id) {
    return { error: "Not found" };
  }

  if (Date.now() - new Date(post.created_at).getTime() > EDIT_WINDOW_MS) {
    return { error: "Editing is only available for a short time after posting." };
  }

  const newBody = parsed.data.body;
  const scan = newBody !== undefined ? scanContent(newBody) : null;

  const { error } = await supabase
    .from("posts")
    .update({
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(newBody !== undefined ? { body: newBody } : {}),
      ...(parsed.data.topicId !== undefined
        ? { topic_id: parsed.data.topicId }
        : {}),
      ...(parsed.data.promptId !== undefined
        ? { prompt_id: parsed.data.promptId }
        : {}),
      ...(scan
        ? {
            moderation_status: scan.suggestedStatus,
            risk_level: scan.riskLevel,
            body_hash: bodyHash(newBody!),
          }
        : {}),
    })
    .eq("id", postId);

  if (error) return { error: error.message };

  revalidatePath(`/thread/${postId}`);
  return { success: true };
}

export async function deletePost(postId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_profile_id", profile.id);

  if (error) return { error: error.message };
  revalidatePath("/wall");
  return { success: true };
}
