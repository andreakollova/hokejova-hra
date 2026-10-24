import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// DELETE: Remove all user data (GDPR right to erasure)
export async function DELETE(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    const supabase = createServiceClient();

    // Delete from all tables
    await Promise.all([
      supabase.from('user_data').delete().eq('username', username),
      supabase.from('scores').delete().eq('username', username),
      supabase.from('page_views').delete().eq('username', username),
    ]);

    return NextResponse.json({ ok: true, message: 'All user data deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
