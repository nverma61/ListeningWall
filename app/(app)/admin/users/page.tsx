import { createAdminClient } from "@/lib/supabase/admin";
import { UserAdminTable } from "./users-table";

export default async function AdminUsersPage() {
  let rows: {
    id: string;
    username: string;
    role_type: string;
    is_banned: boolean;
    is_muted: boolean;
    created_at: string;
  }[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id, username, role_type, is_banned, is_muted, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold">Users</h2>
      <UserAdminTable initialRows={rows} />
    </div>
  );
}
