'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function AuthCompleteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const code = params.get('code');
    const supabase = getSupabaseBrowser();

    const handleAuth = async () => {
      // Try code exchange
      if (code) {
        setStatus('Completing sign-in...');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Code exchange failed:', error);
        }
      }

      // Wait for session
      setStatus('Loading your account...');
      let attempts = 0;
      while (attempts < 10) {
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
            localStorage.setItem('sportqo_user_settings', JSON.stringify({
              ...existing,
              loggedIn: true,
              username: name,
            }));
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

          // Not onboarded - go to onboarding
          router.push('/?onboarding=true');
          return;
        }
        attempts++;
        await new Promise(r => setTimeout(r, 500));
      }

      // Timeout - go home
      router.push('/');
    };

    handleAuth();
  }, [params, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{status}</p>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-400">Loading...</p></div>}>
      <AuthCompleteContent />
    </Suspense>
  );
}
