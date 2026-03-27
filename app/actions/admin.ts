"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyProfile, isStaffRole } from "@/lib/auth/profile";
import { promptAdminSchema } from "@/lib/validations/schemas";

async function requireStaff() {
  const profile = await getMyProfile();
  if (!profile || !isStaffRole(profile.role_type)) {
    throw new Error("Forbidden");
  }
  return profile;
}

export async function setPostModeration(
  postId: string,
  status: "published" | "pending_review" | "hidden" | "removed"
) {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("posts")
    .update({ moderation_status: status })
    .eq("id", postId);
  if (error) throw new Error(error.message);
  await admin.from("moderation_events").insert({
    content_type: "post",
    content_id: postId,
    moderation_label: "manual_review",
    confidence: null,
    action_taken: status,
    notes: null,
  });
  revalidatePath("/admin/reports");
  revalidatePath("/wall");
  revalidatePath(`/thread/${postId}`);
}

export async function setCommentModeration(
  commentId: string,
  status: "published" | "pending_review" | "hidden" | "removed"
) {
  await requireStaff();
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("comments")
    .select("post_id")
    .eq("id", commentId)
    .single();
  const { error } = await admin
    .from("comments")
    .update({ moderation_status: status })
    .eq("id", commentId);
  if (error) throw new Error(error.message);
  await admin.from("moderation_events").insert({
    content_type: "comment",
    content_id: commentId,
    moderation_label: "manual_review",
    confidence: null,
    action_taken: status,
    notes: null,
  });
  if (row?.post_id) revalidatePath(`/thread/${row.post_id}`);
  revalidatePath("/admin/reports");
}

export async function setReportStatus(
  reportId: string,
  status: "open" | "reviewing" | "resolved" | "dismissed"
) {
  const staff = await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({
      status,
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reports");
}

export async function setUserBan(profileId: string, banned: boolean) {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_banned: banned })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function setUserMute(profileId: string, muted: boolean) {
  await requireStaff();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_muted: muted })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function upsertPrompt(input: unknown) {
  await requireStaff();
  const parsed = promptAdminSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid prompt");
  }
  const admin = createAdminClient();
  const { error } = await admin.from("prompts").upsert(
    {
      slug: parsed.data.slug,
      prompt_text: parsed.data.promptText,
      audience: parsed.data.audience,
      active_date: parsed.data.activeDate || null,
      is_published: parsed.data.isPublished,
    },
    { onConflict: "slug" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
}
