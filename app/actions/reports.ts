"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/profile";
import { reportSchema } from "@/lib/validations/schemas";

export async function submitReport(input: unknown) {
  const profile = await requireProfile();
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_profile_id: profile.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason_code: parsed.data.reasonCode,
    description: parsed.data.description ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}
