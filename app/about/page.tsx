import { SiteHeader } from "@/components/site-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">About Listening Wall</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Listening Wall is a calm, modern place for teens and parents to share honest thoughts
          under chosen usernames—with moderation, care, and clear boundaries.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We believe anonymity can make room for truth, and that truth still deserves stewardship.
          There are no direct messages or media uploads in this first release—just words,
          thoughtfully held, with reporting and moderation when something needs a closer look.
        </p>
      </main>
    </div>
  );
}
