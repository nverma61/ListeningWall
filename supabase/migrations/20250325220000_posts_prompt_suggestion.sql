-- Link posts to community prompt ideas (optional; distinct from official prompts.prompt_id)

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS prompt_suggestion_id UUID REFERENCES public.prompt_suggestions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_prompt_suggestion ON public.posts (prompt_suggestion_id)
  WHERE prompt_suggestion_id IS NOT NULL;

COMMENT ON COLUMN public.posts.prompt_suggestion_id IS 'Optional link to a published community prompt suggestion';
