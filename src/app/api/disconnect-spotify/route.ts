import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// POST: Disconnect Spotify and delete related data
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    const supabase = createServiceClient();

    // Clear music history from user_data
    await supabase
      .from('user_data')
      .update({ music_history: [] })
      .eq('username', username);

    return NextResponse.json({ ok: true, message: 'Spotify disconnected and music data deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
