import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

// POST: Parent approves or denies consent
export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();
    if (!token || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find the consent request
    const { data: consent, error } = await supabase
      .from('parental_consents')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !consent) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    if (consent.status !== 'pending') {
      return NextResponse.json({ error: 'This request has already been processed', status: consent.status }, { status: 409 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'denied';

    // Update consent status
    await supabase
      .from('parental_consents')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', consent.id);

    // Update user_data with parental consent status
    if (newStatus === 'approved') {
      const { data: userData } = await supabase
        .from('user_data')
        .select('settings')
        .eq('username', consent.child_username)
        .single();

      const currentSettings = (userData?.settings as Record<string, unknown>) || {};
      await supabase.from('user_data').upsert({
        username: consent.child_username,
        settings: {
          ...currentSettings,
          parentalConsent: {
            status: 'approved',
            parentEmail: consent.parent_email,
            approvedAt: new Date().toISOString(),
          },
        },
      }, { onConflict: 'username' });
    }

    const emoji = newStatus === 'approved' ? '✅' : '❌';
    await sendSlackMessage(`${emoji} Parental consent *${newStatus}* for *${consent.child_username}* by ${consent.parent_email}`);

    return NextResponse.json({ ok: true, status: newStatus });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
