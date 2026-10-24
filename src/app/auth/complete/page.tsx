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

    if (code) {
      getSupabaseBrowser().auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Auth error:', error);
          router.push('/');
        } else {
          router.push(next);
        }
      });
    } else {
      router.push('/');
    }
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
