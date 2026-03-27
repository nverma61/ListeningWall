import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyProfile, isStaffRole } from "@/lib/auth/profile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  if (!profile || !isStaffRole(profile.role_type)) {
    redirect("/wall");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Moderation
        </p>
        <h1 className="font-serif text-3xl font-semibold">Admin</h1>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
          >
            Overview
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
          >
            Reports
          </Link>
          <Link
            href="/admin/prompts"
            className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
          >
            Prompts
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80"
          >
            Users
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
