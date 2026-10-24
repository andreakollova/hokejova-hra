'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'hb_cookie_consent';

type ConsentState = 'pending' | 'accepted' | 'essential_only';

function getConsent(): ConsentState {
  if (typeof window === 'undefined') return 'pending';
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === 'accepted' || saved === 'essential_only') return saved;
  } catch {}
  return 'pending';
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>('accepted'); // default to accepted to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(getConsent());
    setMounted(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(CONSENT_KEY, 'essential_only');
    setConsent('essential_only');
  };

  if (!mounted || consent !== 'pending') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/50">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1.5">We value your privacy</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Hockey Beats uses cookies and local storage to keep you signed in, save your game progress, and remember your preferences. We also use analytics to understand how our site is used. No advertising cookies are used.
            </p>
            <p className="text-xs text-white/30 mt-1.5">
              Read more in our <Link href="/cookies" className="underline hover:text-white/60">Cookie Policy</Link> and <Link href="/privacy" className="underline hover:text-white/60">Privacy Policy</Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-col gap-2 sm:min-w-[140px]">
            <button
              onClick={handleAccept}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold py-2.5 px-5 rounded-full transition-all"
            >
              Accept all
            </button>
            <button
              onClick={handleEssentialOnly}
              className="bg-white/10 hover:bg-white/15 text-white/70 text-sm font-medium py-2.5 px-5 rounded-full transition-all"
            >
              Essential only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility to check if user accepted all cookies
export function hasFullConsent(): boolean {
  return getConsent() === 'accepted';
}

export function hasAnyConsent(): boolean {
  return getConsent() !== 'pending';
}
