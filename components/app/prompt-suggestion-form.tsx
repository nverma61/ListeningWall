"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitPromptSuggestion } from "@/app/actions/prompt-suggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function PromptSuggestionForm() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await submitPromptSuggestion({ text });
      if ("error" in res && res.error) {
        toast({
          title: "Could not send",
          description: typeof res.error === "string" ? res.error : "Try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Thanks for the idea",
        description:
          "Your prompt suggestion is visible below. If it needs review, it may take a little time.",
      });
      setText("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-6">
      <div>
        <h2 className="font-serif text-lg font-semibold">Suggest a prompt</h2>
        <p className="text-sm text-muted-foreground">
          Propose a question or invitation for the whole community—others may discuss it if it
          becomes an official prompt.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="prompt-suggestion">Your prompt idea</Label>
        <Textarea
          id="prompt-suggestion"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What is one thing you wish the other generation understood?"
          rows={4}
          maxLength={2000}
          className="resize-y"
        />
      </div>
      <Button type="submit" disabled={pending || !text.trim()}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Submit suggestion
      </Button>
    </form>
  );
}
