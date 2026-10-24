'use client';

import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { PLANS, getTrialRemaining, activatePromo } from '@/lib/subscription';

interface PaywallProps {
  gameSlug: string;
  onDismiss?: () => void;
}

export default function Paywall({ gameSlug, onDismiss }: PaywallProps) {
  const { settings } = useSettings();
  const auth = useAuth();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const trialRemaining = getTrialRemaining(gameSlug);
  const username = auth.displayName || settings.username;
  const email = auth.user?.email;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, username, email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPromoError(data.error || 'Something went wrong');
    } catch {
      setPromoError('Connection error');
    }
    setLoading(false);
  };

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    setPromoLoading(true);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, username }),
      });
      const data = await res.json();
      if (data.ok) {
        activatePromo(data.type);
        window.location.reload();
      } else {
        setPromoError(data.error || 'Invalid code');
      }
    } catch {
      setPromoError('Connection error');
    }
    setPromoLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#111118] rounded-3xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-2xl font-extrabold text-white">Unlock all games</h2>
          <p className="text-white/40 text-sm mt-2">
            {trialRemaining > 0
              ? `Your free trial for this game has expired.`
              : `Get access to all 12+ games with Premium.`}
          </p>
        </div>

        {/* Plan selector */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setPlan('monthly')}
            className={`flex-1 rounded-2xl p-4 border-2 transition-all text-left ${plan === 'monthly' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/3'}`}
          >
            <div className="text-lg font-bold text-white">€8.45</div>
            <div className="text-xs text-white/50">per month</div>
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`flex-1 rounded-2xl p-4 border-2 transition-all text-left relative ${plan === 'yearly' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/3'}`}
          >
            <div className="absolute -top-2 right-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">SAVE 21%</div>
            <div className="text-lg font-bold text-white">€79.99</div>
            <div className="text-xs text-white/50">per year (€6.67/mo)</div>
          </button>
        </div>

        {/* Subscribe button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all disabled:opacity-50 mb-4"
        >
          {loading ? 'Loading...' : 'Subscribe now'}
        </button>

        {/* Promo code */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            placeholder="Promo code"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handlePromo}
            disabled={promoLoading}
            className="bg-white/10 hover:bg-white/15 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {promoLoading ? '...' : 'Apply'}
          </button>
        </div>
        {promoError && <p className="text-red-400 text-xs mb-3">{promoError}</p>}

        <p className="text-[10px] text-white/20 text-center">Cancel anytime. 7-day money-back guarantee.</p>

        {onDismiss && (
          <button onClick={onDismiss} className="w-full text-center text-xs text-white/30 hover:text-white/50 mt-4 transition-colors">
            Back to menu
          </button>
        )}
      </div>
    </div>
  );
}
