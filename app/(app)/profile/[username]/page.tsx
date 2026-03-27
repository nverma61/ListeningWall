import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchProfileByUsername } from "@/lib/data/misc";
import { fetchPostsByProfileId } from "@/lib/data/profile-posts";
import { PostCard } from "@/components/app/post-card";
import { Badge } from "@/components/ui/badge";
import { publicRoleLabel } from "@/components/app/public-role-label";
import { getMyProfile } from "@/lib/auth/profile";
import { BlockButton } from "./block-button";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await fetchProfileByUsername(params.username);
  if (!profile || profile.is_banned) {
    notFound();
  }

  const posts = await fetchPostsByProfileId(profile.id);
  const me = await getMyProfile();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">@{profile.username}</h1>
          <p className="mt-2 text-muted-foreground">
            {publicRoleLabel(profile.role_type)} · joined{" "}
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
          {profile.bio ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed">{profile.bio}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">Pseudonymous profile</Badge>
            <Badge variant="muted">Email is never shown</Badge>
          </div>
        </div>
        {me && me.id !== profile.id ? (
          <BlockButton blockedProfileId={profile.id} />
        ) : null}
      </div>

      <div>
        <h2 className="mb-4 font-serif text-xl font-semibold">Reflections</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No public posts yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <Link href="/safety" className="underline">
          Safety &amp; reporting
        </Link>{" "}
        — if something feels off, moderators are here to help.
      </p>
    </div>
  );
}
