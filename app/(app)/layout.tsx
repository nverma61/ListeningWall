import { AppShell } from "@/components/app/app-shell";
import { getMyProfile, isStaffRole } from "@/lib/auth/profile";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  const staff = profile ? isStaffRole(profile.role_type) : false;

  return (
    <AppShell profile={profile} isStaff={staff}>
      {children}
    </AppShell>
  );
}
