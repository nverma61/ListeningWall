"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/profile";
import { blockSchema } from "@/lib/validations/schemas";

export async function blockUser(input: unknown) {
  const profile = await requireProfile();
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.blockedProfileId === profile.id) {
    return { error: "Invalid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").insert({
    blocker_profile_id: profile.id,
    blocked_profile_id: parsed.data.blockedProfileId,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/wall");
  return { success: true };
}

export async function unblockUser(blockedProfileId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_profile_id", profile.id)
    .eq("blocked_profile_id", blockedProfileId);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}
