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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const username = session.metadata?.username;
    const plan = session.metadata?.plan;

    if (username) {
      const expiresAt = new Date();
      if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Save subscription to user_data
      await supabase.from('user_data').upsert({
        username,
        settings: {
          subscription: {
            type: plan,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            expiresAt: expiresAt.toISOString(),
            activatedAt: new Date().toISOString(),
          },
        },
      }, { onConflict: 'username' });

      await sendSlackMessage(`💰 *${username}* subscribed to HockeyBeats Premium (${plan})!`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const username = sub.metadata?.username;
    if (username) {
      await sendSlackMessage(`❌ *${username}* cancelled their Premium subscription.`);
    }
  }

  return NextResponse.json({ received: true });
}
