import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    // Redirect to client-side page that will exchange the code
    const url = new URL('/auth/complete', req.url);
    url.searchParams.set('code', code);
    url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
