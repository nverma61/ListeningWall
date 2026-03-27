"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/profile";
import { reactionSchema } from "@/lib/validations/schemas";

export async function toggleReaction(input: unknown) {
  const profile = await requireProfile();
  const parsed = reactionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { postId, commentId, reactionType } = parsed.data;
  if (!postId && !commentId) {
    return { error: "Missing target" };
  }

  const supabase = await createClient();

  let q = supabase
    .from("reactions")
    .delete()
    .eq("user_profile_id", profile.id)
    .eq("reaction_type", reactionType);

  if (postId) {
    q = q.eq("post_id", postId).is("comment_id", null);
  }
  if (commentId) {
    q = q.eq("comment_id", commentId).is("post_id", null);
  }

  const { data: deleted, error: delErr } = await q.select("id").maybeSingle();
  if (delErr) {
    return { error: delErr.message };
  }

  if (deleted) {
    if (postId) revalidatePath(`/thread/${postId}`);
    return { success: true, active: false };
  }

  const { error: insErr } = await supabase.from("reactions").insert({
    user_profile_id: profile.id,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    reaction_type: reactionType,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  if (postId) revalidatePath(`/thread/${postId}`);
  return { success: true, active: true };
}
