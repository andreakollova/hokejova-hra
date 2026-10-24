import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

// POST: Player redeems a club code
export async function POST(req: NextRequest) {
  try {
    const { code, username } = await req.json();
    if (!code || !username) return NextResponse.json({ error: 'Missing code or username' }, { status: 400 });

    const supabase = createServiceClient();
    const cleanCode = code.toUpperCase().trim();

    // Find the code
    const { data: clubCode, error: codeError } = await supabase
      .from('club_codes')
      .select('*, club_subscriptions!inner(id, club_name, status, current_period_end)')
      .eq('code', cleanCode)
      .single();

    if (codeError || !clubCode) return NextResponse.json({ error: 'Invalid club code' }, { status: 404 });

    // Check if club subscription is active
    const club = (clubCode as any).club_subscriptions;
    if (club.status !== 'active') return NextResponse.json({ error: 'This club subscription is no longer active' }, { status: 410 });

    // Check if code is already assigned to someone else
    if (clubCode.assigned_to && clubCode.assigned_to !== username) {
      return NextResponse.json({ error: 'This code is already assigned to another player' }, { status: 409 });
    }

    // Assign code to player
    await supabase.from('club_codes').update({
      assigned_to: username,
      assigned_at: new Date().toISOString(),
    }).eq('code', cleanCode);

    // Activate Premium for this player
    const expiresAt = club.current_period_end || new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

    // Update user subscription
    const { data: userData } = await supabase.from('user_data').select('settings').eq('username', username).single();
    const currentSettings = (userData?.settings as Record<string, unknown>) || {};
    await supabase.from('user_data').upsert({
      username,
      settings: {
        ...currentSettings,
        subscription: {
          type: 'club',
          clubName: club.club_name,
          clubId: club.id,
          code: cleanCode,
          expiresAt,
          activatedAt: new Date().toISOString(),
        },
      },
    }, { onConflict: 'username' });

    // Also set local subscription
    // Add club members as friends
    const { data: clubMembers } = await supabase
      .from('club_codes')
      .select('assigned_to')
      .eq('club_id', club.id)
      .not('assigned_to', 'is', null)
      .neq('assigned_to', username);

    const teammates = (clubMembers || []).map(m => m.assigned_to).filter(Boolean);

    await sendSlackMessage(`🏒 *${username}* joined club *${club.club_name}* with code \`${cleanCode}\``);

    return NextResponse.json({
      ok: true,
      clubName: club.club_name,
      expiresAt,
      teammates,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to redeem code' }, { status: 500 });
  }
}
