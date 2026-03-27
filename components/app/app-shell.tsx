"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import type { Profile } from "@/lib/types/database";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as React from "react";

const nav = [
  { href: "/wall", label: "The Wall" },
  { href: "/create", label: "Create post" },
  { href: "/topics", label: "Topics" },
  { href: "/prompts", label: "Prompts" },
];

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted/90",
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  profile,
  isStaff,
  children,
}: {
  profile: Profile | null;
  isStaff: boolean;
  children: React.ReactNode;
}) {
  const staff = isStaff;
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(42,28%,97%)]/90 via-background to-background dark:from-stone-950/90 dark:via-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,280px)]">
                <div className="mt-8 flex flex-col gap-6">
                  <NavLinks onNavigate={() => setOpen(false)} />
                  <Link
                    href="/guidelines"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Guidelines
                  </Link>
                  <Link
                    href="/safety"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Safety
                  </Link>
                  {staff ? (
                    <Link
                      href="/admin"
                      className="text-sm font-medium text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </Link>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/wall" className="font-serif text-lg font-semibold tracking-tight">
              The Listening Wall
            </Link>
          </div>
          <div className="hidden flex-1 justify-center sm:flex">
            <NavLinks />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="rounded-full">
                    @{profile.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${profile.username}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  {staff ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/guidelines">Guidelines</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      void handleSignOut();
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        {children}
      </main>
      <footer className="border-t border-border/60 bg-muted/10 py-10 text-center text-xs text-muted-foreground">
        <p>The Listening Wall — reflection, not emergency care.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/safety" className="hover:underline">
            Safety
          </Link>
          <Link href="/guidelines" className="hover:underline">
            Guidelines
          </Link>
        </div>
      </footer>
    </div>
  );
}
