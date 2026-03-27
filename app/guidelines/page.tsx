import { SiteHeader } from "@/components/site-header";

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">Community guidelines</h1>
        <p className="mt-4 text-muted-foreground">
          Listening Wall works when we choose care over cruelty. These guidelines help everyone
          feel a little safer speaking honestly.
        </p>
        <ul className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Be kind.</strong> Disagreement is welcome;
            harassment is not. No targeting, pile-ons, or dehumanizing language.
          </li>
          <li>
            <strong className="text-foreground">Protect privacy.</strong> Do not share private
            details about yourself or others that could identify someone in real life.
          </li>
          <li>
            <strong className="text-foreground">No sexual content involving minors.</strong> This
            is zero tolerance and will result in removal and escalation.
          </li>
          <li>
            <strong className="text-foreground">Crisis support.</strong> This platform is not
            emergency or clinical care. If you or someone else may be in danger, contact local
            emergency services or a crisis line.
          </li>
          <li>
            <strong className="text-foreground">Report thoughtfully.</strong> If something feels
            off, use reporting so moderators can review with context.
          </li>
        </ul>
      </main>
    </div>
  );
}
