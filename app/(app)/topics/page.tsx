import Link from "next/link";
import { fetchTopics } from "@/lib/data/misc";
import { Card, CardContent } from "@/components/ui/card";
import { AudienceBadge } from "@/components/app/audience-badge";

export default async function TopicsPage() {
  const topics = await fetchTopics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Topics</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse threads by theme. Pick a topic that matches what is on your mind.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {topics.map((t) => (
          <li key={t.id}>
            <Link href={`/topics/${t.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-serif text-lg font-semibold">{t.name}</h2>
                    <AudienceBadge audience={t.audience} />
                  </div>
                  {t.description ? (
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
