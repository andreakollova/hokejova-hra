'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">
            Hokejovy Trener
          </h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/profil"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {profile?.nickname || 'Profil'}
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Odhlasit
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Prihlasit sa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Trenuj techniku s&nbsp;hlavou hore
          </h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Ovladaj realnu lopticku hokejkou pred kamerou. Jej pohyb sa v
            realnom case prenasa do hry na obrazovke.
          </p>
        </div>

        {/* Game cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
          {/* Slalom */}
          <Link
            href="/trening"
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:bg-gray-900/80"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Slalom
            </h3>
            <p className="text-sm text-gray-400">
              Vyhybaj sa kuzelom striedavo zlava a sprava. Trenujes rychle zmeny
              smeru.
            </p>
          </Link>

          {/* Figure 8 */}
          <Link
            href="/osmicky"
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:bg-gray-900/80"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Osmicky
            </h3>
            <p className="text-sm text-gray-400">
              Ved lopticku v tvare osmicky. Trenujes plynulost a kontrolu v oboch
              smeroch.
            </p>
          </Link>

          {/* Coming soon */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 opacity-60">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Pripravujeme: Space Invaders
            </h3>
            <p className="text-sm text-gray-600">
              Pohyb lopticky bude ovladat vesmirnu lod. Uz coskoro.
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-4 mt-12">
          <Link
            href="/rebricek"
            className="text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            Rebricek
          </Link>
          {user && (
            <Link
              href="/profil"
              className="text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              Moj profil
            </Link>
          )}
        </div>
      </main>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
