import { notFound } from "next/navigation";
import Link from "next/link";
import {
  fetchPromptBySlug,
  fetchAllPublishedPrompts,
  fetchPublishedPromptSuggestions,
  fetchTopics,
} from "@/lib/data/misc";
import { fetchPublishedPosts } from "@/lib/data/feed";
import { getMyProfile, isStaffRole } from "@/lib/auth/profile";
import { PostCard } from "@/components/app/post-card";
import { PostComposer } from "@/components/app/post-composer";
import { AudienceBadge } from "@/components/app/audience-badge";
import { Button } from "@/components/ui/button";

export default async function PromptDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const prompt = await fetchPromptBySlug(params.slug);
  if (!prompt) notFound();

  const [topics, officialPrompts, communitySuggestions, posts, profile] =
    await Promise.all([
      fetchTopics(),
      fetchAllPublishedPrompts(),
      fetchPublishedPromptSuggestions(100),
      fetchPublishedPosts({ promptSlug: prompt.slug, limit: 40 }),
      getMyProfile(),
    ]);

  const defaultAudience =
    profile?.role_type === "parent" ? "parents" : "teens";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <AudienceBadge audience={prompt.audience} />
          {prompt.active_date ? (
            <span className="text-xs text-muted-foreground">Day: {prompt.active_date}</span>
          ) : null}
        </div>
        <h1 className="font-serif text-3xl font-semibold leading-tight">
          {prompt.prompt_text}
        </h1>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/prompts">All prompts</Link>
        </Button>
      </div>

      {profile ? (
        <PostComposer
          defaultAudience={defaultAudience}
          topics={topics}
          officialPrompts={officialPrompts}
          communitySuggestions={communitySuggestions}
          defaultPromptLink={{ kind: "official", id: prompt.id }}
          audienceBehavior={
            isStaffRole(profile.role_type)
              ? { kind: "staff" }
              : {
                  kind: "locked",
                  audience: profile.role_type === "parent" ? "parents" : "teens",
                }
          }
        />
      ) : null}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Responses</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No responses yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
