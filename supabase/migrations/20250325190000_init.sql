-- Listening Wall — initial schema, RLS, indexes
-- Requires: Supabase project with auth schema

CREATE EXTENSION IF NOT EXISTS citext;

-- Enums
CREATE TYPE public.user_role AS ENUM ('teen', 'parent', 'admin', 'moderator');
CREATE TYPE public.audience_type AS ENUM ('teens', 'parents', 'shared');
CREATE TYPE public.moderation_status AS ENUM (
  'published',
  'pending_review',
  'hidden',
  'removed'
);
CREATE TYPE public.risk_level AS ENUM ('none', 'low', 'medium', 'high');
CREATE TYPE public.report_target_type AS ENUM ('post', 'comment', 'user');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE public.reaction_type AS ENUM ('relate', 'thank_you', 'helpful');
CREATE TYPE public.digest_audience AS ENUM ('teens', 'parents', 'shared', 'all');
CREATE TYPE public.moderation_content_type AS ENUM ('post', 'comment', 'profile');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  username CITEXT NOT NULL UNIQUE,
  role_type public.user_role NOT NULL DEFAULT 'teen',
  bio TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  is_muted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (
    username ~ '^[a-zA-Z0-9_]{3,24}$'
  )
);

CREATE INDEX idx_profiles_auth_user ON public.profiles (auth_user_id);
CREATE INDEX idx_profiles_username ON public.profiles (username);

-- Topics
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  audience public.audience_type NOT NULL DEFAULT 'shared',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topics_audience ON public.topics (audience, is_active);

-- Prompts
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active_date DATE,
  audience public.audience_type NOT NULL DEFAULT 'shared',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompts_active ON public.prompts (active_date, audience, is_published);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  audience public.audience_type NOT NULL,
  topic_id UUID REFERENCES public.topics (id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES public.prompts (id) ON DELETE SET NULL,
  moderation_status public.moderation_status NOT NULL DEFAULT 'published',
  risk_level public.risk_level NOT NULL DEFAULT 'none',
  ai_summary_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  body_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_feed ON public.posts (audience, moderation_status, created_at DESC);
CREATE INDEX idx_posts_topic ON public.posts (topic_id, moderation_status, created_at DESC);
CREATE INDEX idx_posts_prompt ON public.posts (prompt_id, moderation_status, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts (author_profile_id, created_at DESC);
CREATE INDEX idx_posts_body_hash ON public.posts (author_profile_id, body_hash, created_at DESC);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  moderation_status public.moderation_status NOT NULL DEFAULT 'published',
  risk_level public.risk_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.comments (post_id, created_at);
CREATE INDEX idx_comments_author ON public.comments (author_profile_id);

-- Reactions (supportive types; one per type per user per post or comment)
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts (id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments (id) ON DELETE CASCADE,
  reaction_type public.reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reaction_target_one CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX uniq_reaction_post ON public.reactions (user_profile_id, post_id, reaction_type)
  WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX uniq_reaction_comment ON public.reactions (user_profile_id, comment_id, reaction_type)
  WHERE comment_id IS NOT NULL;
CREATE INDEX idx_reactions_post ON public.reactions (post_id);
CREATE INDEX idx_reactions_comment ON public.reactions (comment_id);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  target_type public.report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reason_code TEXT NOT NULL,
  description TEXT,
  status public.report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON public.reports (status, created_at DESC);

-- Blocks
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  blocked_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_profile_id, blocked_profile_id),
  CONSTRAINT blocks_no_self CHECK (blocker_profile_id <> blocked_profile_id)
);

CREATE INDEX idx_blocks_blocker ON public.blocks (blocker_profile_id);

-- Daily digests (AI)
CREATE TABLE public.daily_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience public.digest_audience NOT NULL DEFAULT 'all',
  topic_id UUID REFERENCES public.topics (id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES public.prompts (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_post_count INT NOT NULL DEFAULT 0,
  disclaimer_text TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_daily_digests_pub ON public.daily_digests (is_published, generated_at DESC);

-- Moderation events (audit)
CREATE TABLE public.moderation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type public.moderation_content_type NOT NULL,
  content_id UUID NOT NULL,
  moderation_label TEXT NOT NULL,
  confidence NUMERIC,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_events_content ON public.moderation_events (content_type, content_id);

-- Saved posts
CREATE TABLE public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, post_id)
);

CREATE INDEX idx_saved_posts_profile ON public.saved_posts (profile_id);

-- Feature flags
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_comments_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helper: current user's profile id
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
      AND role_type IN ('admin', 'moderator')
  );
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Topics: public read active
CREATE POLICY topics_select ON public.topics
  FOR SELECT USING (is_active = TRUE);

-- Prompts: public read published
CREATE POLICY prompts_select ON public.prompts
  FOR SELECT USING (is_published = TRUE);

