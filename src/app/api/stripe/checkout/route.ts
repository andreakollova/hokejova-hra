import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { plan, username, email, coupon } = await req.json();

    const prices: Record<string, { amount: number; interval: 'month' | 'year' }> = {
      monthly: { amount: 845, interval: 'month' },
      yearly: { amount: 7999, interval: 'year' },
    };

    const p = prices[plan];
    if (!p) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      metadata: { username, plan },
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: p.amount,
          recurring: { interval: p.interval },
          product_data: {
            name: `HockeyBeats Premium (${plan === 'yearly' ? 'Yearly' : 'Monthly'})`,
            description: 'Unlock all games, new games included automatically.',
          },
        },
        quantity: 1,
      }],
      success_url: `${req.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/dashboard`,
    };

    // Apply coupon if provided
    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
