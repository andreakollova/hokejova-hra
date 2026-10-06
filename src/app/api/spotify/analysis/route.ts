import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const trackId = request.nextUrl.searchParams.get('id');
  if (!trackId) return NextResponse.json({ error: 'Missing track id' }, { status: 400 });

  const token = request.cookies.get('spotify_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const type = request.nextUrl.searchParams.get('type');

  // Try audio-features first (gives BPM/tempo)
  // audio-analysis was deprecated by Spotify in Nov 2024
  if (type === 'features') {
    const res = await fetch(
      `https://api.spotify.com/v1/audio-features/${trackId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ tempo: data.tempo, key: data.key, energy: data.energy });
    }

    // audio-features might also be deprecated, return default
    return NextResponse.json({ tempo: null });
  }

  // Fallback: try audio-analysis (probably won't work for new apps)
  const res = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Analysis not available' }, { status: 404 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
