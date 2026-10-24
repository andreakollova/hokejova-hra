import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

const ADMIN_KEY = 'kAe9kRW1JOZB';

export async function POST(req: NextRequest) {
  try {
    const { codes, type, clubName, adminKey } = await req.json();

    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!codes || !Array.isArray(codes) || codes.length === 0 || !type) {
      return NextResponse.json({ error: 'Missing codes or type' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const rows = codes.map((code: string) => ({
      code,
      type,
      max_uses: 1,
      used_count: 0,
      club_name: clubName || null,
    }));

    const { error } = await supabase.from('promo_codes').insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendSlackMessage(`🎟️ Admin generated ${codes.length} *${type}* code(s)${clubName ? ` for club: ${clubName}` : ''}`);

    return NextResponse.json({ ok: true, count: codes.length });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
