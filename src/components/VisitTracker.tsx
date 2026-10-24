'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let username: string | null = null;
    try {
      const raw = localStorage.getItem('sportqo_user_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.loggedIn) username = s.username;
      }
    } catch {}

    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, username }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
