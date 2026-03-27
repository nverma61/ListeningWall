import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getSessionUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getMyProfile();
  if (!profile) {
    throw new Error("Profile required");
  }
  if (profile.is_banned) {
    throw new Error("Account restricted");
  }
  return profile;
}

export function isStaffRole(role: string) {
  return role === "admin" || role === "moderator";
}
