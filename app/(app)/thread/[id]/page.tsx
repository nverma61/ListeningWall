import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPostById } from "@/lib/data/feed";
import { fetchCommentsForPost } from "@/lib/data/comments";
import { getMyProfile } from "@/lib/auth/profile";
import { CommentComposer } from "@/components/app/comment-composer";
import { ReactionBar } from "@/components/app/reaction-bar";
import { ReportModal } from "@/components/app/report-modal";
import { AudienceBadge } from "@/components/app/audience-badge";
import { TopicChip } from "@/components/app/topic-chip";
import { ResourceBanner } from "@/components/app/resource-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { publicRoleLabel } from "@/components/app/public-role-label";
import { SavePostButton } from "./save-button";

export default async function ThreadPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await fetchPostById(params.id);
  if (!post || post.moderation_status !== "published") {
    notFound();
  }

  const comments = await fetchCommentsForPost(post.id);
  const profile = await getMyProfile();
  const crisis =
    post.risk_level === "high" ||
    post.risk_level === "medium" ||
    comments.some((c) => c.risk_level === "high" || c.risk_level === "medium");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <article className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <AudienceBadge audience={post.audience} />
          {post.topic ? (
            <TopicChip slug={post.topic.slug} name={post.topic.name} />
          ) : null}
          {post.prompt ? (
            <Link
              href={`/prompts/${post.prompt.slug}`}
              className="text-xs text-primary hover:underline"
            >
              Official prompt
            </Link>
          ) : null}
          {post.prompt_suggestion ? (
            <span
              className="line-clamp-2 max-w-md text-xs text-muted-foreground"
              title={post.prompt_suggestion.suggestion_text}
            >
              Community idea: {post.prompt_suggestion.suggestion_text}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="text-lg font-semibold hover:underline"
            >
              @{post.author.username}
            </Link>
            <p className="text-sm text-muted-foreground">
              {publicRoleLabel(post.author.role_type)} ·{" "}
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {profile ? (
              <>
                <SavePostButton postId={post.id} />
                <ReportModal targetType="post" targetId={post.id} />
              </>
            ) : null}
          </div>
        </div>
        {post.title ? (
          <h1 className="font-serif text-3xl font-semibold leading-tight">{post.title}</h1>
        ) : null}
        {crisis ? <ResourceBanner /> : null}
        <div className="prose prose-stone max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {post.body}
          </p>
        </div>
        <ReactionBar postId={post.id} counts={post.reaction_counts} />
      </article>

      <Separator />

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-semibold">Replies</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No replies yet. Be gentle, be kind.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link
                          href={`/profile/${c.author.username}`}
                          className="font-medium hover:underline"
                        >
                          @{c.author.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          · {publicRoleLabel(c.author.role_type)} ·{" "}
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      {profile ? <ReportModal targetType="comment" targetId={c.id} /> : null}
                    </div>
                    {(c.risk_level === "high" || c.risk_level === "medium") ? (
                      <ResourceBanner />
                    ) : null}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.body}</p>
                    <ReactionBar commentId={c.id} counts={c.reaction_counts} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
        {profile ? <CommentComposer postId={post.id} /> : null}
      </section>
    </div>
  );
}
