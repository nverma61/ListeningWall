import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { PLATFORM_SAFETY_NOTE, CRISIS_NOTE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[hsl(42,32%,97%)] via-background to-background dark:from-stone-950 dark:via-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(70vh,520px)] overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-[20%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/[0.09] blur-3xl dark:bg-primary/[0.12]" />
        <div className="absolute -right-[15%] top-[8%] h-[22rem] w-[22rem] rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-900/25" />
        <div className="absolute left-1/2 top-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl dark:bg-accent/15" />
      </div>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:pt-28">
        <p className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        The Listening Wall
          </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
          Bridging the gap between teens and parents — one honest voice at a time. 
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            A space to share perspectives, feel understood, and discover common ground.
          </p>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
            Be Heard. Be Seen.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="rounded-full px-8 shadow-soft-lg">
              <Link href="/onboarding">Begin gently</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mx-auto mt-10 max-w-xl text-pretty text-xs leading-relaxed text-muted-foreground">
            {PLATFORM_SAFETY_NOTE} {CRISIS_NOTE}
          </p>
        </section>

        <section className="border-y border-border/60 bg-muted/25 py-20 backdrop-blur-[2px] dark:bg-muted/15">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "The Wall",
                body: "Pick a topic and read parents and teens side by side on one calm surface.",
              },
              {
                title: "Pseudonyms, real care",
                body: "Pick a username. Behind the scenes we keep accounts safe for moderation.",
              },
              {
                title: "Supportive reactions",
                body: "“I relate,” “Thank you for sharing,” “Helpful”—kindness over clout.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-border/60 bg-card/85 shadow-soft backdrop-blur-sm transition-shadow duration-300 hover:shadow-soft-lg"
              >
                <CardContent className="p-7">
                  <h2 className="font-serif text-lg font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
            <div className="text-pretty">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Why anonymity helps honesty
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Names carry weight. Here, you can speak without performing. Moderation still
                exists—so the room stays respectful—even when the truth is messy.
              </p>
            </div>
            <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-primary/[0.07] via-card to-accent/30 shadow-soft-lg dark:from-primary/[0.12] dark:to-accent/10">
              <CardContent className="space-y-4 p-8 text-sm leading-relaxed text-muted-foreground">
                <p>
                  We never show your email on your profile. What people see is the name you chose
                  and the space you are speaking from.
                </p>
                <p>
                  If something worries you, reporting is always available—and reviewed by humans.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/15 py-20 dark:bg-muted/10">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Topics &amp; prompts
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Browse themes, respond to community prompts, and see parent and teen voices side by
              side on The Wall—always with human moderation in the loop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full" variant="secondary">
                <Link href="/wall">Open The Wall</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/prompts">Browse prompts</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 text-center md:py-28">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Safety is not a footnote
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Keyword detection, reporting, and a moderation queue help us respond thoughtfully—not
            performatively. This is reflection, not emergency care.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/safety">Safety resources</Link>
            </Button>
            <Button asChild className="rounded-full px-6 shadow-soft">
              <Link href="/onboarding">Join the wall</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 bg-muted/10 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Listening Wall
      </footer>
    </div>
  );
}
