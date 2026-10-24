import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';
import { Resend } from 'resend';

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

    // Send email to parent
    const verifyUrl = `${req.nextUrl.origin}/parental-verify?token=${token}`;
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
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Hockey Beats <noreply@hockeybeats.app>',
    to: parentEmail,
    subject: 'Your permission is requested for Hockey Beats',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <img src="https://www.hockeybeats.app/images/hb-logo-hero-dark.png" alt="Hockey Beats" style="height: 32px; margin-bottom: 32px;" />

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hello,</p>

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">A young player has requested permission to create a Hockey Beats account using your email address as their parent or legal guardian contact.</p>

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hockey Beats is an interactive hockey training platform that combines physical skills, camera-based gameplay, achievements, and optional music integrations.</p>

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hockey Beats is available to players aged 13 and older. Players aged 13–15 require parental or guardian permission.</p>

        <p style="color: #374151; font-size: 15px; line-height: 1.6;">Before making a decision, please review:</p>

        <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
          <li><a href="https://www.hockeybeats.app/terms" style="color: #059669;">Terms of Service</a></li>
          <li><a href="https://www.hockeybeats.app/privacy" style="color: #059669;">Privacy Policy</a></li>
          <li><a href="https://www.hockeybeats.app/parental-consent" style="color: #059669;">Parental Consent &amp; Children's Privacy Notice</a></li>
        </ul>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: #059669; color: white; font-weight: bold; font-size: 15px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">Review Permission Request</a>
        </div>

        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">If you did not expect this email or do not recognize the request, you can ignore it or contact <a href="mailto:studio@drixton.com" style="color: #6b7280;">studio@drixton.com</a>.</p>

        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">Receiving this email does not create a paid subscription or authorize any payment.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

        <p style="color: #9ca3af; font-size: 12px;">Thank you,<br /><strong>The Hockey Beats Team</strong><br />studio@drixton.com</p>
      </div>
    `,
  });

  await sendSlackMessage(`📧 Parental consent email sent to ${parentEmail} for *${childUsername}*`);
}
