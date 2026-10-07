'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky header */}
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 transition-all duration-300 ${scrolled ? 'py-3 shadow-sm' : 'py-6'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src={scrolled ? '/images/logo-qo.png' : '/images/logo-sportqo.png'}
              alt="sportqo"
              width={scrolled ? 40 : 120}
              height={scrolled ? 24 : 32}
              className={`transition-all duration-300 ${scrolled ? 'h-6 w-auto' : 'h-8 w-auto'}`}
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/trening" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Tréning</Link>
            <Link href="/rebricek" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Rebríček</Link>
            {user ? (
              <>
                <Link href="/profil" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{profile?.nickname || 'Profil'}</Link>
                <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Odhlásiť</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary text-sm px-5 py-2.5">Prihlásiť sa</button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero - text left, image right */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-[1.05] tracking-tight">
                Trénuj techniku<br />
                miešania loptičky<br />
                s hlavou hore.
              </h1>
              <p className="mt-8 text-lg text-gray-400 max-w-lg leading-relaxed">
                Ovládaj reálnu loptičku hokejkou pred kamerou. Jej pohyb sa v reálnom čase prenáša do hry na obrazovke.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/trening" className="btn-primary text-base px-8 py-4">
                  Začať trénovať
                </Link>
                <Link href="/rebricek" className="btn-secondary text-base px-8 py-4">
                  Pozrieť rebríček
                </Link>
              </div>
            </div>
            {/* Hero image */}
            <div className="hidden lg:block">
              <div className="rounded-3xl overflow-hidden">
                <Image
                  src="/images/hero-girl.png"
                  alt="Hráčka pozemného hokeja"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Game cards with images */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Slalom */}
            <Link href="/trening" className="group block">
              <div className="rounded-3xl overflow-hidden relative h-72 bg-gray-900">
                <Image
                  src="/images/hero-dribble.jpg"
                  alt="Slalom tréning"
                  fill
                  className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <h3 className="text-xl font-bold text-white mb-1">Slalom</h3>
                  <p className="text-sm text-white/70">
                    Vyhýbaj sa kužeľom striedavo zľava a sprava.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
                    Spustiť
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Osmicky */}
            <Link href="/osmicky" className="group block">
              <div className="rounded-3xl overflow-hidden relative h-72 bg-gray-900">
                <Image
                  src="/images/hero-action.jpg"
                  alt="Osmičky tréning"
                  fill
                  className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-7">
                  <h3 className="text-xl font-bold text-white mb-1">Osmičky</h3>
                  <p className="text-sm text-white/70">
                    Veď loptičku v tvare osmičky. Plynulosť a kontrola.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
                    Spustiť
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Coming soon */}
            <div className="rounded-3xl bg-gray-50 h-72 flex flex-col justify-end p-7 opacity-50">
              <h3 className="text-xl font-bold text-gray-400 mb-1">Space Invaders</h3>
              <p className="text-sm text-gray-400">
                Pohyb loptičky bude ovládať vesmírnu loď.
              </p>
              <div className="mt-4 text-sm text-gray-400">Pripravujeme</div>
            </div>
          </div>
        </section>

        {/* Features row */}
        <section className="border-t border-gray-100 py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid sm:grid-cols-3 gap-12">
              <div>
                <div className="text-xl font-bold text-gray-900 mb-2">Kamera</div>
                <p className="text-gray-400 leading-relaxed">
                  Stačí bežná USB webkamera alebo vstavaná kamera notebooku. Žiadny špeciálny senzor.
                </p>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 mb-2">Beat mód</div>
                <p className="text-gray-400 leading-relaxed">
                  Pripoj Spotify a miešaj loptičku do rytmu obľúbenej pesničky.
                </p>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 mb-2">Rebríček</div>
                <p className="text-gray-400 leading-relaxed">
                  Porovnaj sa s ostatnými hráčmi. Sleduj svoj progres a osobné rekordy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-gray-100 py-24">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Začni za 30 sekúnd.
            </h2>
            <p className="mt-5 text-lg text-gray-400 max-w-md mx-auto">
              Stačí kamera, hokejka a farebná loptička. Žiadna inštalácia.
            </p>
            <div className="mt-8">
              <Link href="/trening" className="btn-primary text-base px-8 py-4">
                Vyskúšať zadarmo
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 sm:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Image src="/images/logo-qo.png" alt="sportqo" width={32} height={20} className="h-5 w-auto" />
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/trening" className="hover:text-gray-900 transition-colors">Tréning</Link>
            <Link href="/osmicky" className="hover:text-gray-900 transition-colors">Osmičky</Link>
            <Link href="/rebricek" className="hover:text-gray-900 transition-colors">Rebríček</Link>
            {user && <Link href="/profil" className="hover:text-gray-900 transition-colors">Profil</Link>}
          </div>
        </div>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
