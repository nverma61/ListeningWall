import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  let openReports = 0;
  let pendingPosts = 0;
  try {
    const admin = createAdminClient();
    const { count: r } = await admin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "open");
    openReports = r ?? 0;
    const { count: p } = await admin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("moderation_status", "pending_review");
    pendingPosts = p ?? 0;
  } catch {
    /* service key missing in local dev */
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Open reports</p>
        <p className="mt-2 font-serif text-3xl font-semibold">{openReports}</p>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Posts pending review</p>
        <p className="mt-2 font-serif text-3xl font-semibold">{pendingPosts}</p>
      </div>
      <p className="sm:col-span-2 text-sm text-muted-foreground">
        Admin actions use the Supabase service role on the server. Configure{" "}
        <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code> in your
        environment for full tooling locally.
      </p>
    </div>
  );
}
