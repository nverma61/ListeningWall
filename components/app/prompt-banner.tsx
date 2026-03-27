import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prompt } from "@/lib/types/database";
import { AudienceBadge } from "@/components/app/audience-badge";

export function PromptBanner({ prompt }: { prompt: Prompt | null }) {
  if (!prompt) return null;
  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prompt of the day
            </p>
            <p className="mt-1 font-serif text-lg leading-snug text-foreground">
              {prompt.prompt_text}
            </p>
            <div className="mt-2">
              <AudienceBadge audience={prompt.audience} />
            </div>
          </div>
        </div>
        <Link
          href={`/prompts/${prompt.slug}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View prompt
        </Link>
      </CardContent>
    </Card>
  );
}
