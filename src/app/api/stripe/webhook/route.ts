import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { sendSlackMessage } from '@/lib/slack';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Trial started (checkout completed with trial)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const username = session.metadata?.username;
    const plan = session.metadata?.plan;

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

  // First real payment after trial
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const sub = invoice.subscription as string;
    if (sub && invoice.billing_reason === 'subscription_cycle') {
      // Recurring payment
      const subscription = await stripe.subscriptions.retrieve(sub);
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
