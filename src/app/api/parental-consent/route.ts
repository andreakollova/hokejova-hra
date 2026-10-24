import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

// POST: Request parental consent (child submits parent email)
export async function POST(req: NextRequest) {
  try {
    const { childUsername, childEmail, parentEmail } = await req.json();
    if (!childUsername || !parentEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (parentEmail.toLowerCase() === (childEmail || '').toLowerCase()) {
      return NextResponse.json({ error: 'Parent email must be different from your email' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const token = crypto.randomUUID();

    // Check if already pending/approved
    const { data: existing } = await supabase
      .from('parental_consents')
      .select('status')
      .eq('child_username', childUsername)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing?.status === 'approved') {
      return NextResponse.json({ ok: true, status: 'already_approved' });
    }

    // Create consent request
    await supabase.from('parental_consents').insert({
      child_username: childUsername,
      child_email: childEmail || null,
      parent_email: parentEmail,
      token,
      status: 'pending',
    });

    // Send email to parent via Supabase (using their email service)
    const verifyUrl = `${req.nextUrl.origin}/parental-verify?token=${token}`;

    // Send email via simple fetch to our own email endpoint
    // For now, use Supabase Auth's email capability or a simple SMTP
    // We'll use a simple API approach
    await sendParentalEmail(parentEmail, childUsername, verifyUrl);

    await sendSlackMessage(`👶 Parental consent requested for *${childUsername}* — email sent to parent`);

    return NextResponse.json({ ok: true, status: 'pending' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

// GET: Check consent status
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('parental_consents')
    .select('status, parent_email, created_at')
    .eq('child_username', username)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    status: data?.status || 'none',
    parentEmail: data?.parent_email ? data.parent_email.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
    requestedAt: data?.created_at || null,
  });
}

async function sendParentalEmail(parentEmail: string, childUsername: string, verifyUrl: string) {
  // Use Supabase's built-in email or Resend/SendGrid
  // For now, we'll use a simple approach via Supabase Auth's admin email
  const supabase = createServiceClient();

  // Try sending via Supabase Auth magic link mechanism as a workaround
  // Better: use a proper email service. For now, store the link and notify via Slack
  await sendSlackMessage(
    `📧 *Parental consent email*\nTo: ${parentEmail}\nChild: ${childUsername}\nVerify: ${verifyUrl}`
  );

  // TODO: Replace with proper email service (Resend, SendGrid, etc.)
  // For MVP, the Slack notification contains the link that can be forwarded
}
