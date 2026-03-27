"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/profile";

export async function toggleSavedPost(postId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("saved_posts")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_posts").delete().eq("id", existing.id);
    revalidatePath("/settings");
    revalidatePath(`/thread/${postId}`);
    return { saved: false };
  }

  const { error } = await supabase.from("saved_posts").insert({
    profile_id: profile.id,
    post_id: postId,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath(`/thread/${postId}`);
  return { saved: true };
}
