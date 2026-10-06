-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 30),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training results
CREATE TABLE IF NOT EXISTS training_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('slalom', 'figure_eight')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds IN (30, 60, 90)),
  score INTEGER NOT NULL CHECK (score >= 0),
  accuracy INTEGER NOT NULL DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 100),
  correct_passes INTEGER NOT NULL DEFAULT 0,
  total_cones INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  challenge_version TEXT NOT NULL DEFAULT 'v1',
  input_mode TEXT NOT NULL DEFAULT 'camera' CHECK (input_mode IN ('camera', 'demo')),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_results_leaderboard
  ON training_results (game_type, difficulty, duration_seconds, input_mode, score DESC);

CREATE INDEX IF NOT EXISTS idx_results_user
  ON training_results (user_id, game_type, difficulty, duration_seconds, score DESC);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_results ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Training results: readable by all (for leaderboard), writable by owner
CREATE POLICY "Results are viewable by everyone"
  ON training_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own results"
  ON training_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Never expose emails in public queries
-- The profiles table intentionally does not include email;
-- email is only accessible via auth.users which is protected by Supabase.

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
