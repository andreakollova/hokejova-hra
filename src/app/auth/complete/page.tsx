'use client';

export const dynamic = 'force-dynamic';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function AuthCompleteContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get('code');
    const next = params.get('next') || '/dashboard';
    const supabase = getSupabaseBrowser();

    const goToNextOrOnboarding = () => {
      // Check if onboarding is needed
      try {
        const raw = localStorage.getItem('sportqo_engagement');
        if (raw) {
          const eng = JSON.parse(raw);
          if (eng.profile?.onboarded) {
            router.push(next);
            return;
          }
        }
      } catch {}
      // Not onboarded - go to homepage which shows onboarding
      router.push('/?onboarding=true');
    };

    const handleAuth = async () => {
      // Try code exchange
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          goToNextOrOnboarding();
          return;
        }
        console.error('Code exchange failed:', error);
      }

      // Check if session already exists (from hash or cookies)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        goToNextOrOnboarding();
        return;
      }

      // Check URL hash for tokens (implicit flow)
      if (window.location.hash) {
        // Supabase auto-detects hash tokens
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s) {
            router.push(next);
          } else {
            router.push('/');
          }
        }, 1000);
        return;
      }

      // Nothing worked
      router.push('/');
    };

    handleAuth();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400">Signing you in...</p>
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
