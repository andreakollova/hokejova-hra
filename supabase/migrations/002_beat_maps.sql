-- Beat maps: admin-created beat patterns for Spotify tracks
CREATE TABLE IF NOT EXISTS beat_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  track_artist TEXT NOT NULL,
  track_album_art TEXT,
  track_duration_ms INTEGER NOT NULL,
  bpm INTEGER NOT NULL,
  beats JSONB NOT NULL, -- array of beat timestamps in seconds
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(spotify_track_id)
);

CREATE INDEX IF NOT EXISTS idx_beat_maps_track ON beat_maps(spotify_track_id);

ALTER TABLE beat_maps ENABLE ROW LEVEL SECURITY;

-- Everyone can read beat maps
CREATE POLICY "Beat maps are viewable by everyone"
  ON beat_maps FOR SELECT USING (true);

-- Only admins can insert/update (via service role key in API)
-- No RLS insert/update policy = only service role can write

CREATE TRIGGER update_beat_maps_updated_at
  BEFORE UPDATE ON beat_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
