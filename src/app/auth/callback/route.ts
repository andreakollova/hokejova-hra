import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    // Try server-side exchange first
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, req.url));
      }
    } catch {}

    // Fallback: redirect to client-side exchange
    const url = new URL('/auth/complete', req.url);
    url.searchParams.set('code', code);
    url.searchParams.set('next', next);
    return NextResponse.redirect(url);
  }

  // No code - check for hash fragment (implicit flow)
  return NextResponse.redirect(new URL('/auth/complete?next=' + encodeURIComponent(next), req.url));
}
