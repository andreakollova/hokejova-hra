import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Valid configurations
const VALID_GAME_TYPES = ['slalom', 'figure_eight'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_DURATIONS = [30, 60, 90];
const MAX_SCORE_PER_SECOND = 50; // Reasonable max score rate

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    // Also check cookie-based auth
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Try to get user from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const accessTokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);

    let userId: string | null = null;

    if (token) {
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId && accessTokenMatch) {
      try {
        const decoded = JSON.parse(decodeURIComponent(accessTokenMatch[1]));
        if (decoded?.access_token) {
          const { data: { user } } = await supabaseClient.auth.getUser(decoded.access_token);
          userId = user?.id || null;
        }
      } catch {}
    }

    // Allow unauthenticated submissions but don't save to leaderboard
    const body = await request.json();

    const {
      game_type,
      difficulty,
      duration_seconds,
      score,
      accuracy,
      correct_passes,
      total_cones,
      longest_streak,
      challenge_version,
      input_mode,
      session_id,
    } = body;

    // Validate required fields
    if (!game_type || !difficulty || !duration_seconds || score === undefined || !session_id) {
      return NextResponse.json({ error: 'Chybajuce polia' }, { status: 400 });
    }

    // Validate game configuration
    if (!VALID_GAME_TYPES.includes(game_type)) {
      return NextResponse.json({ error: 'Neplatny typ hry' }, { status: 400 });
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ error: 'Neplatna obtaznost' }, { status: 400 });
    }
    if (!VALID_DURATIONS.includes(duration_seconds)) {
      return NextResponse.json({ error: 'Neplatna dlzka' }, { status: 400 });
    }

    // Validate score bounds
    if (score < 0 || score > duration_seconds * MAX_SCORE_PER_SECOND) {
      return NextResponse.json({ error: 'Skore mimo rozsahu' }, { status: 400 });
    }

    // Check for duplicate session
    if (userId) {
      const { data: existing } = await supabaseClient
        .from('training_results')
        .select('id')
        .eq('session_id', session_id)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Session uz existuje' }, { status: 409 });
      }

      // Demo results don't go to leaderboard
      const { error } = await supabaseClient.from('training_results').insert({
        user_id: userId,
        game_type,
        difficulty,
        duration_seconds,
        score: Math.round(score),
        accuracy: Math.round(accuracy || 0),
        correct_passes: correct_passes || 0,
        total_cones: total_cones || 0,
        longest_streak: longest_streak || 0,
        challenge_version: challenge_version || 'v1',
        input_mode: input_mode || 'camera',
        session_id,
      });

      if (error) {
        console.error('DB insert error:', error);
        return NextResponse.json({ error: 'Chyba pri ukladani' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Score API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
