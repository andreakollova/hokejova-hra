'use client';

import { useState } from 'react';
import { CLUB_PLANS, formatPrice, pricePerPlayer } from '@/lib/club-plans';
import Link from 'next/link';
import Image from 'next/image';

const INDIVIDUAL_MONTHLY = 845; // €8.45/month per player

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
  const savedPerMonth = (INDIVIDUAL_MONTHLY * plan.seats - plan.pricePerMonth) / 100;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 sm:px-10 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#101828] tracking-tight mb-3">Hockey Beats for Clubs</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Premium access for your entire team. One subscription, instant activation codes for every player.</p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {CLUB_PLANS.map(p => {
            const isSelected = selectedPlan === p.id;
            const perPlayer = ((p.pricePerMonth / 100) / p.seats).toFixed(2);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`rounded-2xl p-4 border-2 transition-all text-left relative ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                {p.discount >= 50 && (
                  <div className="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Best value</div>
                )}
                <div className="text-2xl font-black text-[#101828]">{p.seats}</div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">players</div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-[#101828]">{formatPrice(p.pricePerMonth)}<span className="text-xs font-normal text-gray-400">/mo</span></div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{`€${perPlayer}`}/player</div>
                </div>
                <div className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {p.discount}% off
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center text-xs text-gray-400 mb-12">
          Need more than 50 players? <a href="mailto:studio@drixton.com" className="text-emerald-600 hover:text-emerald-500 font-medium">Contact us</a> for a custom plan.
        </div>

        {/* Selected plan + checkout */}
        <div className="max-w-lg mx-auto">
          {/* Savings highlight */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-center">
            <div className="text-xs text-emerald-600 font-medium mb-1">With {plan.label} you save</div>
            <div className="text-3xl font-black text-emerald-600">{`€${savedPerMonth.toFixed(2)}`}<span className="text-base font-medium">/month</span></div>
            <div className="text-xs text-emerald-600/60 mt-1">compared to {plan.seats} individual subscriptions at €8.45/player</div>
          </div>

          {/* Plan summary card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-xl font-extrabold text-[#101828]">{plan.label}</div>
                <div className="text-sm text-gray-500">{plan.seats} players · {plan.discount}% discount</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#101828]">{formatPrice(plan.pricePerMonth)}</div>
                <div className="text-xs text-gray-400">/month incl. VAT</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-200">
              <span>{pricePerPlayer(plan)}/player/month</span>
              <span>Billed monthly</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Checkout form */}
          <div className="space-y-3 mb-6">
            <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} placeholder="Club or team name" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#101828] placeholder-gray-300 outline-none focus:border-emerald-500 transition-colors" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Club contact email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#101828] placeholder-gray-300 outline-none focus:border-emerald-500 transition-colors" />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button onClick={handleCheckout} disabled={loading} className="w-full bg-[#101828] hover:bg-[#1a2540] text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 mb-6 text-base">
            {loading ? 'Loading...' : `Subscribe — ${formatPrice(plan.pricePerMonth)}/month`}
          </button>

          {/* Info */}
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>After payment, you will receive <strong className="text-gray-600">{plan.seats} unique activation codes</strong> to distribute to your players.</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Each player creates their own account and enters the code to unlock Premium.</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Club members will automatically appear as teammates in Friends.</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-6 text-center">All prices include applicable VAT. <Link href="/terms" className="underline hover:text-gray-500">Terms</Link> · <Link href="/privacy" className="underline hover:text-gray-500">Privacy</Link></p>
        </div>
      </div>
    </div>
  );
}
