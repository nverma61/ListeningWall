"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/profile";
import { scanContent } from "@/lib/moderation/scan";

const suggestionSchema = z.object({
  text: z.string().min(1, "Write an idea").max(2000),
});

function explainPromptSuggestionsDbError(message: string): string {
  if (/prompt_suggestions|schema cache/i.test(message)) {
    return "The database table for prompt ideas is not set up yet. In Supabase: SQL Editor → New query → paste the contents of supabase/migrations/20250325210000_prompt_suggestions.sql from this repo → Run. Then try again.";
  }
  return message;
}

export async function submitPromptSuggestion(input: unknown) {
  const profile = await requireProfile();
  if (profile.is_muted) {
    return { error: "Your account cannot submit suggestions right now." };
  }

  const parsed = suggestionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.text?.[0] ?? "Invalid suggestion" };
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error: countErr } = await supabase
    .from("prompt_suggestions")
    .select("*", { count: "exact", head: true })
    .eq("author_profile_id", profile.id)
    .gte("created_at", since);

  if (countErr) {
    return { error: explainPromptSuggestionsDbError(countErr.message) };
  }

  if ((count ?? 0) >= 3) {
    return { error: "Please wait a moment before sending another suggestion." };
  }

  const scan = scanContent(parsed.data.text);
  const { data, error } = await supabase
    .from("prompt_suggestions")
    .insert({
      author_profile_id: profile.id,
      suggestion_text: parsed.data.text,
      moderation_status: scan.suggestedStatus,
    })
    .select("id")
    .single();

  if (error) {
    return { error: explainPromptSuggestionsDbError(error.message) };
  }

  revalidatePath("/prompts");
  return { success: true, id: data.id };
}
