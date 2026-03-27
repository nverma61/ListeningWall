const BUILD_PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
/** Valid-length JWT-shaped string so @supabase/ssr accepts it during `next build` when env is unset. */
const BUILD_PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.build-placeholder-not-for-runtime";

/**
 * Validates public Supabase env. Call from server/client/middleware so misconfiguration fails loudly.
 * During `next build`, Next sets NEXT_PHASE=phase-production-build; we use placeholders so static
 * prerender can finish (e.g. Vercel CI). Runtime must still set real vars — requests will fail otherwise.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && anonKey) {
    return { url, anonKey };
  }
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { url: BUILD_PLACEHOLDER_URL, anonKey: BUILD_PLACEHOLDER_ANON_KEY };
  }
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your Supabase project URL and anon key."
  );
}
