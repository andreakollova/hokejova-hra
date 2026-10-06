import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ tracks: [] });

  const token = request.cookies.get('spotify_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const res = await fetch(
    `https://api.spotify.com/v1/search?${new URLSearchParams({
      q,
      type: 'track',
      limit: '10',
    })}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ tracks: data.tracks?.items || [] });
}
