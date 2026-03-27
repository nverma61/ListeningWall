"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/profile";
import { commentSchema } from "@/lib/validations/schemas";
import { scanContent } from "@/lib/moderation/scan";

export async function createComment(input: unknown) {
  const profile = await requireProfile();
  if (profile.is_muted) {
    return { error: "Your account cannot comment right now." };
  }

  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const scan = scanContent(parsed.data.body);

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: parsed.data.postId,
      author_profile_id: profile.id,
      body: parsed.data.body,
      moderation_status: scan.suggestedStatus,
      risk_level: scan.riskLevel,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (scan.labels.length && data?.id) {
    try {
      const admin = createAdminClient();
      await admin.from("moderation_events").insert({
        content_type: "comment",
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

  revalidatePath(`/thread/${parsed.data.postId}`);
  return { success: true, id: data.id };
}
