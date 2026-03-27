import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor, ReactionType } from "@/lib/types/database";
import { embedOne } from "@/lib/data/embed";

export async function fetchCommentsForPost(
  postId: string
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      post_id,
      author_profile_id,
      body,
      moderation_status,
      risk_level,
      created_at,
      updated_at,
      author:profiles!comments_author_profile_id_fkey ( id, username, role_type )
    `
    )
    .eq("post_id", postId)
    .eq("moderation_status", "published")
    .order("created_at", { ascending: true });

  if (error || !rows?.length) {
    return [];
  }

  const ids = rows.map((r) => r.id as string);
  const { data: reactRows } = await supabase
    .from("reactions")
    .select("comment_id, reaction_type")
    .in("comment_id", ids);

  const counts = new Map<string, Record<ReactionType, number>>();
  for (const id of ids) {
    counts.set(id, { relate: 0, thank_you: 0, helpful: 0 });
  }
  for (const r of reactRows ?? []) {
    const cid = r.comment_id as string;
    if (!cid || !counts.has(cid)) continue;
    const t = r.reaction_type as ReactionType;
    const c = counts.get(cid)!;
    if (c[t] !== undefined) c[t] += 1;
  }

  return rows.flatMap((row) => {
    const author = embedOne(
      row.author as CommentWithAuthor["author"] | CommentWithAuthor["author"][] | null
    );
    if (!author) return [];
    return [
      {
        id: row.id as string,
        post_id: row.post_id as string,
        author_profile_id: row.author_profile_id as string,
        body: row.body as string,
        moderation_status: row.moderation_status as CommentWithAuthor["moderation_status"],
        risk_level: row.risk_level as CommentWithAuthor["risk_level"],
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        author,
        reaction_counts: counts.get(row.id as string),
      },
    ];
  });
}
