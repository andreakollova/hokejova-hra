'use client';

import { useCallback, useRef } from 'react';

const DEBOUNCE_MS = 2000;

export function useCloudSync(username: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncRef = useRef<string>('');

  const syncToCloud = useCallback(
    (field: string, data: unknown) => {
      if (!username) return;

      // Debounce writes
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          await fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, [field]: data }),
          });
        } catch {}
      }, DEBOUNCE_MS);
    },
    [username]
  );

  const loadFromCloud = useCallback(
    async (): Promise<Record<string, unknown> | null> => {
      if (!username) return null;
      try {
        const res = await fetch(`/api/user-data?username=${encodeURIComponent(username)}`);
        const json = await res.json();
        return json.data || null;
      } catch {
        return null;
      }
    },
    [username]
  );

  return { syncToCloud, loadFromCloud };
}
