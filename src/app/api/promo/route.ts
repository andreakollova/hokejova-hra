import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

// POST: Redeem a promo code
export async function POST(req: NextRequest) {
  try {
    const { code, username } = await req.json();
    if (!code || !username) return NextResponse.json({ error: 'Missing code or username' }, { status: 400 });

    const supabase = createServiceClient();

    // Check code in promo_codes table
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !promo) return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    if (promo.max_uses > 0 && promo.used_count >= promo.max_uses) return NextResponse.json({ error: 'This code has been fully redeemed' }, { status: 410 });

    // Check if user already used this code
    const { data: existing } = await supabase
      .from('promo_redemptions')
      .select('id')
      .eq('username', username)
      .eq('code', promo.code)
      .single();

    if (existing) return NextResponse.json({ error: 'You already used this code' }, { status: 409 });

    // Calculate expiry
    const now = new Date();
    let expiresAt: string | null = null;
    if (promo.type === '1month') { now.setMonth(now.getMonth() + 1); expiresAt = now.toISOString(); }
    else if (promo.type === '3months') { now.setMonth(now.getMonth() + 3); expiresAt = now.toISOString(); }
    // lifetime = no expiry

    // Save redemption
    await supabase.from('promo_redemptions').insert({ username, code: promo.code, type: promo.type });

    // Increment used count
    await supabase.from('promo_codes').update({ used_count: promo.used_count + 1 }).eq('id', promo.id);

    // Update user subscription
    await supabase.from('user_data').upsert({
      username,
      settings: {
        subscription: {
          type: promo.type === 'lifetime' ? 'lifetime' : 'promo',
          promoCode: promo.code,
          promoType: promo.type,
          expiresAt,
          activatedAt: new Date().toISOString(),
        },
      },
    }, { onConflict: 'username' });

    await sendSlackMessage(`🎟️ *${username}* redeemed promo code \`${promo.code}\` (${promo.type})${promo.club_name ? ` — Club: ${promo.club_name}` : ''}`);

    return NextResponse.json({ ok: true, type: promo.type, expiresAt });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
