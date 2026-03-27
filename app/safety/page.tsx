import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CRISIS_NOTE, PLATFORM_SAFETY_NOTE } from "@/lib/constants";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">Safety resources</h1>
        <p className="mt-4 text-muted-foreground">{PLATFORM_SAFETY_NOTE}</p>
        <p className="mt-4 font-medium text-foreground">{CRISIS_NOTE}</p>
        <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Listening Wall includes automated keyword checks and human moderation. We may hide or
            review posts that suggest elevated risk. This is not a substitute for professional
            care.
          </p>
          <p>
            <strong className="text-foreground">United States:</strong> Call or text{" "}
            <strong>988</strong> for the Suicide &amp; Crisis Lifeline when available in your area.
          </p>
          <p>
            Resources differ by country and region. We will localize this page over time—please
            look up trusted local hotlines and services where you live.
          </p>
          <p>
            <Link href="/guidelines" className="text-primary underline">
              Read community guidelines
            </Link>{" "}
            ·{" "}
            <Link href="/login" className="text-primary underline">
              Sign in to report content
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
