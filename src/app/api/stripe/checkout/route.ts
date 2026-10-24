import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { plan, username, email, coupon } = await req.json();

    const prices: Record<string, { amount: number; interval: 'month' | 'year' }> = {
      monthly: { amount: 845, interval: 'month' },
      yearly: { amount: 7999, interval: 'year' },
    };

    const p = prices[plan];
    if (!p) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      metadata: { username, plan },
      subscription_data: {
        trial_period_days: 7,
        metadata: { username, plan },
      },
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: p.amount,
          recurring: { interval: p.interval },
          product_data: {
            name: `HockeyBeats Premium (${plan === 'yearly' ? 'Yearly' : 'Monthly'})`,
            description: 'All games unlocked. New games included automatically.',
          },
        },
        quantity: 1,
      }],
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        submit: {
          message: 'Your 7-day free trial starts now. You won\'t be charged until the trial ends. Cancel anytime during the trial at no cost.',
        },
        terms_of_service_acceptance: {
          message: `I agree to the [Terms of Service](${req.nextUrl.origin}/terms) and [Privacy Policy](${req.nextUrl.origin}/privacy).`,
        },
      },
      success_url: `${req.nextUrl.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/dashboard`,
    };

    if (coupon) {
      sessionParams.discounts = [{ coupon }];
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
