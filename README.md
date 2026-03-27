# Listening Wall

A quieter place to say what you really feel. Anonymous sharing for teens and parents, designed for honesty, reflection, and understanding.
## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui
- Supabase (Auth, Postgres, Row Level Security)
- React Hook Form + Zod, TanStack Query, Framer Motion, Lucide

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

## 1. Clone and install

```bash
npm install
```

## 2. Supabase setup

1. Create a project in Supabase.
2. Enable **Email** auth (email + password) under **Authentication → Providers**.
   - Turn **email confirmations OFF** for this MVP if you want immediate account access without inbox verification.
3. Under **Authentication → URL Configuration**, set:
   - **Site URL**: `http://localhost:3000` (and your Vercel URL in production)
   - **Redirect URLs**: `http://localhost:3000/auth/callback` and `https://your-domain.com/auth/callback`
4. Open **SQL Editor** and run the migration files **in order**:
   - [`supabase/migrations/20250325190000_init.sql`](supabase/migrations/20250325190000_init.sql)
   - [`supabase/migrations/20250325210000_prompt_suggestions.sql`](supabase/migrations/20250325210000_prompt_suggestions.sql) (required for **Prompts → Suggest a prompt**)
5. Seed topics and prompts (same SQL editor, or from the project root):

After the migrations succeed, either paste and run [`supabase/seed.sql`](supabase/seed.sql) in the SQL Editor, or run `npm run seed` (uses `.env.local` and the service role key).

**Order matters:** migrations first, then seed. If you see `Could not find the table 'public.topics'`, the first migration has not been applied yet. If prompt suggestions fail with `prompt_suggestions`, run the second migration file.

6. Copy **Project URL**, **anon** key, and **service_role** key from **Project Settings → API**.

## 3. Environment variables

```bash
cp .env.example .env.local
```

Put **real keys only in `.env.local`** (gitignored). Keep `.env.example` as placeholders so it is safe to commit.

Fill in:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (server only; never in client bundles) |

## 4. Local development

```bash
npm run dev
```

Open **http://localhost:3000** or **http://127.0.0.1:3000**. The dev script listens on port **3000** on all interfaces (`0.0.0.0`).

If the project folder name contains **spaces** (e.g. `Desktop/Listening Wall`), some tools mis-resolve assets; prefer cloning into a path like `~/projects/listening-wall` if anything still looks broken.

### If the app “does not load” or looks wrong

1. **Wrong port** — If something else is using port 3000, `next dev` will exit with “Port 3000 is already in use.” Stop the other process (or run `lsof -i :3000` on macOS) and run `npm run dev` again.
2. **Missing env** — Ensure `.env.local` exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Without them, the app throws a clear error in the terminal or browser console.
3. **`EMFILE: too many open files`** — On macOS, file watchers can hit system limits. Try:
   ```bash
   ulimit -n 10240
   npm run dev
   ```
   Or use polling (slower file watching):
   ```bash
   npm run dev:poll
   ```
4. **Use IPv4** — Prefer `http://127.0.0.1:3000` if `localhost` resolves oddly on your machine.
5. **CSS looks unstyled** — Only one dev server on port 3000. Run `rm -rf .next && npm run dev` (or `npm run dev:clean`), hard-refresh (disable cache), and in DevTools → Network confirm `/_next/static/css/*.css` returns **200**. Prefer a project path **without spaces** (e.g. `listening-wall` not `Listening Wall`). Tailwind + PostCSS live in **dependencies** so production builds still compile CSS.

### First-time user flow

1. **Sign in / Sign up** with email and password.
2. Complete **onboarding** (username + teen/parent + guidelines).
3. Browse **The Wall**, **Create post**, topics, and prompts.

### Admin / moderator

1. Sign up once, then in Supabase **SQL Editor**:

```sql
update public.profiles
set role_type = 'admin'
where auth_user_id = 'YOUR_AUTH_USER_UUID';
```

(`YOUR_AUTH_USER_UUID` is in **Authentication → Users**.)

2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set locally so **Admin** pages can list reports and users.

### Optional seed script

If your shell has the same env vars as the app:

```bash
npm run seed
```

This re-upserts core topics/prompts via the service role (see [`scripts/seed.ts`](scripts/seed.ts)). You still need SQL migrations applied first.

## 5. Deploy to Vercel

1. Push the repo to GitHub/GitLab and import the project in [Vercel](https://vercel.com).
2. Add the same environment variables in **Project → Settings → Environment Variables** (include `SUPABASE_SERVICE_ROLE_KEY` for admin tooling).
3. Run both SQL migrations on your hosted Supabase project (same order as local).
4. Update Supabase **URL Configuration** with your production URL and `/auth/callback` redirect.

## 6. Supabase CLI (optional)

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_REF
# Then you can use supabase db push / migration workflows per Supabase docs.
```

## Project layout (high level)

- `app/` — routes (marketing, auth, `(app)` shell with wall, thread, admin, …)
- `app/actions/` — server actions (posts, comments, moderation, …)
- `components/` — UI and app-specific components
- `lib/supabase/` — browser/server/admin Supabase clients
- `lib/moderation/` — keyword / heuristic scan (swappable for a provider later)
- `supabase/migrations/` — schema + RLS
- `supabase/seed.sql` — topics, prompts, feature flags

## Launch checklist

- [ ] Both migrations applied; `npm run seed` (or `seed.sql`) completed without errors.
- [ ] `.env.local` (or Vercel env) has URL, anon key, and service role key.
- [ ] Supabase **Authentication → URL Configuration**: Site URL + redirect URL `…/auth/callback` for prod and local.
- [ ] At least one `profiles.role_type = 'admin'` for moderation.
- [ ] Smoke test: home → sign in → onboarding → create post → thread → report (signed in) → prompt suggestion (if using that feature).

## Safety note

Listening Wall is for **reflection and peer support**, not emergency or clinical care. Crisis copy and disclaimers are embedded in the product; localize hotlines for your audience over time.

## License

Private / your terms — adjust as needed.
