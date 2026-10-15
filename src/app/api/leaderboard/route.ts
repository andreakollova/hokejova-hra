import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: fetch leaderboard
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'overall';
  const song = request.nextUrl.searchParams.get('song');
  const username = request.nextUrl.searchParams.get('user');

  if (type === 'song' && song) {
    // Per-song leaderboard
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('song_name', song)
      .order('score', { ascending: false })
      .limit(50);
    return NextResponse.json({ scores: data || [] });
  }

  if (type === 'personal' && username) {
    // Personal best per song
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('username', username)
      .order('score', { ascending: false })
      .limit(50);
    return NextResponse.json({ scores: data || [] });
  }

  // Overall: best score per user
  const { data } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(100);

  // Deduplicate: keep only best score per user
  const bestPerUser = new Map<string, Record<string, unknown>>();
  for (const row of (data || []) as Record<string, unknown>[]) {
    const username = row.username as string;
    const score = row.score as number;
    const existing = bestPerUser.get(username);
    if (!existing || score > (existing.score as number)) {
      bestPerUser.set(username, row);
    }
  }
  const ranked = [...bestPerUser.values()].sort((a, b) => (b.score as number) - (a.score as number));

  return NextResponse.json({ scores: ranked });
}

// POST: save a score
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, game_type, song_name, song_artist, song_bpm, difficulty, duration_seconds, score, accuracy, correct_passes, longest_streak, input_mode } = body;

  if (!username || !score || !difficulty) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Validate score bounds
  if (score < 0 || score > duration_seconds * 50) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const { data, error } = await supabase.from('scores').insert({
    username,
    game_type: game_type || 'slalom',
    song_name: song_name || null,
    song_artist: song_artist || null,
    song_bpm: song_bpm || null,
    difficulty,
    duration_seconds,
    score,
    accuracy: accuracy || 0,
    correct_passes: correct_passes || 0,
    longest_streak: longest_streak || 0,
    input_mode: input_mode || 'camera',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get user's rank
  const { count } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .gt('score', score);

  return NextResponse.json({ score: data, rank: (count || 0) + 1 });
}
