import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReportsTable } from "./reports-table";

export default async function AdminReportsPage() {
  let rows: {
    id: string;
    target_type: string;
    target_id: string;
    reason_code: string;
    status: string;
    created_at: string;
  }[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("reports")
      .select("id, target_type, target_id, reason_code, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = data ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold">Reports queue</h2>
      <AdminReportsTable initialRows={rows} />
    </div>
  );
}
