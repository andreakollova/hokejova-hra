'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Hokejový Tréner
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/rebricek"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Rebríček
            </Link>
            {user ? (
              <>
                <Link
                  href="/profil"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {profile?.nickname || 'Profil'}
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Odhlásiť
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-xl transition-all font-medium"
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
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-600 font-medium mb-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Pozemný hokej
          </div>
          <h2 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
            Trénuj techniku<br />
            s&nbsp;hlavou hore
          </h2>
          <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
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
            <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Slalom</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vyhýbaj sa kužeľom striedavo zľava a sprava. Trénuješ rýchle zmeny smeru.
            </p>
            <div className="mt-4 text-xs text-green-600/70 group-hover:text-green-600 transition-colors flex items-center gap-1">
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
            <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Osmičky</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Veď loptičku v tvare osmičky. Trénuješ plynulosť a kontrolu v oboch smeroch.
            </p>
            <div className="mt-4 text-xs text-green-600/70 group-hover:text-green-600 transition-colors flex items-center gap-1">
              Spustiť
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Coming soon */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 opacity-60 cursor-default">
            <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-2">Space Invaders</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pohyb loptičky bude ovládať vesmírnu loď. Už čoskoro.
            </p>
            <div className="mt-4 text-xs text-gray-400">Pripravujeme</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-xs text-gray-400">
          <span>Hokejový Tréner</span>
          <div className="flex gap-4">
            <Link href="/rebricek" className="hover:text-gray-600 transition-colors">Rebríček</Link>
            {user && <Link href="/profil" className="hover:text-gray-600 transition-colors">Profil</Link>}
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
