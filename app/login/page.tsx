import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your email and password. New accounts can sign up here, then choose a username.
        </p>
        {searchParams.error ? (
          <p className="mt-4 text-sm text-destructive">Something went wrong. Please try again.</p>
        ) : null}
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/onboarding" className="text-primary underline">
            Finish onboarding
          </Link>
        </p>
      </div>
    </div>
  );
}
