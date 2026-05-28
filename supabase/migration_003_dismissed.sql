-- Dismissed activities (negative preference signal)
CREATE TABLE IF NOT EXISTS dismissed_activities (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_dismissed_user ON dismissed_activities(user_id);

ALTER TABLE dismissed_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own dismissals" ON dismissed_activities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
