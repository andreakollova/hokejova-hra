import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: list all beat maps (public)
export async function GET() {
  const { data, error } = await supabase
    .from('beat_maps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ beatMaps: data });
}

// POST: save a beat map (admin only - protected by secret header)
export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    spotify_track_id,
    track_name,
    track_artist,
    track_album_art,
    track_duration_ms,
    bpm,
    beats,
  } = body;

  if (!spotify_track_id || !track_name || !beats || !Array.isArray(beats) || beats.length < 4) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('beat_maps')
    .upsert(
      {
        spotify_track_id,
        track_name,
        track_artist: track_artist || '',
        track_album_art: track_album_art || '',
        track_duration_ms: track_duration_ms || 0,
        bpm: bpm || Math.round(60 / ((beats[beats.length - 1] - beats[0]) / (beats.length - 1))),
        beats,
      },
      { onConflict: 'spotify_track_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ beatMap: data });
}

// DELETE: remove a beat map
export async function DELETE(request: NextRequest) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  const { error } = await supabase.from('beat_maps').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
