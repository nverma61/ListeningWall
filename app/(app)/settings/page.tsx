import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { UnblockButton } from "./unblock-button";

export default async function SettingsPage() {
  const profile = await getMyProfile();
  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, blocked_profile_id")
    .eq("blocker_profile_id", profile.id);

  const blockedIds = (blocks ?? []).map((b) => b.blocked_profile_id as string);
  const { data: blockedProfiles } = blockedIds.length
    ? await supabase.from("profiles").select("id, username").in("id", blockedIds)
    : { data: [] as { id: string; username: string }[] };

  const blockedMap = new Map(
    (blockedProfiles ?? []).map((p) => [p.id, p.username])
  );

  const { data: savedRows } = await supabase
    .from("saved_posts")
    .select("id, post_id")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const savedPostIds = (savedRows ?? []).map((s) => s.post_id as string);
  const { data: postsForSaved } = savedPostIds.length
    ? await supabase
        .from("posts")
        .select("id, title, body")
        .in("id", savedPostIds)
    : { data: [] as { id: string; title: string | null; body: string }[] };

  const postById = new Map(
    (postsForSaved ?? []).map((p) => [p.id, p])
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account stays private; only your username is public.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Username:</span> @{profile.username}
          </p>
          <p className="text-muted-foreground">
            Usernames cannot be changed in this MVP to keep moderation trails clear.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Saved posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!savedRows?.length ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            <ul className="space-y-2">
              {savedRows.map((s) => {
                const p = postById.get(s.post_id as string);
                if (!p) return null;
                return (
                  <li key={s.id}>
                    <Link href={`/thread/${p.id}`} className="text-sm font-medium hover:underline">
                      {p.title || p.body.slice(0, 80)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Blocked accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!blocks?.length ? (
            <p className="text-sm text-muted-foreground">You have not blocked anyone.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b) => {
                const username =
                  blockedMap.get(b.blocked_profile_id as string) ?? "unknown";
                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>@{username}</span>
                    <UnblockButton blockedProfileId={b.blocked_profile_id as string} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Separator />

      <p className="text-xs text-muted-foreground">
        Need help? Read our{" "}
        <Link href="/safety" className="underline">
          safety resources
        </Link>
        .
      </p>
    </div>
  );
}
