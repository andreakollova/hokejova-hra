import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

const ADMIN_KEY = 'kAe9kRW1JOZB';

export async function GET(req: NextRequest) {
  const adminKey = req.nextUrl.searchParams.get('adminKey');
  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get all promo codes
  const { data: promoCodes, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get redemptions to match codes with users
  const { data: redemptions } = await supabase
    .from('promo_redemptions')
    .select('code, username, created_at');

  // Get user emails from user_data
  const usernames = [...new Set((redemptions || []).map(r => r.username))];
  let userEmails: Record<string, string> = {};

  if (usernames.length > 0) {
    // Try to get emails from Supabase Auth via user_data settings or auth
    const { data: users } = await supabase
      .from('user_data')
      .select('username, settings')
      .in('username', usernames);

    // We don't have emails in user_data directly, but we can check auth
    // For now, just show username
  }

  const redemptionMap: Record<string, { username: string; email?: string }> = {};
  for (const r of redemptions || []) {
    redemptionMap[r.code] = { username: r.username };
  }

  const codes = (promoCodes || []).map(c => ({
    ...c,
    assigned_to: redemptionMap[c.code]?.username || null,
    assigned_email: redemptionMap[c.code]?.email || null,
  }));

  return NextResponse.json({ codes });
}
