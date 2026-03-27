import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, getMyProfile } from "@/lib/auth/profile";
import { SiteHeader } from "@/components/site-header";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=%2Fonboarding");
  }
  const existing = await getMyProfile();
  if (existing) {
    redirect("/wall");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-serif text-3xl font-semibold">Welcome in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you show up. You can always take a breath before you post.
        </p>
        <div className="mt-2 text-sm">
          <Link href="/login" className="text-primary underline">
            Prefer to sign in first?
          </Link>
        </div>
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
