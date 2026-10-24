'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { hasFullConsent } from '@/components/ui/CookieBanner';

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track visits if user accepted all cookies, or is logged in (contract basis)
    let username: string | null = null;
    try {
      const raw = localStorage.getItem('sportqo_user_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.loggedIn) username = s.username;
      }
    } catch {}

    // Track if: user is logged in (contract) or accepted analytics (consent)
    if (!username && !hasFullConsent()) return;

    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, username }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
