import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Trial started (checkout completed with trial)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const username = session.metadata?.username;
    const plan = session.metadata?.plan;

    // Club subscription
    const clubName = session.metadata?.clubName;
    const seats = parseInt(session.metadata?.seats || '0');
    if (clubName && seats > 0) {
      const periodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
      const { data: club } = await supabase.from('club_subscriptions').insert({
        club_name: clubName,
        club_email: session.customer_email || '',
        plan_id: session.metadata?.planId || '',
        seats,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      }).select('id').single();

      if (club) {
        // Generate codes
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const codes: { club_id: number; code: string }[] = [];
        for (let i = 0; i < seats; i++) {
          let code = 'HB-';
          for (let j = 0; j < 8; j++) {
            code += chars[Math.floor(Math.random() * chars.length)];
            if (j === 3) code += '-';
          }
          codes.push({ club_id: club.id, code });
        }
        await supabase.from('club_codes').insert(codes);
        await sendSlackMessage(`🏒 Club *${clubName}* subscribed! ${seats} codes generated. Plan: ${session.metadata?.planId}`);
      }
    }

    if (username) {
      // Trial: 7 days from now, then subscription starts
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(trialEndsAt);
      if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase.from('user_data').upsert({
        username,
        settings: {
          subscription: {
            type: plan,
            status: 'trialing',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            trialEndsAt: trialEndsAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            activatedAt: new Date().toISOString(),
          },
        },
      }, { onConflict: 'username' });

      await sendSlackMessage(`🎉 *${username}* started 7-day Premium trial (${plan})!`);
    }
  }

  // Club subscription renewal - extend existing codes
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any;
    const subId = invoice.subscription as string;
    if (subId) {
      // Check if this is a club subscription
      const { data: clubSub } = await supabase
        .from('club_subscriptions')
        .select('id, club_name')
        .eq('stripe_subscription_id', subId)
        .single();

      if (clubSub) {
        const newPeriodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
        await supabase.from('club_subscriptions').update({
          status: 'active',
          current_period_end: newPeriodEnd.toISOString(),
        }).eq('id', clubSub.id);

        // Extend all assigned players' subscriptions
        const { data: assignedCodes } = await supabase
          .from('club_codes')
          .select('assigned_to')
          .eq('club_id', clubSub.id)
          .not('assigned_to', 'is', null);

        for (const code of assignedCodes || []) {
          if (code.assigned_to) {
            const { data: ud } = await supabase.from('user_data').select('settings').eq('username', code.assigned_to).single();
            const s = (ud?.settings as any) || {};
            if (s.subscription?.type === 'club') {
              await supabase.from('user_data').update({
                settings: { ...s, subscription: { ...s.subscription, expiresAt: newPeriodEnd.toISOString() } },
              }).eq('username', code.assigned_to);
            }
          }
        }

        await sendSlackMessage(`🔄 Club *${clubSub.club_name}* renewed. All ${assignedCodes?.length || 0} player licenses extended.`);
      }
    }
  }

  // First real payment after trial (individual)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any;
    const sub = invoice.subscription as string;
    if (sub && invoice.billing_reason === 'subscription_cycle') {
      // Recurring payment
      const subscription = await getStripe().subscriptions.retrieve(sub);
      const username = subscription.metadata?.username;
      if (username) {
        await sendSlackMessage(`💰 *${username}* — recurring payment received (€${((invoice.amount_paid || 0) / 100).toFixed(2)})`);
      }
    }
  }

  // Subscription cancelled
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const username = sub.metadata?.username;
    if (username) {
      await supabase.from('user_data').update({
        settings: { subscription: { type: 'cancelled', status: 'cancelled', cancelledAt: new Date().toISOString() } },
      }).eq('username', username);

      await sendSlackMessage(`❌ *${username}* cancelled their Premium subscription.`);
    }
  }

  // Trial will end soon (send reminder)
  if (event.type === 'customer.subscription.trial_will_end') {
    const sub = event.data.object as Stripe.Subscription;
    const username = sub.metadata?.username;
    if (username) {
      await sendSlackMessage(`⏰ *${username}*'s trial ends in 3 days. First charge coming up.`);
    }
  }

  return NextResponse.json({ received: true });
}
