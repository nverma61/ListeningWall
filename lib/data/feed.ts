import { createClient } from "@/lib/supabase/server";
import type {
  AudienceType,
  PostWithAuthor,
  ReactionType,
} from "@/lib/types/database";
import { embedOne } from "@/lib/data/embed";

export type FeedSort = "latest" | "trending" | "supportive";

function hoursAgo(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 3600_000;
}

/**
 * Trending: recency decay + supportive reactions (all types weighted equally).
 * score = reaction_total * 2 + 24 / (hours + 2)
 */
function trendingScore(
  createdAt: string,
  reactionTotal: number
) {
  const h = hoursAgo(createdAt);
  return reactionTotal * 2 + 24 / (h + 2);
}

export async function fetchPublishedPosts(options: {
  audience?: AudienceType;
  topicSlug?: string;
  promptSlug?: string;
  sort?: FeedSort;
  limit?: number;
}): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const limit = options.limit ?? 40;
  let topicId: string | null = null;
  let promptId: string | null = null;

  if (options.topicSlug) {
    const { data: t } = await supabase
      .from("topics")
      .select("id")
      .eq("slug", options.topicSlug)
      .maybeSingle();
    topicId = t?.id ?? "__none__";
  }
  if (options.promptSlug) {
    const { data: p } = await supabase
      .from("prompts")
      .select("id")
      .eq("slug", options.promptSlug)
      .maybeSingle();
    promptId = p?.id ?? "__none__";
  }

  let q = supabase
    .from("posts")
    .select(
      `
      id,
      author_profile_id,
      title,
      body,
      audience,
      topic_id,
      prompt_id,
      prompt_suggestion_id,
      moderation_status,
      risk_level,
      ai_summary_eligible,
      created_at,
      updated_at,
      author:profiles!posts_author_profile_id_fkey ( id, username, role_type ),
      topic:topics ( id, name, slug ),
      prompt:prompts ( id, prompt_text, slug ),
      prompt_suggestion:prompt_suggestions!posts_prompt_suggestion_id_fkey ( id, suggestion_text )
    `
    )
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false })
    .limit(120);

  if (options.audience) {
    q = q.eq("audience", options.audience);
  }
  if (topicId) {
    if (topicId === "__none__") return [];
    q = q.eq("topic_id", topicId);
  }
  if (promptId) {
    if (promptId === "__none__") return [];
    q = q.eq("prompt_id", promptId);
  }

  const { data: rows, error } = await q;
  if (error || !rows?.length) {
    return [];
  }

  const postIds = rows.map((r) => r.id as string);
  const { data: reactRows } = await supabase
    .from("reactions")
    .select("post_id, reaction_type")
    .in("post_id", postIds);

  const counts = new Map<string, Record<ReactionType, number>>();
  const totals = new Map<string, number>();
  for (const pid of postIds) {
    counts.set(pid, { relate: 0, thank_you: 0, helpful: 0 });
    totals.set(pid, 0);
  }
  for (const r of reactRows ?? []) {
    const pid = r.post_id as string;
    if (!pid || !counts.has(pid)) continue;
    const t = r.reaction_type as ReactionType;
    const c = counts.get(pid)!;
    if (c[t] !== undefined) {
      c[t] += 1;
      totals.set(pid, (totals.get(pid) ?? 0) + 1);
    }
  }

  const posts: PostWithAuthor[] = rows.flatMap((row) => {
    const id = row.id as string;
    const author = embedOne(
      row.author as PostWithAuthor["author"] | PostWithAuthor["author"][] | null
    );
    if (!author) return [];
    const rc = counts.get(id) ?? {
      relate: 0,
      thank_you: 0,
      helpful: 0,
    };
    return [
      {
        id,
        author_profile_id: row.author_profile_id as string,
        title: row.title as string | null,
        body: row.body as string,
        audience: row.audience as AudienceType,
        topic_id: row.topic_id as string | null,
        prompt_id: row.prompt_id as string | null,
        prompt_suggestion_id: row.prompt_suggestion_id as string | null,
        moderation_status: row.moderation_status as PostWithAuthor["moderation_status"],
        risk_level: row.risk_level as PostWithAuthor["risk_level"],
        ai_summary_eligible: row.ai_summary_eligible as boolean,
        body_hash: null,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        author,
        topic: embedOne(
          row.topic as PostWithAuthor["topic"] | PostWithAuthor["topic"][] | null
        ),
        prompt: embedOne(
          row.prompt as PostWithAuthor["prompt"] | PostWithAuthor["prompt"][] | null
        ),
        prompt_suggestion: embedOne(
          row.prompt_suggestion as
            | PostWithAuthor["prompt_suggestion"]
            | PostWithAuthor["prompt_suggestion"][]
            | null
        ),
        reaction_counts: rc,
      },
    ];
  });

  if (options.sort === "trending") {
    return posts
      .sort(
        (a, b) =>
          trendingScore(b.created_at, totals.get(b.id) ?? 0) -
          trendingScore(a.created_at, totals.get(a.id) ?? 0)
      )
      .slice(0, limit);
  }

  if (options.sort === "supportive") {
    return posts
      .sort((a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0))
      .slice(0, limit);
  }

  return posts.slice(0, limit);
}

export async function fetchPostById(id: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      author_profile_id,
      title,
      body,
      audience,
      topic_id,
      prompt_id,
      prompt_suggestion_id,
      moderation_status,
      risk_level,
      ai_summary_eligible,
      created_at,
      updated_at,
      author:profiles!posts_author_profile_id_fkey ( id, username, role_type ),
      topic:topics ( id, name, slug ),
      prompt:prompts ( id, prompt_text, slug ),
      prompt_suggestion:prompt_suggestions!posts_prompt_suggestion_id_fkey ( id, suggestion_text )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return null;

  const author = embedOne(
    row.author as PostWithAuthor["author"] | PostWithAuthor["author"][] | null
  );
  if (!author) return null;

  const { data: reactRows } = await supabase
    .from("reactions")
    .select("reaction_type")
    .eq("post_id", id);

  const rc: Record<ReactionType, number> = {
    relate: 0,
    thank_you: 0,
    helpful: 0,
  };
  for (const r of reactRows ?? []) {
    const t = r.reaction_type as ReactionType;
    if (rc[t] !== undefined) rc[t] += 1;
  }

  return {
    id: row.id as string,
    author_profile_id: row.author_profile_id as string,
    title: row.title as string | null,
    body: row.body as string,
    audience: row.audience as AudienceType,
    topic_id: row.topic_id as string | null,
    prompt_id: row.prompt_id as string | null,
    prompt_suggestion_id: row.prompt_suggestion_id as string | null,
    moderation_status: row.moderation_status as PostWithAuthor["moderation_status"],
    risk_level: row.risk_level as PostWithAuthor["risk_level"],
    ai_summary_eligible: row.ai_summary_eligible as boolean,
    body_hash: null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author,
    topic: embedOne(
      row.topic as PostWithAuthor["topic"] | PostWithAuthor["topic"][] | null
    ),
    prompt: embedOne(
      row.prompt as PostWithAuthor["prompt"] | PostWithAuthor["prompt"][] | null
    ),
    prompt_suggestion: embedOne(
      row.prompt_suggestion as
        | PostWithAuthor["prompt_suggestion"]
        | PostWithAuthor["prompt_suggestion"][]
        | null
    ),
    reaction_counts: rc,
  };
}
