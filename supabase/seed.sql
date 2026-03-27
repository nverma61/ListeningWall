-- Seed topics and prompts (no auth users required)
-- Run after migrations: psql or Supabase SQL editor

INSERT INTO public.topics (name, slug, description, audience, is_active) VALUES
  ('School stress', 'school-stress', 'Pressure, grades, and everyday school life.', 'teens', true),
  ('Friendship', 'friendship', 'Belonging, conflict, and growing connections.', 'shared', true),
  ('Loneliness', 'loneliness', 'When it feels quiet on the inside.', 'shared', true),
  ('Family communication', 'family-communication', 'Talking and listening across generations.', 'shared', true),
  ('Boundaries', 'boundaries', 'Saying what you need with care.', 'shared', true),
  ('Mental load', 'mental-load', 'Invisible labor and emotional weight.', 'parents', true),
  ('Trust', 'trust', 'Repair, consistency, and safety.', 'shared', true),
  ('Screen time', 'screen-time', 'Balance, habits, and expectations.', 'shared', true),
  ('Independence', 'independence', 'Growing autonomy with support.', 'teens', true),
  ('Conflict', 'conflict', 'Disagreement without losing connection.', 'shared', true),
  ('Feeling misunderstood', 'feeling-misunderstood', 'When words do not seem to land.', 'shared', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.prompts (prompt_text, slug, active_date, audience, is_published) VALUES
  ('What is one thing you wish adults understood about your week?', 'wish-adults-understood-week', CURRENT_DATE, 'teens', true),
  ('What helps you feel grounded when everything feels loud?', 'grounded-when-loud', CURRENT_DATE - 1, 'teens', true),
  ('Where do you feel most seen right now—and where do you feel invisible?', 'seen-and-invisible', CURRENT_DATE - 2, 'shared', true),
  ('What is a boundary you are learning to hold with kindness?', 'boundary-with-kindness', CURRENT_DATE, 'parents', true),
  ('What is one small moment of connection you are grateful for lately?', 'small-moment-connection', CURRENT_DATE - 3, 'shared', true),
  ('What would “good enough” look like for you this season?', 'good-enough-season', CURRENT_DATE - 4, 'parents', true),
  ('When you feel misunderstood, what do you most want someone to ask you?', 'want-someone-to-ask', CURRENT_DATE - 5, 'teens', true),
  ('What is something you are proud of that rarely gets noticed?', 'proud-unnoticed', CURRENT_DATE - 6, 'shared', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.feature_flags (key, value) VALUES
  ('resource_banner_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
