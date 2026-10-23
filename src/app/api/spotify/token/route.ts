import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  let refreshToken = request.cookies.get('spotify_refresh_token')?.value;

  // If no cookie, try loading from Supabase by username
  if (!refreshToken) {
    const username = request.cookies.get('hb_username')?.value;
    if (username) {
      const { data } = await supabase
        .from('profiles')
        .select('spotify_refresh_token')
        .eq('username', username)
        .single();
      if (data?.spotify_refresh_token) {
        refreshToken = data.spotify_refresh_token;
      }
    }
  }

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }

  const tokens = await tokenRes.json();

  const response = NextResponse.json({ ok: true });

  // Restore refresh token cookie if it was loaded from DB
  response.cookies.set('spotify_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  response.cookies.set('spotify_access_token', tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  });

  response.cookies.set('spotify_token_client', tokens.access_token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  });

  return response;
}
