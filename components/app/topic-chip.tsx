import Link from "next/link";
import { cn } from "@/lib/utils";

export function TopicChip({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <Link
      href={`/topics/${slug}`}
      className={cn(
        "inline-flex items-center rounded-full border bg-muted/60 px-3 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted",
        className
      )}
    >
      {name}
    </Link>
  );
}
