import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getClubPlan } from '@/lib/club-plans';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { planId, clubName, email } = await req.json();
    const plan = getClubPlan(planId);
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    if (!clubName || !email) return NextResponse.json({ error: 'Missing club name or email' }, { status: 400 });

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      metadata: { planId, clubName, seats: String(plan.seats) },
      subscription_data: {
        metadata: { planId, clubName, seats: String(plan.seats) },
      },
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: plan.pricePerMonth,
          recurring: { interval: 'month' },
          product_data: {
            name: `HockeyBeats ${plan.label} (${plan.seats} players)`,
            description: `Club subscription for ${plan.seats} players. ${plan.discount}% discount. Premium access for all members.`,
          },
        },
        quantity: 1,
      }],
      success_url: `${req.nextUrl.origin}/club/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}&club=${encodeURIComponent(clubName)}`,
      cancel_url: `${req.nextUrl.origin}/club`,
    } as any);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
