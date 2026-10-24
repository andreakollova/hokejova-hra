import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

// DELETE: Remove all user data (GDPR right to erasure)
export async function DELETE(req: NextRequest) {
  try {
    const { username, userId } = await req.json();
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    const supabase = createServiceClient();

    // Delete from all data tables
    await Promise.all([
      supabase.from('user_data').delete().eq('username', username),
      supabase.from('scores').delete().eq('username', username),
      supabase.from('page_views').delete().eq('username', username),
      supabase.from('promo_redemptions').delete().eq('username', username),
    ]);

    // Delete Supabase Auth user if userId provided
    if (userId) {
      await supabase.auth.admin.deleteUser(userId);
    }

    await sendSlackMessage(`🗑️ *${username}* deleted their account and all data.`);

    return NextResponse.json({ ok: true, message: 'All user data and auth account deleted' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
