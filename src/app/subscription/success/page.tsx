'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const params = useSearchParams();

  useEffect(() => {
    // Activate subscription locally
    const sub = {
      type: 'premium',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorage.setItem('hb_subscription', JSON.stringify(sub));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Welcome to Premium!</h1>
        <p className="text-white/50 mb-8">All games are now unlocked. New games are automatically included.</p>
        <Link href="/dashboard" className="inline-block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-full transition-all">
          Start playing
        </Link>
      </div>
    </div>
  );
}
