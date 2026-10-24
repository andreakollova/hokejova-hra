'use client';

import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import { useAuth } from '@/hooks/useAuth';
import { MASCOTS, SPORTS } from '@/lib/mascots';
import Onboarding from '@/components/auth/Onboarding';
import StreakBadge from '@/components/ui/StreakBadge';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { settings, isLoggedIn: legacyLoggedIn } = useSettings();
  const auth = useAuth();
  const isLoggedIn = auth.isLoggedIn || legacyLoggedIn;
  const displayName = auth.displayName || settings.username;
  const { getStreak, getLevelProgress, getProfile, setProfile, loaded: engLoaded } = useEngagement();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authAge, setAuthAge] = useState<'16plus' | 'under16' | 'under13' | ''>('');
  const [authDob, setAuthDob] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('onboarding') === 'true') {
      const profile = getProfile();
      if (!profile.onboarded && auth.isLoggedIn) {
        setShowOnboarding(true);
        window.history.replaceState({}, '', '/');
      }
    }
    // Open login modal if redirected from a game page
    if (params.get('login') === 'true' && !auth.isLoggedIn) {
      setShowAuth(true);
      window.history.replaceState({}, '', '/');
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, [auth.isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    if (authMode === 'signup') {
      const err = await auth.signUpWithEmail(authEmail, authPassword, authName);
      if (err) { setAuthError(err); }
      else {
        setAuthSuccess('Check your email to confirm your account.');
      }
    } else if (authMode === 'login') {
      const err = await auth.signInWithEmail(authEmail, authPassword);
      if (err) setAuthError(err);
      else {
        const p = getProfile();
        if (!p.onboarded) { setShowAuth(false); setShowOnboarding(true); }
        else window.location.href = '/dashboard';
      }
    } else if (authMode === 'forgot') {
      const err = await auth.resetPassword(authEmail);
      if (err) setAuthError(err);
      else setAuthSuccess('Password reset email sent.');
    }
    setAuthLoading(false);
  };

  if (showOnboarding) {
    return (
      <Onboarding
        defaultName={auth.displayName || displayName || ''}
        onComplete={(profile) => {
          const isMinor = authAge === 'under16';
          setProfile({ ...profile, isMinor, privateProfile: isMinor });
          // Save username to legacy settings
          if (profile.username) {
            try {
              const raw = localStorage.getItem('sportqo_user_settings');
              const existing = raw ? JSON.parse(raw) : {};
              localStorage.setItem('sportqo_user_settings', JSON.stringify({ ...existing, username: profile.username }));
            } catch {}
          }
          setShowOnboarding(false);
          window.location.href = '/dashboard';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_20px_-6px_rgba(0,0,0,0.08)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={240} height={64} className="h-10 sm:h-12 w-auto" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-5">
            <a href="#games" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden lg:block">Games</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden lg:block">How to play</a>
            <a href="#players" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden lg:block">Players</a>
            <a href="#coaches" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden lg:block">Coaches</a>
            <a href="#clubs" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden lg:block">Clubs</a>
            <div className="hidden lg:block w-px h-5 bg-gray-200 mx-1" />
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {engLoaded && getStreak().currentStreak > 0 && (
                  <StreakBadge currentStreak={getStreak().currentStreak} frozen={getStreak().frozen} size="sm" />
                )}
                <Link href="/dashboard" className="text-sm font-bold px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-all">Play now</Link>
                {(() => {
                  const p = engLoaded ? getProfile() : null;
                  const mascot = p ? MASCOTS.find(m => m.id === p.mascotId) : null;
                  return (
                    <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      {mascot ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: p?.color || '#22c55e' }}>
                          <Image src={mascot.image} alt={mascot.name} width={36} height={36} className="w-8 h-8 object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-700 hidden sm:block">{settings.username || displayName}</span>
                    </Link>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAuth(true)} className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden sm:block">Log in</button>
                <button onClick={() => { setShowAuth(true); setAuthMode('signup'); }} className="text-sm font-bold px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-all">Play now</button>
                <button onClick={() => setShowAuth(true)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* 1. Hero banner - fullscreen with photo */}
        <HeroBanner isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} />

        {/* Start Now */}
        <StartNowSection />


        {/* 01 - Hero subtitle */}
        <section id="games" className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">01 / The game</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Turn your hockey stick<br />into a game controller.</h2>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Meet Hockey Beats, the rhythm-based hockey game where you play with a real stick and ball. Follow the beat, hit your targets and turn every session into a new high score.</p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary px-8 py-4"> Play Now <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></Link>
              <a href="#how-it-works" className="btn-secondary px-8 py-4"> How It Works <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></a>
            </div>
          </div>

          {/* Game carousel inline */}
          <GameCarousel />
        </section>

        {/* 02 - The Game */}
        <section id="players" className="bg-gray-50/50 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">02 / The game</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Practice your coach will notice.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">Hockey Beats makes stickhandling practice something you&apos;ll actually look forward to. Play rhythm-based challenges with your real stick and ball, improve your control and coordination, and build the confidence to keep your head up on the pitch.</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-4xl font-black text-emerald-500">80%</div>
                  <p className="text-sm font-bold text-[#101828] text-left">Reported improvement in stickhandling after one month of playing Hockey Beats.</p>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden">
                  <Image src="/images/hero-indoor.png" alt="Player practising" width={600} height={450} className="w-full h-auto" />
                </div>
                <div className="absolute -right-2 bottom-[-30px] sm:right-[-20px] sm:bottom-[-20px] animate-[float_3s_ease-in-out_infinite]">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, #a855f740 0%, transparent 70%)', transform: 'scale(2.2)' }} />
                    <Image src="/images/mascots/mascot-magnet-flip.webp" alt="Magno" width={160} height={160} className="relative z-10 drop-shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03 - Progression */}
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">03 / Progression</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Get hooked on getting better.</h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">Earn XP, collect badges, build your streak and climb the leaderboards. Every session gives you another reason to play and another chance to beat your best.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'XP & Levels', desc: 'Earn experience with every game you play', color: '#8b5cf6', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                { title: 'Badges', desc: 'Collect achievements for milestones and challenges', color: '#f59e0b', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
                { title: 'Daily Streaks', desc: 'Play every day to build your streak', color: '#ef4444', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg> },
                { title: 'Leaderboards', desc: 'Compete with friends and teammates', color: '#3b82f6', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4v11H3zM10 3h4v18h-4zM17 7h4v14h-4z" /></svg> },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-2">
                  <div className="flex-shrink-0 mt-0.5" style={{ color: item.color }}>{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#101828] tracking-tight">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 - Real Skills */}
        <section className="bg-gray-50/50 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-3xl overflow-hidden">
                  <Image src="/images/parents.png" alt="Player practising with head up" width={600} height={400} className="w-full h-auto" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">04 / Real skills</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Train your stickhandling while keeping your head up.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">This isn&apos;t another game you play with your thumbs. Hockey Beats gets you moving with your actual hockey stick and ball, encouraging better ball control and coordination.</p>
                <div className="mt-6">
                  <Link href="/dashboard" className="btn-primary px-8 py-4"> Start Playing <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 - Accessibility */}
        <section className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center relative">
            {/* Floating mascots */}
            <div className="absolute left-4 top-8 sm:left-16 sm:top-12 animate-[float_4s_ease-in-out_infinite] hidden sm:block">
              <Image src="/images/mascots/mascot-slalom.webp" alt="" width={55} height={55} className="drop-shadow-lg" />
            </div>
            <div className="absolute right-4 top-12 sm:right-16 sm:top-8 animate-[float_3.5s_ease-in-out_infinite_0.5s] hidden sm:block">
              <Image src="/images/mascots/mascot-space.webp" alt="" width={50} height={50} className="drop-shadow-lg" />
            </div>
            <div className="absolute left-6 bottom-12 sm:left-24 sm:bottom-16 animate-[float_3s_ease-in-out_infinite_1s] hidden sm:block">
              <Image src="/images/mascots/mascot-jelly-stack.webp" alt="" width={48} height={48} className="drop-shadow-lg" />
            </div>
            <div className="absolute right-6 bottom-8 sm:right-24 sm:bottom-12 animate-[float_4.5s_ease-in-out_infinite_0.8s] hidden sm:block">
              <Image src="/images/mascots/mascot-brick-rush.webp" alt="" width={52} height={52} className="drop-shadow-lg" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">05 / Accessibility</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Your room is your arena.</h2>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">No expensive training machines. No special sensors. No trip to the pitch.<br />Just your stick, your ball, a camera and a screen. Open Hockey Beats in your desktop browser and start playing wherever you have enough safe space.</p>
            <div className="mt-8">
              <Link href="/dashboard" className="btn-accent px-8 py-4"> Start Playing for Free <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></Link>
            </div>
          </div>
        </section>

        {/* 06 - How it works */}
        <section id="how-it-works" className="bg-gray-50/50 py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">06 / How it works</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">The easiest setup you&apos;ll ever need.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Grab your gear', desc: 'Get your hockey stick and ball ready.', img: '/images/step-gear.jpg' },
                { step: '2', title: 'Set up your camera', desc: 'Let Hockey Beats track your ball as you play.', img: '/images/step-camera.jpg' },
                { step: '3', title: 'Play the beat', desc: 'Follow the challenges, score points and level up.', img: '/images/step-play.jpg' },
              ].map(item => (
                <div key={item.step} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="overflow-hidden">
                    <Image src={item.img} alt={item.title} width={400} height={250} className="w-full h-44 object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-black text-emerald-500">{item.step}</span>
                      <h3 className="text-base font-extrabold text-[#101828] tracking-tight">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 07 - For players, coaches, parents */}
        <div id="coaches"><AudienceTabs /></div>

        {/* 08 - Club experience */}
        <section id="clubs" className="py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            {/* Full-width card */}
            <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
              <div className="grid lg:grid-cols-2">
                {/* Image */}
                <div className="h-64 lg:h-auto">
                  <Image src="/images/club-team.jpg" alt="Hockey team celebrating" width={600} height={450} className="w-full h-full object-cover" />
                </div>
                {/* Content */}
                <div className="p-8 sm:p-12 flex flex-col justify-center">
                  <div className="inline-block bg-emerald-50 rounded-full px-4 py-1.5 mb-5 self-start">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">For clubs &amp; teams</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] leading-[1.12] tracking-tight">Bring the whole team into the game.</h2>
                  <p className="mt-4 text-base text-gray-500 leading-relaxed">Turn individual practice into something your players share. Challenge teammates, play together during camps and keep the competition going between sessions.</p>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xl font-black text-[#101828]">5–50</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Players per club</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-[#101828]">10–55%</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Volume discount</div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-[#101828]">1 code</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Per player</div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/club" className="btn-primary px-7 py-3.5"> Explore Club Plans <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></Link>
                    <a href="mailto:studio@drixton.com" className="btn-secondary px-7 py-3.5"> Contact Us <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Mascots */}
        <MascotsShowcase />

        {/* Reviews */}
        <section className="py-14 sm:py-20 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">What players are saying</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { initials: 'MK', text: 'My stickhandling improved so much after just two weeks. I actually look forward to practising now.', role: 'Field hockey player, 15' },
                { initials: 'TS', text: 'Finally something that makes off-ice training fun. The games are addictive and my hands feel faster on the puck.', role: 'Ice hockey player, 17' },
                { initials: 'LH', text: 'Our kids love it. They pick up their sticks voluntarily now, which never happened before.', role: 'Parent of two players' },
                { initials: 'JV', text: 'I use Hockey Beats at camps and the players go crazy for it. Great energy boost between drills.', role: 'Hockey coach' },
                { initials: 'AK', text: 'The leaderboard keeps our team competitive even outside training. Everyone wants to be on top.', role: 'Club captain, 16' },
                { initials: 'PD', text: 'Simple to set up, no extra gear needed. Just my stick and a ball. Exactly what I was looking for.', role: 'Floorball player, 14' },
              ].map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-sm font-bold text-emerald-600">{review.initials}</div>
                    <div className="text-xs text-gray-400">{review.role}</div>
                  </div>
                  <p className="text-sm text-[#101828] leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  <div className="mt-3 flex gap-0.5">
                    {[1,2,3,4,5].map(s => <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101828] mb-10 text-center tracking-tight">Frequently asked questions</h2>
            <div className="space-y-3">
              {[
                { q: 'What is Hockey Beats?', a: 'Hockey Beats is an interactive training game for stick-and-ball practice. Players use real movements to play games on screen, build scores and compete in rankings.' },
                { q: 'Which sports is it for?', a: 'Hockey Beats is designed for ice hockey, field hockey and floorball. Ice hockey players use it for off-ice stickhandling practice.' },
                { q: 'How does it work?', a: 'Set up your camera, grab your stick and ball, and follow the challenges on screen. The camera tracks your ball as you play.' },
                { q: 'Do I need special equipment?', a: 'Just your hockey stick, a suitable training ball, and a device with a camera. No special sensors or training machines needed.' },
                { q: 'Can I listen to my own music?', a: 'Yes. You can connect Spotify or Apple Music and listen to your choice of songs while playing.' },
                { q: 'Is it free?', a: 'The core HockeyBeats Slalom game is free forever. Premium unlocks all 12+ games with a 7-day free trial.' },
                { q: 'Can I compete with teammates?', a: 'Yes. Scores and leaderboards let you compare results with friends and teammates.' },
                { q: 'Is it safe for children?', a: 'Hockey Beats is designed for players aged 13+. We have parental consent processes and privacy protections for younger players.' },
              ].map((faq) => (
                <details key={faq.q} className="faq-item rounded-2xl p-6 group">
                  <summary className="font-bold text-[#101828] cursor-pointer list-none flex justify-between items-center tracking-tight">
                    {faq.q}
                    <span className="text-gray-300 group-open:rotate-45 transition-transform duration-300 text-xl font-light">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 10 - Final CTA */}
        <section className="bg-gray-100 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] tracking-tight leading-[1.08]">One more game?</h2>
            <p className="mt-5 text-lg text-gray-500">Grab your stick. Your next high score isn&apos;t going to beat itself.</p>
            <div className="mt-10">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#101828] hover:bg-[#1a2540] text-white font-bold text-lg px-10 py-5 rounded-full transition-all">Play Hockey Beats <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 sm:px-10 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Logo + description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Image src="/images/hb-secondary-light.png" alt="Hockey Beats" width={180} height={165} className="h-28 w-auto mb-4" />
              <p className="text-sm text-[#101828]/60 leading-relaxed">Interactive practice for ice hockey, field hockey and floorball.</p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-4">Product</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#how-it-works" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">How it works</a>
                <a href="#games" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Games</a>
                <a href="#sports" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Sports</a>
                <Link href="/club" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">For teams</Link>
                <Link href="/achievements" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Achievements</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-4">Legal</h4>
              <div className="flex flex-col gap-2.5">
                <Link href="/privacy" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Cookie Policy</Link>
                <Link href="/safety" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Safety Guidelines</Link>
                <Link href="/legal" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">All Policies</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                <a href="mailto:studio@drixton.com" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Contact</a>
                <a href="https://drixton.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Drixton Studio</a>
                <Link href="/parental-consent" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">For Parents</Link>
                <Link href="/complaints" className="text-sm text-[#101828]/60 hover:text-[#101828] transition-colors">Support</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-[#101828]/40">© {new Date().getFullYear()} Hockey Beats by <a href="https://drixton.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#101828]/70 transition-colors">DRIXTON s. r. o.</a> All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-gray-900/10 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-[#101828] tracking-tight">
                {authMode === 'login' ? 'Log in' : authMode === 'signup' ? 'Create account' : 'Reset password'}
              </h2>
              <button onClick={() => { setShowAuth(false); setAuthError(''); setAuthSuccess(''); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {/* Social buttons */}
            {authMode !== 'forgot' && (
              <div className="space-y-2.5 mb-5">
                <button onClick={auth.signInWithGoogle} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl py-3 text-sm font-medium text-gray-700 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
                <button onClick={auth.signInWithApple} className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 rounded-xl py-3 text-sm font-medium text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.33 8.72 10.1c1.26.07 2.13.72 2.87.75.88-.17 1.72-.84 2.9-.76 1.42.1 2.48.83 3.1 2.13-2.78 1.7-2.12 5.47.58 6.52-.5 1.3-.95 2.6-1.12 3.54zM12.03 10c-.12-2.15 1.67-4 3.74-4.15.3 2.4-2.18 4.33-3.74 4.15z"/></svg>
                  Continue with Apple
                </button>
              </div>
            )}

            {authMode !== 'forgot' && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'signup' && (
                <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} className="input-field" placeholder="Your name" required />
              )}
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="input-field" placeholder="Email" required />
              {authMode !== 'forgot' && (
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="input-field" placeholder="Password" required minLength={6} />
              )}
              {authMode === 'signup' && (
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-emerald-500" />
                    <span className="text-xs text-gray-500">I confirm I am at least 13 years old.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-emerald-500" />
                    <span className="text-xs text-gray-500">I have read and agree to the <a href="/terms" className="underline hover:text-[#101828]">Terms of Service</a> and acknowledge the <a href="/privacy" className="underline hover:text-[#101828]">Privacy Policy</a>.</span>
                  </label>
                </div>
              )}
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              {authSuccess && <p className="text-green-600 text-sm">{authSuccess}</p>}
              <button type="submit" disabled={authLoading} className="btn-primary w-full disabled:opacity-50">
                {authLoading ? '...' : authMode === 'login' ? 'Log in' : authMode === 'signup' ? 'Create account' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-4 text-center space-y-1">
              {authMode === 'login' && (
                <>
                  <button onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }} className="text-xs text-gray-400 hover:text-gray-600 block mx-auto">Forgot password?</button>
                  <p className="text-xs text-gray-400">No account? <button onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }} className="text-[#101828] font-medium">Sign up</button></p>
                </>
              )}
              {authMode === 'signup' && (
                <p className="text-xs text-gray-400">Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} className="text-[#101828] font-medium">Log in</button></p>
              )}
              {authMode === 'forgot' && (
                <button onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }} className="text-xs text-gray-400 hover:text-gray-600">Back to login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hero Banner - fullscreen with background image, CTA and platform selector
const HERO_BANNERS = [
  { src: '/images/hero-clean.png', alt: 'Hockey Beats' },
  { src: '/images/banner-halloween.png', alt: 'Hockey Beats Halloween' },
];

function HeroBanner({ isLoggedIn, onLoginClick }: { isLoggedIn: boolean; onLoginClick: () => void }) {
  const [bannerIdx, setBannerIdx] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setBannerIdx(i => (i + 1) % HERO_BANNERS.length), 3000);
  };

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const go = (dir: number) => {
    setBannerIdx(i => (i + dir + HERO_BANNERS.length) % HERO_BANNERS.length);
    resetAuto();
  };

  return (
    <>
      <section className="bg-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="relative group">
            {/* Banners */}
            {HERO_BANNERS.map((b, i) => (
              <Image
                key={b.src}
                src={b.src}
                alt={b.alt}
                width={1942}
                height={809}
                className={`w-full h-auto block rounded-2xl transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                priority={i === 0}
              />
            ))}
            {/* Badges */}
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex gap-2">
              <Image src="/images/badge-1.png" alt="Top 1 Game" width={70} height={70} className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-lg" />
              <Image src="/images/badge-2.png" alt="Free to Play" width={90} height={60} className="w-20 h-auto sm:w-28 sm:h-auto drop-shadow-lg" />
            </div>
            {/* Arrows */}
            <button onClick={() => go(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <button onClick={() => go(1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {HERO_BANNERS.map((_, i) => (
                <button key={i} onClick={() => { setBannerIdx(i); resetAuto(); }} className={`rounded-full transition-all ${i === bannerIdx ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 sm:px-10 mt-8">
            <button
              onClick={() => {
                if (isLoggedIn) { window.location.href = '/dashboard'; }
                else { onLoginClick(); }
              }}
              className="font-bold text-base px-8 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97] transition-all duration-300"
            >
              Play now
            </button>
            <a
              href="#how-it-works"
              className="font-bold text-base text-[#101828] hover:text-gray-600 transition-colors inline-flex items-center gap-1.5"
            >
              Learn more
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </a>
            <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2" />
            <div className="hidden sm:flex items-center gap-3">
              <Image src="/images/stick-icehockey-dark.png" alt="Ice Hockey" width={28} height={28} className="w-7 h-7 object-contain opacity-40 hover:opacity-80 transition-opacity" title="Ice Hockey" />
              <Image src="/images/stick-fieldhockey-dark.png" alt="Field Hockey" width={28} height={28} className="w-7 h-7 object-contain opacity-40 hover:opacity-80 transition-opacity" title="Field Hockey" />
              <Image src="/images/stick-floorball-dark.png" alt="Floorball" width={28} height={28} className="w-7 h-7 object-contain opacity-40 hover:opacity-80 transition-opacity" title="Floorball" />
              <span className="text-xs font-medium text-gray-300">+ any stick</span>
            </div>
          </div>
        </div>
      </section>

      <div id="more" />
    </>
  );
}

// Start Playing section with expandable platform options
const MASCOT_DESCRIPTIONS: Record<string, string> = {
  beatbox: 'The original Hockey Beats mascot. Groovy, confident, and always ready to hit the slalom.',
  smashmouth: 'Fierce and focused. Smashmouth lives for smashing targets and breaking records.',
  spacepunk: 'A cosmic adventurer who brings arcade energy to hockey training.',
  jellix: 'Bouncy, colorful, and full of surprises. Stacking is what Jellix does best.',
  hopper: 'Swift and precise. Hopper jumps between planets with perfect timing.',
  drifty: 'Cool and slick. Drifty rides the neon track like nobody else.',
  brickzilla: 'Mighty and unstoppable. Brickzilla breaks through every wall.',
  magno: 'Electric and magnetic. Magno flips between platforms with style.',
  laserjaw: 'Sharp reflexes, sharp moves. Laserjaw dodges every laser.',
  chromer: 'Fast as lightning. Chromer catches everything in the right lane.',
  fieldster: 'The classic field hockey character. Reliable, focused, and always on target.',
  icebreaker: 'Cool under pressure. Icebreaker brings ice hockey grit to every game.',
  floorboss: 'Bold and commanding. Floorboss owns the floorball court.',
};

const GAMES = [
  { href: '/trening', img: '/images/game-hockeybeats.png', name: 'HockeyBeats', bg: '#e8e0d4' },
  { href: '/space', img: '/images/game-spaceinvaders.png', name: 'Space Invaders', bg: '#0f172a' },
  { href: '/jelly-stack', img: '/images/game-jellystack.png', name: 'Jelly Stack', bg: '#2d1b3d' },
  { href: '/orbit-hop', img: '/images/game-orbithop.png', name: 'Orbit Hop', bg: '#1a2332' },
  { href: '/neon-drift', img: '/images/game-neondrift.png', name: 'Neon Drift', bg: '#0a1628' },
  { href: '/brick-rush', img: '/images/game-brickrush.png', name: 'Brick Rush', bg: '#111111' },
  { href: '/color-catch', img: '/images/game-colorcatch.png', name: 'Color Catch', bg: '#111111' },
  { href: '/target-smash', img: '/images/game-targets.png', name: 'Target Smash', bg: '#1a1a2e' },
  { href: '/laser-maze', img: '/images/game-lasermaze.png', name: 'Laser Maze', bg: '#0f1f0f' },
  { href: '/magnet-flip', img: '/images/game-magnetflip.png', name: 'Magnet Flip', bg: '#1a1025' },
  { href: '/terciky', img: '/images/game-targets-classic.png', name: 'Targets', bg: '#f3f4f6' },
];

function GameCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) setScrollProgress(el.scrollLeft / maxScroll);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-16">
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-6 sm:px-10 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {GAMES.map((game) => (
          <div key={game.href} onClick={() => window.location.href = game.href} className="group block flex-shrink-0 snap-start cursor-pointer" style={{ width: 'clamp(160px, 30vw, 200px)' }}>
            <div className="game-tile rounded-2xl overflow-hidden relative aspect-[3/4]" style={{ background: game.bg }}>
              <Image src={game.img} alt={game.name} fill className="object-cover group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                <div className="text-xs font-bold text-white">{game.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Scroll progress bar */}
      <div className="flex items-center justify-center gap-3 mt-4 px-6 sm:px-10">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{GAMES.length} games</span>
        <div className="w-32 sm:w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-150"
            style={{ width: `${Math.max(15, scrollProgress * 100)}%` }}
          />
        </div>
        <svg className="w-3.5 h-3.5 text-gray-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </div>
    </div>
  );
}

function StartNowSection() {
  const [expanded, setExpanded] = useState<'mobile' | 'desktop' | 'tv' | null>('desktop');
  const [showSports, setShowSports] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When less than 40% of the section is visible (scrolled past), show sports
        setShowSports(entry.intersectionRatio < 0.4 && entry.boundingClientRect.top < 0);
      },
      { threshold: [0, 0.4, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#0a0a10] py-14 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-10">
          <Image src="/images/logo-startnow.png" alt="Start Now" width={300} height={100} className="h-16 sm:h-20 w-auto mx-auto" />
          <p className="mt-3 text-white text-sm">{showSports ? 'Pick your sport and start playing.' : 'Free to play on all platforms. No download required for desktop.'}</p>
        </div>

        {showSports ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto animate-[fadeIn_0.3s_ease-out]">
            {SPORTS.map(s => (
              <div key={s.id} className="flex-1">
                <Link href="/dashboard" className="w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/8 hover:border-emerald-500/50">
                  <Image src={s.image} alt={s.label} width={48} height={48} className="w-12 h-12 rounded-xl" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{s.label}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Play in browser</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <button onClick={() => setExpanded(expanded === 'mobile' ? null : 'mobile')} className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'mobile' ? 'bg-white text-[#101828] shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8'}`}>
                <svg className={`w-7 h-7 ${expanded === 'mobile' ? 'text-[#101828]' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
                <div className="text-center">
                  <div className={`text-sm font-bold ${expanded === 'mobile' ? 'text-[#101828]' : 'text-white'}`}>mobile</div>
                  <div className={`text-[10px] ${expanded === 'mobile' ? 'text-gray-400' : 'text-white/30'}`}>iOS & Android</div>
                </div>
              </button>
              {expanded === 'mobile' && (
                <div className="mt-2 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-5 py-3">
                    <div><div className="text-sm font-medium text-white/70">App Store</div><div className="text-[10px] text-white/20">Coming soon</div></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-5 py-3">
                    <div><div className="text-sm font-medium text-white/70">Google Play</div><div className="text-[10px] text-white/20">Coming soon</div></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <button onClick={() => setExpanded(expanded === 'desktop' ? null : 'desktop')} className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'desktop' ? 'bg-white text-[#101828] shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8'}`}>
                <svg className={`w-7 h-7 ${expanded === 'desktop' ? 'text-[#101828]' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                <div className="text-center">
                  <div className={`text-sm font-bold ${expanded === 'desktop' ? 'text-[#101828]' : 'text-white'}`}>desktop</div>
                  <div className={`text-[10px] ${expanded === 'desktop' ? 'text-gray-400' : 'text-white/30'}`}>Mac & Windows</div>
                </div>
              </button>
              {expanded === 'desktop' && (
                <div className="mt-2 animate-[fadeIn_0.2s_ease-out]">
                  <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl px-5 py-3.5 transition-all">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <div className="text-sm font-bold text-white">Play in browser</div>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-1">
              <button onClick={() => setExpanded(expanded === 'tv' ? null : 'tv')} className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'tv' ? 'bg-white text-[#101828] shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8'}`}>
                <svg className={`w-7 h-7 ${expanded === 'tv' ? 'text-[#101828]' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="13" rx="2" /><line x1="7" y1="21" x2="17" y2="21" /><line x1="9" y1="17" x2="9" y2="21" /><line x1="15" y1="17" x2="15" y2="21" /></svg>
                <div className="text-center">
                  <div className={`text-sm font-bold ${expanded === 'tv' ? 'text-[#101828]' : 'text-white'}`}>tv</div>
                  <div className={`text-[10px] ${expanded === 'tv' ? 'text-gray-400' : 'text-white/30'}`}>Smart TV</div>
                </div>
              </button>
              {expanded === 'tv' && (
                <div className="mt-2 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-5 py-3">
                    <div><div className="text-sm font-medium text-white/70">Smart TV</div><div className="text-[10px] text-white/20">Coming soon</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AudienceTabs() {
  const [tab, setTab] = useState<'players' | 'coaches' | 'parents'>('players');
  const tabs = [
    { id: 'players' as const, label: 'Players', title: 'Practice without the practice feeling.', desc: 'Your next high score is waiting. Play your favorite challenges, build your streak, challenge your friends and keep improving your stickhandling even when team practice is over.', points: ['Compete with friends and teammates', 'Build your own training routine', 'See your scores and progress'] },
    { id: 'coaches' as const, label: 'Coaches', title: 'Make every player want one more rep.', desc: 'Bring a new kind of energy to hockey training. Use Hockey Beats as a playful addition to camps, team sessions and independent practice.', points: ['Add engaging activities to camps and sessions', 'Encourage practice outside club hours', 'Use scores and activity as motivational feedback'] },
    { id: 'parents' as const, label: 'Parents', title: 'Screen time that gets them moving.', desc: 'They want to play games. You want them to move, learn and enjoy their sport. Hockey Beats brings both together through active gameplay with familiar hockey equipment.', points: ['Encourages active, independent practice', 'Uses their own stick and ball', 'Easy to start with a suitable camera and screen'] },
  ];
  const active = tabs.find(t => t.id === tab)!;

  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="flex justify-center gap-2 mb-10">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${tab === t.id ? 'bg-[#101828] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight mb-4">{active.title}</h3>
          <p className="text-base text-gray-500 leading-relaxed mb-8">{active.desc}</p>
          <div className="flex flex-col gap-3">
            {active.points.map(p => (
              <div key={p} className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                <span className="text-sm font-medium text-[#101828]">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MascotsShowcase() {
  const [selected, setSelected] = useState(0);
  const mascot = MASCOTS[selected];

  return (
    <section className="py-16 sm:py-20 bg-[#0a0a10]">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">Choose your favorite</h2>
          <p className="mt-4 text-lg text-white max-w-xl mx-auto">Discover a crew of bold characters, each with a game of their own.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main highlighted mascot */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: `radial-gradient(circle, #22c55e40 0%, #22c55e15 40%, transparent 70%)`, transform: 'scale(2.2)' }} />
              <Image
                src={mascot.image}
                alt={mascot.name}
                width={220}
                height={220}
                className="relative z-10 rounded-2xl"
                key={mascot.id}
              />
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{mascot.name}</div>
            <div className="text-sm text-emerald-400 font-bold mt-1">{mascot.adjective}</div>
            <p className="text-sm text-white mt-4 max-w-xs leading-relaxed">{MASCOT_DESCRIPTIONS[mascot.id] || ''}</p>
          </div>

          {/* Sidebar with all mascots */}
          <div className="lg:w-[420px]">
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-2">
              {MASCOTS.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(i)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-300 ${selected === i ? 'bg-white/10 border border-emerald-500/50' : 'bg-white/3 border border-transparent hover:bg-white/5'}`}
                >
                  <Image src={m.image} alt={m.name} width={56} height={56} className={`rounded-lg transition-transform duration-300 ${selected === i ? 'animate-mascot-bounce' : ''}`} />
                  <div className={`text-[10px] font-bold truncate w-full text-center ${selected === i ? 'text-white' : 'text-white/70'}`}>{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

