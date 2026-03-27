import type { Prompt } from "@/lib/types/database";

/**
 * Same calendar day (UTC) → same prompt for everyone, without DB writes.
 * Rotates through all published prompts in stable slug order.
 */
export function pickPromptOfTheDay(prompts: Prompt[]): Prompt | null {
  if (prompts.length === 0) return null;
  const sorted = [...prompts].sort((a, b) => a.slug.localeCompare(b.slug));
  const dayKey = new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < dayKey.length; i++) {
    h ^= dayKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % sorted.length;
  return sorted[idx] ?? null;
}
