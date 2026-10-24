'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  useEffect(() => {
    // Activate trial locally
    const sub = {
      type: 'premium',
      status: 'trialing',
      activatedAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem('hb_subscription', JSON.stringify(sub));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Your trial has started!</h1>
        <p className="text-white/50 mb-2">You have 7 days of full Premium access, completely free.</p>
        <p className="text-white/30 text-sm mb-8">All games are unlocked. If you cancel before the trial ends, you won&apos;t be charged.</p>
        <Link href="/dashboard" className="inline-block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all">
          Start playing
        </Link>
      </div>
    </div>
  );
}
