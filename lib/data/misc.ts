import { createClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/data/embed";
import type {
  Profile,
  Prompt,
  PromptSuggestionWithAuthor,
  Topic,
} from "@/lib/types/database";
import type { AudienceType } from "@/lib/types/database";

export async function fetchTopics(): Promise<Topic[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as Topic[];
}

export async function fetchTopicBySlug(slug: string): Promise<Topic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Topic) ?? null;
}

export async function fetchPrompts(): Promise<Prompt[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("is_published", true)
    .order("active_date", { ascending: false, nullsFirst: false })
    .limit(60);
  return (data ?? []) as Prompt[];
}

/** All published official prompts (for pickers and prompt-of-the-day). */
export async function fetchAllPublishedPrompts(limit = 200): Promise<Prompt[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("is_published", true)
    .order("slug")
    .limit(limit);
  return (data ?? []) as Prompt[];
}

export async function fetchPromptBySlug(slug: string): Promise<Prompt | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Prompt) ?? null;
}

export async function fetchActivePrompt(
  audience?: AudienceType
): Promise<Prompt | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  let q = supabase
    .from("prompts")
    .select("*")
    .eq("is_published", true)
    .eq("active_date", today);
  if (audience === "teens") {
    q = q.or("audience.eq.teens,audience.eq.shared");
  } else if (audience === "parents") {
    q = q.or("audience.eq.parents,audience.eq.shared");
  }
  const { data } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data as Prompt) ?? null;
}

export async function fetchPublishedPromptSuggestions(
  limit = 40
): Promise<PromptSuggestionWithAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_suggestions")
    .select(
      `
      id,
      author_profile_id,
      suggestion_text,
      moderation_status,
      created_at,
      author:profiles!prompt_suggestions_author_profile_id_fkey ( id, username )
    `
    )
    .eq("moderation_status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return [];
  }

  return data.flatMap((row) => {
    const author = embedOne(
      row.author as Pick<Profile, "id" | "username"> | Pick<Profile, "id" | "username">[] | null
    );
    if (!author) return [];
    return [
      {
        id: row.id as string,
        author_profile_id: row.author_profile_id as string,
        suggestion_text: row.suggestion_text as string,
        moderation_status: row.moderation_status as PromptSuggestionWithAuthor["moderation_status"],
        created_at: row.created_at as string,
        author,
      },
    ];
  });
}

export async function fetchProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  return (data as Profile) ?? null;
}
