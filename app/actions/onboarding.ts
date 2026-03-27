"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, getMyProfile } from "@/lib/auth/profile";
import { onboardingSchema } from "@/lib/validations/schemas";

export async function completeOnboarding(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const existing = await getMyProfile();
  if (existing) {
    redirect("/wall");
  }

  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    roleType: formData.get("roleType"),
    acceptGuidelines: formData.get("acceptGuidelines") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").insert({
    auth_user_id: user.id,
    username: parsed.data.username,
    role_type: parsed.data.roleType,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: { username: ["That username is already taken"] } };
    }
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/", "layout");
  redirect("/wall");
}
