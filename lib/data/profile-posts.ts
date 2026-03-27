import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor } from "@/lib/types/database";
import { embedOne } from "@/lib/data/embed";

export async function fetchPostsByProfileId(
  profileId: string
): Promise<PostWithAuthor[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
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
    .eq("author_profile_id", profileId)
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !rows) return [];

  return rows.flatMap((row) => {
    const author = embedOne(
      row.author as PostWithAuthor["author"] | PostWithAuthor["author"][] | null
    );
    if (!author) return [];
    return [
      {
        id: row.id as string,
        author_profile_id: row.author_profile_id as string,
        title: row.title as string | null,
        body: row.body as string,
        audience: row.audience as PostWithAuthor["audience"],
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
      },
    ];
  });
}
