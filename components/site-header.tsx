import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200",
        "hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:py-4">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          The Listening Wall
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <NavLink href="/guidelines">Guidelines</NavLink>
          <NavLink href="/safety">Safety</NavLink>
          <NavLink href="/about">About</NavLink>
          <Button asChild size="sm" className="ml-1 rounded-full shadow-soft">
            <Link href="/login">Sign in</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
