'use client';

import { useState } from 'react';
import { CLUB_PLANS, formatPrice, pricePerPlayer } from '@/lib/club-plans';
import Link from 'next/link';
import Image from 'next/image';

export default function ClubPage() {
  const [selectedPlan, setSelectedPlan] = useState('club_20');
  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!clubName.trim() || !email.trim()) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/club/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, clubName: clubName.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Something went wrong');
    } catch { setError('Connection error'); }
    setLoading(false);
  };

  const plan = CLUB_PLANS.find(p => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 px-6 sm:px-10 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-white.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Hockey Beats for Clubs</h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Premium access for your entire team. One subscription, instant activation codes for every player.</p>
        </div>

        {/* Plan grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {CLUB_PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`rounded-2xl p-4 border-2 transition-all text-left ${selectedPlan === p.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
            >
              <div className="text-lg font-bold">{p.seats}</div>
              <div className="text-[10px] text-white/40 uppercase">players</div>
              <div className="text-sm font-bold text-emerald-400 mt-2">{formatPrice(p.pricePerMonth)}</div>
              <div className="text-[10px] text-white/40">/month</div>
              <div className="text-[10px] text-white/30 mt-1">{p.discount}% off</div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-white/30 mb-10">
          Need more than 50 players? <a href="mailto:studio@drixton.com" className="underline text-emerald-400 hover:text-emerald-300">Contact us</a> for a custom Club 50+ plan.
        </div>

        {/* Selected plan details */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-xl font-bold">{plan.label}</div>
                <div className="text-sm text-white/50">{plan.seats} players · {plan.discount}% discount</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">{formatPrice(plan.pricePerMonth)}</div>
                <div className="text-xs text-white/40">/month incl. VAT</div>
              </div>
            </div>
            <div className="text-xs text-white/30">{pricePerPlayer(plan)}/player/month · Billed monthly · Cancel anytime</div>
          </div>

          <div className="space-y-3 mb-6">
            <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="Club or team name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Club contact email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50" />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button onClick={handleCheckout} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 mb-4">
            {loading ? 'Loading...' : `Subscribe — ${formatPrice(plan.pricePerMonth)}/month`}
          </button>

          <div className="space-y-2 text-xs text-white/30">
            <p>After payment, you will receive {plan.seats} unique activation codes to distribute to your players.</p>
            <p>Each player creates their own account and enters the code to unlock Premium.</p>
            <p>Club members will automatically appear as teammates in Friends.</p>
            <p>All prices include applicable VAT. <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
