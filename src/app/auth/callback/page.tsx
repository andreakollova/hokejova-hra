'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    const handleCallback = async () => {
      // Supabase auto-handles the code exchange from URL when using PKCE
      // Just wait for session to appear
      let attempts = 0;
      while (attempts < 15) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Sync to legacy settings
          const name = session.user.user_metadata?.display_name
            || session.user.user_metadata?.full_name
            || session.user.user_metadata?.name
            || session.user.email?.split('@')[0]
            || 'Player';

          try {
            const raw = localStorage.getItem('sportqo_user_settings');
            const existing = raw ? JSON.parse(raw) : {};
            localStorage.setItem('sportqo_user_settings', JSON.stringify({ ...existing, loggedIn: true, username: name }));
            document.cookie = `hb_username=${name}; path=/; max-age=${60 * 60 * 24 * 365}`;
          } catch {}

          // Check onboarding
          try {
            const engRaw = localStorage.getItem('sportqo_engagement');
            if (engRaw) {
              const eng = JSON.parse(engRaw);
              if (eng.profile?.onboarded) {
                router.push('/dashboard');
                return;
              }
            }
          } catch {}

          router.push('/?onboarding=true');
          return;
        }
        attempts++;
        await new Promise(r => setTimeout(r, 500));
      }

      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-400">Loading...</p></div>}>
      <CallbackContent />
    </Suspense>
  );
}
