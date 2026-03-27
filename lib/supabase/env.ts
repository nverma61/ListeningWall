/** RFC 2606 reserved — fails fast if anything actually fetches during prerender. */
const BUILD_PLACEHOLDER_URL = "https://invalid.invalid";
/** Valid-length JWT-shaped string so @supabase/ssr accepts it during `next build` when env is unset. */
const BUILD_PLACEHOLDER_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.build-placeholder-not-for-runtime";

function isNextProductionBuildProcess(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

/**
 * Validates public Supabase env. Call from server/client/middleware so misconfiguration fails loudly.
 * During `next build`, Next sets NEXT_PHASE=phase-production-build (and npm sets npm_lifecycle_event=build);
 * we use placeholders so static prerender can finish (e.g. Vercel). Runtime must still set real vars.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && anonKey) {
    return { url, anonKey };
  }
  if (isNextProductionBuildProcess()) {
    return { url: BUILD_PLACEHOLDER_URL, anonKey: BUILD_PLACEHOLDER_ANON_KEY };
  }
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your Supabase project URL and anon key."
  );
}
