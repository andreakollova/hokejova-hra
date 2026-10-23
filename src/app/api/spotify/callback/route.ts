import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  const returnTo = request.cookies.get('spotify_return_to')?.value || '/trening';
  const username = request.cookies.get('hb_username')?.value;

  if (error || !code) {
    return NextResponse.redirect(new URL(`${returnTo}?spotify=error`, request.url));
  }

  const redirectUri = `${request.nextUrl.origin}/api/spotify/callback`;

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/trening?spotify=error', request.url));
  }

  const tokens = await tokenRes.json();

  // Save refresh token to Supabase profile so it persists across devices
  if (username && tokens.refresh_token) {
    await supabase
      .from('profiles')
      .upsert({ username, spotify_refresh_token: tokens.refresh_token }, { onConflict: 'username' })
      .then(() => {});
  }

  const response = NextResponse.redirect(new URL(`${returnTo}?spotify=connected`, request.url));
  response.cookies.delete('spotify_return_to');

  response.cookies.set('spotify_access_token', tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  });

  response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
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
