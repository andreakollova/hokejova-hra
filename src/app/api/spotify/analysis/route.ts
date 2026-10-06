import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const trackId = request.nextUrl.searchParams.get('id');
  if (!trackId) return NextResponse.json({ error: 'Missing track id' }, { status: 400 });

  const token = request.cookies.get('spotify_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Get audio analysis (beat timestamps, tempo, etc.)
  const res = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
