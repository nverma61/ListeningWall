import { Suspense } from "react";
import Link from "next/link";
import { fetchTopics, fetchTopicBySlug } from "@/lib/data/misc";
import { fetchPublishedPosts } from "@/lib/data/feed";
import { PostCard } from "@/components/app/post-card";
import { EmptyState } from "@/components/app/empty-state";
import { WallTopicPicker } from "@/components/app/wall-topic-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "The Wall" };

export default async function WallPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const topicSlug = searchParams.topic?.trim() || null;
  const topic =
    topicSlug && topicSlug !== "all" ? await fetchTopicBySlug(topicSlug) : null;
  const effectiveSlug = topic?.slug ?? null;

  const [topics, parentPosts, teenPosts] = await Promise.all([
    fetchTopics(),
    fetchPublishedPosts({
      audience: "parents",
      topicSlug: effectiveSlug ?? undefined,
      limit: 30,
    }),
    fetchPublishedPosts({
      audience: "teens",
      topicSlug: effectiveSlug ?? undefined,
      limit: 30,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">The Wall</h1>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              Compare what parents and teens are saying about the same topic—two columns, one
              conversation.
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full shadow-soft">
            <Link href="/create">Create post</Link>
          </Button>
        </div>
        <Suspense fallback={<Skeleton className="h-10 max-w-md rounded-xl" />}>
          <WallTopicPicker topics={topics} currentSlug={effectiveSlug} />
        </Suspense>
        {topicSlug && !topic ? (
          <p className="text-sm text-muted-foreground">
            That topic was not found—showing site-wide posts. Pick a topic from the list.
          </p>
        ) : null}
        {topic ? (
          <p className="text-sm text-muted-foreground">
            Showing posts tagged with{" "}
            <span className="font-medium text-foreground">{topic.name}</span>.
          </p>
        ) : null}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <section className="min-w-0 space-y-4" aria-labelledby="wall-parents-heading">
          <h2 id="wall-parents-heading" className="font-serif text-xl font-semibold">
            Parents
          </h2>
          <div>
            <h3 className="font-serif text-lg font-semibold">What parents are saying</h3>
            {parentPosts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No parent posts yet"
                  description="When parents share here for this topic, their words will show up in this column."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-6">
                {parentPosts.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="min-w-0 space-y-4" aria-labelledby="wall-teens-heading">
          <h2 id="wall-teens-heading" className="font-serif text-xl font-semibold">
            Teens
          </h2>
          <div>
            <h3 className="font-serif text-lg font-semibold">What teens are saying</h3>
            {teenPosts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No teen posts yet"
                  description="When teens share here for this topic, their words will show up in this column."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-6">
                {teenPosts.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