-- Profiles
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    NOT is_banned
    OR auth.uid() = auth_user_id
  );

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Posts: read published, non-banned author, respect blocks when signed in
CREATE POLICY posts_select ON public.posts
  FOR SELECT USING (
    moderation_status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = posts.author_profile_id
        AND NOT p.is_banned
    )
    AND (
      auth.uid() IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.blocks b
        WHERE b.blocker_profile_id = public.current_profile_id()
          AND b.blocked_profile_id = posts.author_profile_id
      )
    )
  );

-- Authors can read own posts regardless of status
CREATE POLICY posts_select_author ON public.posts
  FOR SELECT USING (
    author_profile_id = public.current_profile_id()
  );

CREATE POLICY posts_insert ON public.posts
  FOR INSERT WITH CHECK (
    author_profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = author_profile_id
        AND p.auth_user_id = auth.uid()
        AND NOT p.is_banned
        AND NOT p.is_muted
    )
  );

CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE USING (author_profile_id = public.current_profile_id())
  WITH CHECK (author_profile_id = public.current_profile_id());

CREATE POLICY posts_delete_own ON public.posts
  FOR DELETE USING (author_profile_id = public.current_profile_id());

-- Comments
CREATE POLICY comments_select ON public.comments
  FOR SELECT USING (
    moderation_status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = comments.author_profile_id AND NOT p.is_banned
    )
    AND EXISTS (
      SELECT 1 FROM public.posts po
      WHERE po.id = comments.post_id
        AND po.moderation_status = 'published'
    )
    AND (
      auth.uid() IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.blocks b
        WHERE b.blocker_profile_id = public.current_profile_id()
          AND b.blocked_profile_id = comments.author_profile_id
      )
    )
  );

CREATE POLICY comments_select_author ON public.comments
  FOR SELECT USING (author_profile_id = public.current_profile_id());

CREATE POLICY comments_insert ON public.comments
  FOR INSERT WITH CHECK (
    author_profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = author_profile_id
        AND p.auth_user_id = auth.uid()
        AND NOT p.is_banned
        AND NOT p.is_muted
    )
  );

CREATE POLICY comments_update_own ON public.comments
  FOR UPDATE USING (author_profile_id = public.current_profile_id())
  WITH CHECK (author_profile_id = public.current_profile_id());

CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE USING (author_profile_id = public.current_profile_id());

-- Reactions
CREATE POLICY reactions_select ON public.reactions
  FOR SELECT USING (TRUE);

CREATE POLICY reactions_insert ON public.reactions
  FOR INSERT WITH CHECK (
    user_profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_profile_id
        AND p.auth_user_id = auth.uid()
        AND NOT p.is_banned
    )
  );

CREATE POLICY reactions_delete_own ON public.reactions
  FOR DELETE USING (user_profile_id = public.current_profile_id());

-- Reports: create only; no select for users (admin uses service role)
CREATE POLICY reports_insert ON public.reports
  FOR INSERT WITH CHECK (
    reporter_profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reporter_profile_id AND p.auth_user_id = auth.uid()
    )
  );

-- Blocks
CREATE POLICY blocks_select_own ON public.blocks
  FOR SELECT USING (blocker_profile_id = public.current_profile_id());

CREATE POLICY blocks_insert ON public.blocks
  FOR INSERT WITH CHECK (
    blocker_profile_id = public.current_profile_id()
  );

CREATE POLICY blocks_delete_own ON public.blocks
  FOR DELETE USING (blocker_profile_id = public.current_profile_id());

-- Daily digests: public read published only
CREATE POLICY daily_digests_select ON public.daily_digests
  FOR SELECT USING (is_published = TRUE);

-- Moderation events: no client access
-- saved_posts
CREATE POLICY saved_select ON public.saved_posts
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY saved_insert ON public.saved_posts
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY saved_delete ON public.saved_posts
  FOR DELETE USING (profile_id = public.current_profile_id());

-- Feature flags: authenticated read (keys are non-sensitive)
CREATE POLICY feature_flags_select ON public.feature_flags
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff policies for reports / digests / moderation_events via JWT would need custom claims.
-- MVP: admin UI uses service role server-side only.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;

-- anon: read-only on public content
GRANT SELECT ON TABLE public.topics TO anon;
GRANT SELECT ON TABLE public.prompts TO anon;
GRANT SELECT ON TABLE public.posts TO anon;
GRANT SELECT ON TABLE public.comments TO anon;
GRANT SELECT ON TABLE public.reactions TO anon;
GRANT SELECT ON TABLE public.daily_digests TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;

-- authenticated: app tables (admin mutations use service_role in server code)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.topics TO authenticated;
GRANT SELECT ON TABLE public.prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.reactions TO authenticated;
GRANT INSERT ON TABLE public.reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.blocks TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.saved_posts TO authenticated;
GRANT SELECT ON TABLE public.daily_digests TO authenticated;
GRANT SELECT ON TABLE public.feature_flags TO authenticated;
