import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTopicBySlug } from "@/lib/data/misc";
import { fetchPublishedPosts } from "@/lib/data/feed";
import { PostCard } from "@/components/app/post-card";
import { EmptyState } from "@/components/app/empty-state";
import { AudienceBadge } from "@/components/app/audience-badge";
import { Button } from "@/components/ui/button";

export default async function TopicPage({
  params,
}: {
  params: { slug: string };
}) {
  const topic = await fetchTopicBySlug(params.slug);
  if (!topic) notFound();

  const posts = await fetchPublishedPosts({ topicSlug: topic.slug, limit: 40 });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold">{topic.name}</h1>
        <AudienceBadge audience={topic.audience} />
      </div>
      {topic.description ? (
        <p className="max-w-2xl text-muted-foreground">{topic.description}</p>
      ) : null}
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href={`/wall?topic=${encodeURIComponent(topic.slug)}`}>
          Open on The Wall
        </Link>
      </Button>
      {posts.length === 0 ? (
        <EmptyState
          icon="topic"
          title="Fresh topic"
          description="Be the first to share something honest here."
        />
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
  );
}
