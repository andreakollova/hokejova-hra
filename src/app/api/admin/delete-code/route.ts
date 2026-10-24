import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

const ADMIN_KEY = 'kAe9kRW1JOZB';

export async function POST(req: NextRequest) {
  try {
    const { id, adminKey } = await req.json();
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = createServiceClient();

    // Get code info before deleting
    const { data: code } = await supabase
      .from('promo_codes')
      .select('code, type')
      .eq('id', id)
      .single();

    // Delete redemptions first
    if (code) {
      await supabase.from('promo_redemptions').delete().eq('code', code.code);
    }

    // Delete the code
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (code) {
      await sendSlackMessage(`🗑️ Admin deleted code \`${code.code}\` (${code.type})`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
