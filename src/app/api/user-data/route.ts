import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, engagement, friends, music_history, settings, avatar } = body;

    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    const supabase = createServiceClient();

    const updateData: Record<string, unknown> = { username, updated_at: new Date().toISOString() };
    if (engagement !== undefined) updateData.engagement = engagement;
    if (friends !== undefined) updateData.friends = friends;
    if (music_history !== undefined) updateData.music_history = music_history;
    if (settings !== undefined) updateData.settings = settings;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data, error } = await supabase
      .from('user_data')
      .upsert(updateData, { onConflict: 'username' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
