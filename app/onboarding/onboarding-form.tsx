"use client";

import { useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    const formData = new FormData(e.currentTarget);
    const res = await completeOnboarding(formData);
    setLoading(false);
    if (res && "error" in res && res.error) {
      setErrors(res.error as Record<string, string[]>);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>I am a…</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="roleType" value="teen" defaultChecked required />
            Teen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="roleType" value="parent" />
            Parent / caregiver
          </label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]+"
          placeholder="gentle_starling"
        />
        {errors?.username ? (
          <p className="text-sm text-destructive">{errors.username.join(", ")}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Letters, numbers, underscores. This is what others see.
          </p>
        )}
      </div>
      <div className="flex items-start gap-2">
        <input
          id="accept"
          name="acceptGuidelines"
          type="checkbox"
          value="on"
          required
          className="mt-1 h-4 w-4 rounded border border-primary"
        />
        <Label htmlFor="accept" className="text-sm font-normal leading-snug">
          I agree to the{" "}
          <a href="/guidelines" className="text-primary underline">
            community guidelines
          </a>
          .
        </Label>
      </div>
      {errors?.acceptGuidelines ? (
        <p className="text-sm text-destructive">{errors.acceptGuidelines.join(", ")}</p>
      ) : null}
      {errors?._form ? (
        <p className="text-sm text-destructive">{errors._form.join(", ")}</p>
      ) : null}
      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading ? "Saving…" : "Enter Listening Wall"}
      </Button>
    </form>
  );
}
