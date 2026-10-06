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
      <header className="border-b border-gray-800/30 px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500/15 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Hokejový Tréner
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/rebricek"
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Rebríček
            </Link>
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
                  Odhlásiť
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm bg-green-600/15 text-green-400 hover:bg-green-600/25 px-4 py-2 rounded-xl transition-all"
              >
                Prihlásiť sa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center space-y-5 mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-xs text-green-400 font-medium mb-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Pozemný hokej
          </div>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Trénuj techniku<br />
            s&nbsp;hlavou hore
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto leading-relaxed">
            Ovládaj reálnu loptičku hokejkou pred kamerou. Jej pohyb sa v reálnom čase prenáša do hry na obrazovke.
          </p>
        </div>

        {/* Game cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl w-full">
          {/* Slalom */}
          <Link
            href="/trening"
            className="group card-hover p-6 block"
          >
            <div className="w-11 h-11 bg-green-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Slalom</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Vyhýbaj sa kužeľom striedavo zľava a sprava. Trénuješ rýchle zmeny smeru.
            </p>
            <div className="mt-4 text-xs text-green-400/70 group-hover:text-green-400 transition-colors flex items-center gap-1">
              Spustiť
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Figure 8 */}
          <Link
            href="/osmicky"
            className="group card-hover p-6 block"
          >
            <div className="w-11 h-11 bg-green-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Osmičky</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Veď loptičku v tvare osmičky. Trénuješ plynulosť a kontrolu v oboch smeroch.
            </p>
            <div className="mt-4 text-xs text-green-400/70 group-hover:text-green-400 transition-colors flex items-center gap-1">
              Spustiť
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Coming soon */}
          <div className="card p-6 opacity-50 cursor-default">
            <div className="w-11 h-11 bg-gray-800 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-500 mb-2">Space Invaders</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pohyb loptičky bude ovládať vesmírnu loď. Už čoskoro.
            </p>
            <div className="mt-4 text-xs text-gray-600">Pripravujeme</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-xs text-gray-600">
          <span>Hokejový Tréner</span>
          <div className="flex gap-4">
            <Link href="/rebricek" className="hover:text-gray-400 transition-colors">Rebríček</Link>
            {user && <Link href="/profil" className="hover:text-gray-400 transition-colors">Profil</Link>}
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
