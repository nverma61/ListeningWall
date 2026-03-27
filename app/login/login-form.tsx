"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/wall";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const target = mode === "signup" ? "/onboarding" : nextPath;
    let error: string | null = null;

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError?.message ?? null;
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError?.message ?? null;
      if (!error && !data.session) {
        error =
          "Your project is still set to require email confirmation. Disable it in Supabase Auth settings for instant signup.";
      }
    }

    setLoading(false);
    if (error) {
      toast({
        title: mode === "signin" ? "Sign in failed" : "Sign up failed",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: mode === "signin" ? "Welcome back" : "Account created",
      description:
        mode === "signin"
          ? "Signed in successfully."
          : "Now choose your username and space.",
    });
    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "signin" | "signup")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-full">
          <TabsTrigger value="signin" className="rounded-full">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="signup" className="rounded-full">
            Sign up
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading
          ? mode === "signin"
            ? "Signing in…"
            : "Creating account…"
          : mode === "signin"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}
