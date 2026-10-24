'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ParentalVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ParentalVerifyContent />
    </Suspense>
  );
}

function ParentalVerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'ready' | 'approved' | 'denied' | 'error' | 'already'>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    setStatus('ready');
  }, [token]);

  const handleAction = async (action: 'approve' | 'deny') => {
    setProcessing(true);
    try {
      const res = await fetch('/api/parental-consent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });
      const data = await res.json();
      if (res.status === 409) { setStatus('already'); return; }
      if (!res.ok) { setStatus('error'); return; }
      setStatus(data.status === 'approved' ? 'approved' : 'denied');
    } catch {
      setStatus('error');
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <Link href="/">
          <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto mx-auto mb-8" />
        </Link>

        {status === 'loading' && (
          <p className="text-gray-400">Loading...</p>
        )}

        {status === 'error' && (
          <div>
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid link</h1>
            <p className="text-gray-500 text-sm">This verification link is invalid or has expired. Please contact <a href="mailto:studio@drixton.com" className="underline">studio@drixton.com</a> for assistance.</p>
          </div>
        )}

        {status === 'already' && (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Already processed</h1>
            <p className="text-gray-500 text-sm">This consent request has already been processed.</p>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Parental Consent Request</h1>
            <p className="text-gray-500 text-sm mb-2">
              Your child has requested permission to use Hockey Beats, an interactive hockey training platform.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Hockey Beats involves camera-based ball tracking (processed locally, not uploaded), gameplay scoring, and optional music integrations. Please review our <a href="/parental-consent" className="underline text-gray-700">Parental Consent Notice</a> and <a href="/privacy" className="underline text-gray-700">Privacy Policy</a> before deciding.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
              <h3 className="text-sm font-bold text-gray-900 mb-2">What your child can do:</h3>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li>Play hockey training games (free Slalom + 10 min trial per game)</li>
                <li>Create a profile with a mascot avatar</li>
                <li>Earn XP, achievements, and appear on leaderboards</li>
                <li>Add friends and see their scores</li>
                <li>Use camera-based ball tracking (local processing only)</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> By approving, you confirm that you are the parent or legal guardian and that you consent to the processing of your child&apos;s personal data as described in our Privacy Policy. You can withdraw consent at any time by contacting studio@drixton.com.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction('approve')}
                disabled={processing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-full transition-all disabled:opacity-50"
              >
                {processing ? '...' : 'I approve'}
              </button>
              <button
                onClick={() => handleAction('deny')}
                disabled={processing}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-full transition-all disabled:opacity-50"
              >
                {processing ? '...' : 'I do not approve'}
              </button>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Consent approved</h1>
            <p className="text-gray-500 text-sm mb-2">Thank you. Your child can now use Hockey Beats.</p>
            <p className="text-gray-400 text-xs">You can withdraw consent at any time by contacting <a href="mailto:studio@drixton.com" className="underline">studio@drixton.com</a>.</p>
          </div>
        )}

        {status === 'denied' && (
          <div>
            <div className="text-4xl mb-4">🚫</div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Consent denied</h1>
            <p className="text-gray-500 text-sm">Your child&apos;s account will be restricted. If you change your mind, contact <a href="mailto:studio@drixton.com" className="underline">studio@drixton.com</a>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
