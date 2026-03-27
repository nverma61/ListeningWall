import Link from "next/link";
import {
  fetchAllPublishedPrompts,
  fetchPublishedPromptSuggestions,
} from "@/lib/data/misc";
import { getMyProfile } from "@/lib/auth/profile";
import { Card, CardContent } from "@/components/ui/card";
import { AudienceBadge } from "@/components/app/audience-badge";
import { PromptSuggestionForm } from "@/components/app/prompt-suggestion-form";
import { Button } from "@/components/ui/button";
import { pickPromptOfTheDay } from "@/lib/prompt-of-day";

export default async function PromptsArchivePage() {
  const [prompts, suggestions, profile] = await Promise.all([
    fetchAllPublishedPrompts(),
    fetchPublishedPromptSuggestions(50),
    getMyProfile(),
  ]);

  const promptOfDay = pickPromptOfTheDay(prompts);
  const officialRest = promptOfDay
    ? prompts.filter((p) => p.id !== promptOfDay.id)
    : prompts;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Prompts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Past and present prompts—small invitations to honesty and reflection. Suggest a new one
          for everyone to discuss.
        </p>
      </div>

      {promptOfDay ? (
        <section className="space-y-3" id="prompt-of-day">
          <h2 className="font-serif text-xl font-semibold">Prompt of the day</h2>
          <Card className="border-primary/25 bg-primary/5 shadow-soft-lg">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="font-serif text-lg leading-snug text-foreground">
                  {promptOfDay.prompt_text}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <AudienceBadge audience={promptOfDay.audience} />
                  <span className="text-xs text-muted-foreground">
                    Refreshes daily (UTC) — same prompt for everyone today.
                  </span>
                </div>
              </div>
              <Button asChild className="shrink-0 rounded-full">
                <Link href={`/prompts/${promptOfDay.slug}`}>Respond</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {profile ? (
        <PromptSuggestionForm />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login?next=/prompts" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to suggest a prompt for the community.
        </p>
      )}

      {suggestions.length > 0 ? (
        <section className="space-y-3" id="community">
          <h2 className="font-serif text-xl font-semibold">Community prompt ideas</h2>
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.id}>
                <Card className="border-border/60">
                  <CardContent className="p-4 sm:p-5">
                    <p className="text-sm leading-relaxed">{s.suggestion_text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Suggested by @{s.author.username} ·{" "}
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold">Official prompts</h2>
        {officialRest.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other official prompts yet.</p>
        ) : (
          <ul className="space-y-4">
            {officialRest.map((p) => (
              <li key={p.id}>
                <Link href={`/prompts/${p.slug}`}>
                  <Card className="transition-shadow hover:shadow-soft-lg">
                    <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-serif text-lg leading-snug">{p.prompt_text}</p>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {p.active_date ? (
                          <span className="text-xs text-muted-foreground">{p.active_date}</span>
                        ) : null}
                        <AudienceBadge audience={p.audience} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
