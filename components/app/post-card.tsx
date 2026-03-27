"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AudienceBadge } from "@/components/app/audience-badge";
import { TopicChip } from "@/components/app/topic-chip";
import { ReactionBar } from "@/components/app/reaction-bar";
import type { PostWithAuthor } from "@/lib/types/database";
import { publicRoleLabel } from "@/components/app/public-role-label";
import { ResourceBanner } from "@/components/app/resource-banner";

export function PostCard({
  post,
  showResource,
}: {
  post: PostWithAuthor;
  showResource?: boolean;
}) {
  const reduce = useReducedMotion();
  const excerpt =
    post.body.length > 280 ? `${post.body.slice(0, 280).trim()}…` : post.body;
  const crisis =
    showResource ||
    post.risk_level === "high" ||
    post.risk_level === "medium";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="space-y-3 pb-2">
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
                Prompt
              </Link>
            ) : null}
            {post.prompt_suggestion ? (
              <span
                className="max-w-[12rem] truncate text-xs text-muted-foreground"
                title={post.prompt_suggestion.suggestion_text}
              >
                Community idea
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              href={`/profile/${post.author.username}`}
              className="font-medium text-foreground hover:underline"
            >
              {post.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              · {publicRoleLabel(post.author.role_type)}
            </span>
            <span className="text-xs text-muted-foreground">
              · {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
          {post.title ? (
            <h2 className="font-serif text-xl font-semibold leading-tight">
              <Link href={`/thread/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {crisis ? <ResourceBanner /> : null}
          <Link href={`/thread/${post.id}`} className="block">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          </Link>
          <ReactionBar postId={post.id} counts={post.reaction_counts} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
