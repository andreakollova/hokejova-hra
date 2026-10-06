// Spotify API helpers

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

export function getSpotifyAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/api/spotify/callback`
    : '';

  const params = new URLSearchParams({
    client_id: clientId || '',
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'false',
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  durationMs: number;
  uri: string;
}

export interface BeatMap {
  tempo: number;
  beats: number[]; // timestamps in seconds
  bars: number[];
  sections: { start: number; tempo: number }[];
  durationS: number;
}

export function parseTrack(track: Record<string, unknown>): SpotifyTrack {
  const artists = track.artists as { name: string }[];
  const album = track.album as { name: string; images: { url: string }[] };
  return {
    id: track.id as string,
    name: track.name as string,
    artists: artists.map((a) => a.name).join(', '),
    album: album.name,
    albumArt: album.images?.[0]?.url || '',
    durationMs: track.duration_ms as number,
    uri: track.uri as string,
  };
}

export function parseAnalysis(data: Record<string, unknown>): BeatMap {
  const track = data.track as { tempo: number; duration: number };
  const beats = (data.beats as { start: number }[]) || [];
  const bars = (data.bars as { start: number }[]) || [];
  const sections = (data.sections as { start: number; tempo: number }[]) || [];

  return {
    tempo: Math.round(track.tempo),
    beats: beats.map((b) => b.start),
    bars: bars.map((b) => b.start),
    sections: sections.map((s) => ({ start: s.start, tempo: Math.round(s.tempo) })),
    durationS: track.duration,
  };
}
