/**
 * Optional: upsert topics & prompts using the service role.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env.
 * Run after SQL migrations. Does not create auth users or sample posts.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const topics = [
  {
    name: "School stress",
    slug: "school-stress",
    description: "Pressure, grades, and everyday school life.",
    audience: "teens",
    is_active: true,
  },
  {
    name: "Friendship",
    slug: "friendship",
    description: "Belonging, conflict, and growing connections.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Loneliness",
    slug: "loneliness",
    description: "When it feels quiet on the inside.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Family communication",
    slug: "family-communication",
    description: "Talking and listening across generations.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Boundaries",
    slug: "boundaries",
    description: "Saying what you need with care.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Mental load",
    slug: "mental-load",
    description: "Invisible labor and emotional weight.",
    audience: "parents",
    is_active: true,
  },
  {
    name: "Trust",
    slug: "trust",
    description: "Repair, consistency, and safety.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Screen time",
    slug: "screen-time",
    description: "Balance, habits, and expectations.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Independence",
    slug: "independence",
    description: "Growing autonomy with support.",
    audience: "teens",
    is_active: true,
  },
  {
    name: "Conflict",
    slug: "conflict",
    description: "Disagreement without losing connection.",
    audience: "shared",
    is_active: true,
  },
  {
    name: "Feeling misunderstood",
    slug: "feeling-misunderstood",
    description: "When words do not seem to land.",
    audience: "shared",
    is_active: true,
  },
];

async function main() {
  const { error: tErr } = await admin.from("topics").upsert(topics, {
    onConflict: "slug",
  });
  if (tErr) {
    console.error("topics:", tErr.message);
    process.exit(1);
  }
  console.log("Upserted topics:", topics.length);

  const today = new Date().toISOString().slice(0, 10);
  const prompts = [
    {
      prompt_text: "What is one thing you wish adults understood about your week?",
      slug: "wish-adults-understood-week",
      active_date: today,
      audience: "teens",
      is_published: true,
    },
    {
      prompt_text: "What helps you feel grounded when everything feels loud?",
      slug: "grounded-when-loud",
      active_date: null,
      audience: "teens",
      is_published: true,
    },
    {
      prompt_text: "Where do you feel most seen right now—and where do you feel invisible?",
      slug: "seen-and-invisible",
      active_date: null,
      audience: "shared",
      is_published: true,
    },
    {
      prompt_text: "What is a boundary you are learning to hold with kindness?",
      slug: "boundary-with-kindness",
      active_date: today,
      audience: "parents",
      is_published: true,
    },
  ];

  const { error: pErr } = await admin.from("prompts").upsert(prompts, {
    onConflict: "slug",
  });
  if (pErr) {
    console.error("prompts:", pErr.message);
    process.exit(1);
  }
  console.log("Upserted prompts:", prompts.length);

  const { error: fErr } = await admin.from("feature_flags").upsert(
    [{ key: "resource_banner_enabled", value: true }],
    { onConflict: "key" }
  );
  if (fErr) {
    console.error("feature_flags:", fErr.message);
    process.exit(1);
  }
  console.log("Upserted feature_flags: 1");
  console.log("Done.");
}

main();
