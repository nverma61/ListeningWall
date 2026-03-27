"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Topic } from "@/lib/types/database";

export function WallTopicPicker({
  topics,
  currentSlug,
}: {
  topics: Topic[];
  currentSlug: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = currentSlug ?? "all";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("topic");
    } else {
      params.set("topic", next);
    }
    const q = params.toString();
    router.push(q ? `/wall?${q}` : "/wall");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm font-medium text-foreground">Topic</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full max-w-md rounded-xl border-border/70 bg-background/80">
          <SelectValue placeholder="Choose a topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All topics (site-wide)</SelectItem>
          {topics.map((t) => (
            <SelectItem key={t.id} value={t.slug}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
