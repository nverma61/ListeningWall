-- Community prompt ideas (run in Supabase SQL Editor if the app reports a missing table).
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS public.prompt_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  moderation_status public.moderation_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT prompt_suggestions_text_len CHECK (char_length(suggestion_text) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_created ON public.prompt_suggestions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_status ON public.prompt_suggestions (moderation_status, created_at DESC);

ALTER TABLE public.prompt_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prompt_suggestions_select_published ON public.prompt_suggestions;
CREATE POLICY prompt_suggestions_select_published ON public.prompt_suggestions
  FOR SELECT USING (moderation_status = 'published');

DROP POLICY IF EXISTS prompt_suggestions_insert_own ON public.prompt_suggestions;
CREATE POLICY prompt_suggestions_insert_own ON public.prompt_suggestions
  FOR INSERT WITH CHECK (author_profile_id = public.current_profile_id());

GRANT SELECT ON TABLE public.prompt_suggestions TO anon, authenticated;
GRANT INSERT ON TABLE public.prompt_suggestions TO authenticated;
