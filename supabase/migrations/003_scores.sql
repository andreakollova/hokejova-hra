-- Simple scores table (no auth required, uses username)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'slalom',
  song_name TEXT,
  song_artist TEXT,
  song_bpm INTEGER,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_seconds INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  accuracy INTEGER NOT NULL DEFAULT 0,
  correct_passes INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  input_mode TEXT NOT NULL DEFAULT 'camera',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_ranking ON scores(game_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(username, game_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_song ON scores(song_name, difficulty, score DESC);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores are viewable by everyone"
  ON scores FOR SELECT USING (true);
