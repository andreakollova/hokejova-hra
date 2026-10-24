'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import { useAuth } from '@/hooks/useAuth';
import { MASCOTS } from '@/lib/mascots';
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
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    if (authMode === 'signup') {
      if (!authAge || !authDob) { setAuthError('Please enter your date of birth.'); setAuthLoading(false); return; }
      if (authAge === 'under13') { setAuthError('You must be at least 13 years old to use Hockey Beats.'); setAuthLoading(false); return; }
      if (authAge === 'under16' && !parentEmail.trim()) { setAuthError('Please enter your parent or guardian\'s email.'); setAuthLoading(false); return; }
      const err = await auth.signUpWithEmail(authEmail, authPassword, authName);
      if (err) { setAuthError(err); }
      else {
        // If under 16, request parental consent
        if (authAge === 'under16' && parentEmail.trim()) {
          await fetch('/api/parental-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childUsername: authName, childEmail: authEmail, parentEmail: parentEmail.trim() }),
          }).catch(() => {});
          setAuthSuccess('Account created! We sent a consent request to your parent. Check your email to verify your account.');
        } else {
          setAuthSuccess('Check your email to confirm your account.');
        }
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
      <Onboarding onComplete={(profile) => {
        const isMinor = authAge === 'under16';
        setProfile({ ...profile, isMinor, privateProfile: isMinor });
        setShowOnboarding(false);
        window.location.href = '/dashboard';
      }} />
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
          <nav className="flex items-center gap-5 sm:gap-7">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden sm:block">How it works</a>
            <a href="#games" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden sm:block">Games</a>
            <a href="#platforms" className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden sm:block">Play anywhere</a>
            {isLoggedIn ? (
              <>
                {engLoaded && getStreak().currentStreak > 0 && (
                  <StreakBadge currentStreak={getStreak().currentStreak} frozen={getStreak().frozen} size="sm" />
                )}
                <Link href="/dashboard" className="text-sm font-medium text-gray-700">{displayName}</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAuth(true)} className="text-sm font-medium text-gray-600 hover:text-[#101828] transition-colors hidden sm:block">Log in</button>
                <button onClick={() => setShowAuth(true)} className="text-sm font-bold px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300">Sign up</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* 1. Hero banner - fullscreen with photo */}
        <HeroBanner isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} />

        {/* 01 - Hero subtitle */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">01 / The game</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Turn your hockey stick<br />into a game controller.</h2>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Meet Hockey Beats, the rhythm-based hockey game where you play with a real stick and ball. Follow the beat, hit your targets and turn every session into a new high score.</p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary px-8 py-4">Play Now</Link>
              <a href="#how-it-works" className="btn-secondary px-8 py-4">How It Works</a>
            </div>
          </div>
        </section>

        {/* 02 - The Game */}
        <section className="bg-gray-50/50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">02 / The game</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Practice your coach will notice.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">Hockey Beats makes stickhandling practice something you&apos;ll actually look forward to. Play rhythm-based challenges with your real stick and ball, improve your control and coordination, and build the confidence to keep your head up on the pitch.</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-4xl font-black text-emerald-500">80%</div>
                  <p className="text-sm text-gray-400 text-left">Reported improvement in stickhandling after one month of playing Hockey Beats.</p>
                </div>
                <p className="mt-4 text-base text-[#101828] font-bold italic">More practice, better habits, stronger skills.</p>
              </div>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden">
                  <Image src="/images/hero-indoor.png" alt="Player practising" width={600} height={450} className="w-full h-auto" />
                </div>
                <div className="absolute -right-4 -bottom-4 sm:right-4 sm:bottom-4 animate-[float_3s_ease-in-out_infinite]">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, #a855f740 0%, transparent 70%)', transform: 'scale(2)' }} />
                    <Image src="/images/mascots/mascot-magnet-flip.webp" alt="Magno" width={90} height={90} className="relative z-10 drop-shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03 - Progression */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">03 / Progression</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Get hooked on getting better.</h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">Earn XP, collect badges, build your streak and climb the leaderboards. Every session gives you another reason to play and another chance to beat your best.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'XP & Levels', icon: '⚡', desc: 'Earn experience with every game you play' },
                { title: 'Badges', icon: '🏅', desc: 'Collect achievements for milestones and challenges' },
                { title: 'Daily Streaks', icon: '🔥', desc: 'Play every day to build your streak' },
                { title: 'Leaderboards', icon: '🏆', desc: 'Compete with friends and teammates' },
              ].map(item => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-base font-extrabold text-[#101828] mb-1 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 - Real Skills */}
        <section className="bg-gray-50/50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-3xl overflow-hidden">
                  <Image src="/images/step-gear.jpg" alt="Real hockey equipment" width={600} height={450} className="w-full h-auto" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">04 / Real skills</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Train your stickhandling while keeping your head up.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">This isn&apos;t another game you play with your thumbs. Hockey Beats gets you moving with your actual hockey stick and ball, encouraging better ball control, coordination, reactions and heads-up stickhandling.</p>
                <p className="mt-3 text-base text-gray-400 italic">The more you play, the more you practice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 05 - Accessibility */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">05 / Accessibility</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Your room is your arena.</h2>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">No expensive training machines. No special sensors. No trip to the pitch.<br />Just your stick, your ball, a camera and a screen. Open Hockey Beats in your desktop browser and start playing wherever you have enough safe space.</p>
            <div className="mt-8">
              <Link href="/dashboard" className="btn-accent px-8 py-4">Start Playing for Free</Link>
            </div>
          </div>
        </section>

        {/* 06 - How it works */}
        <section id="how-it-works" className="bg-gray-50/50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">06 / How it works</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Three steps to your next high score.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Grab your gear', desc: 'Get your hockey stick and ball ready.', img: '/images/step-gear.jpg' },
                { step: '02', title: 'Set up your camera', desc: 'Let Hockey Beats track your ball as you play.', img: '/images/step-camera.jpg' },
                { step: '03', title: 'Play the beat', desc: 'Follow the challenges, score points and level up.', img: '/images/step-play.jpg' },
              ].map(item => (
                <div key={item.step} className="group">
                  <div className="rounded-2xl overflow-hidden mb-5">
                    <Image src={item.img} alt={item.title} width={400} height={300} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                      <span className="text-sm font-black text-white">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#101828] tracking-tight">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 07 - For players, coaches, parents */}
        <AudienceTabs />

        {/* 08 - Club experience */}
        <section className="bg-gray-50/50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">For clubs &amp; teams</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Bring the whole team into the game.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">Turn individual practice into something your players share. Challenge teammates, play together during camps and keep the competition going between sessions.</p>
                <p className="mt-3 text-base text-gray-400">Give young players another reason to pick up their sticks, even outside club training.</p>
                <div className="mt-8">
                  <Link href="/club" className="btn-primary px-8 py-4">Explore Hockey Beats for Clubs</Link>
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden">
                <Image src="/images/parents.png" alt="Club training" width={600} height={400} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* 09 - Bigger picture */}
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Hockey doesn&apos;t end when practice does.</h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">The best part of hockey shouldn&apos;t be limited to scheduled training sessions. Hockey Beats makes it easier to keep playing at home, stay connected to the sport and build a habit of regular practice.</p>
            <p className="mt-3 text-base text-gray-400">We&apos;re starting in your desktop browser, with a bigger vision to bring Hockey Beats to more screens in the future.</p>
          </div>
        </section>

        {/* Games */}
        <section id="games" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Game library</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Different games keep practice interesting.</h2>
            </div>
            <div className="relative -mx-6 sm:-mx-10">
              <div className="flex gap-5 overflow-x-auto px-6 sm:px-10 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {[
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
                ].map((game) => (
                  <div key={game.href} onClick={() => window.location.href = game.href} className="group block flex-shrink-0 snap-start cursor-pointer" style={{ width: 'clamp(200px, 40vw, 260px)' }}>
                    <div className="game-tile rounded-3xl overflow-hidden relative aspect-[3/4]" style={{ background: game.bg }}>
                      <Image src={game.img} alt={game.name} fill className="object-cover group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
                        <div className="text-sm font-bold text-white mb-2">{game.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mascots */}
        <MascotsShowcase />

        {/* Sports */}
        <section id="sports" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#101828] leading-[1.08] tracking-tight">Three sports. One game.</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { img: '/images/sport-icehockey.png', name: 'Ice hockey', color: '#3b82f6' },
                { img: '/images/sport-fieldhockey.png', name: 'Field hockey', color: '#22c55e' },
                { img: '/images/sport-floorball.png', name: 'Floorball', color: '#f59e0b' },
              ].map(sport => (
                <div key={sport.name} className="flex flex-col items-center text-center group">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${sport.color}30 0%, transparent 70%)`, transform: 'scale(1.8)' }} />
                    <Image src={sport.img} alt={sport.name} width={160} height={160} className="w-32 h-32 relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#101828] tracking-tight">{sport.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10 - Final CTA */}
        <section className="bg-[#101828] py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">One more game?</h2>
            <p className="mt-5 text-lg text-white/50">Grab your stick. Your next high score isn&apos;t going to beat itself.</p>
            <div className="mt-10">
              <Link href="/dashboard" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg px-10 py-5 rounded-full transition-all">Play Hockey Beats</Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 sm:px-10 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Image src="/images/hb-secondary-light.png" alt="Hockey Beats" width={120} height={110} className="h-16 w-auto mb-2" />
              <p className="text-xs text-gray-400 tracking-wide">Interactive practice for ice hockey, field hockey and floorball.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium tracking-tight">
              <a href="#how-it-works" className="hover:text-[#101828] transition-colors duration-300">How it works</a>
              <a href="#sports" className="hover:text-[#101828] transition-colors duration-300">Sports</a>
              <a href="#games" className="hover:text-[#101828] transition-colors duration-300">Games</a>
              <a href="#parents" className="hover:text-[#101828] transition-colors duration-300">For parents</a>
              <a href="#teams" className="hover:text-[#101828] transition-colors duration-300">For teams</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400 tracking-wide mb-4">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-gray-700 transition-colors">Cookie Policy</Link>
              <Link href="/legal" className="hover:text-gray-700 transition-colors">All Policies</Link>
            </div>
            <p className="text-[10px] text-gray-300">© {new Date().getFullYear()} DRIXTON s. r. o. All rights reserved. Apple Music is a trademark of Apple Inc.</p>
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
                <div className="space-y-3 bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of birth</p>
                  <p className="text-xs text-gray-400">We use your date of birth to check eligibility and apply age-appropriate protections.</p>
                  <input
                    type="date"
                    value={authDob}
                    onChange={e => {
                      setAuthDob(e.target.value);
                      if (e.target.value) {
                        const birth = new Date(e.target.value);
                        const now = new Date();
                        let age = now.getFullYear() - birth.getFullYear();
                        const m = now.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                        if (age < 13) setAuthAge('under13');
                        else if (age < 16) setAuthAge('under16');
                        else setAuthAge('16plus');
                      } else {
                        setAuthAge('');
                      }
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="input-field text-sm"
                    required
                  />

                  {authAge === 'under13' && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-700 font-medium">Hockey Beats is for players aged 13 and older.</p>
                      <p className="text-xs text-red-600 mt-1">You need to be at least 13 years old to create an account.</p>
                    </div>
                  )}

                  {authAge === 'under16' && (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">
                        Because you are under 16, we need your parent or guardian to approve your account before you can use Hockey Beats.
                      </p>
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        className="input-field text-sm"
                        placeholder="Parent or guardian's email"
                        required
                      />
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-emerald-500" />
                    <span className="text-xs text-gray-500">I am at least 13 years old.</span>
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
function HeroBanner({ isLoggedIn, onLoginClick }: { isLoggedIn: boolean; onLoginClick: () => void }) {
  return (
    <>
      <section className="bg-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <Image src="/images/hero-clean.png" alt="Hockey Beats" width={1942} height={809} className="w-full h-auto block rounded-2xl" priority />
          <div className="mt-6 flex flex-wrap items-center gap-4 px-6 sm:px-10">
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

function AudienceTabs() {
  const [tab, setTab] = useState<'players' | 'coaches' | 'parents'>('players');
  const tabs = [
    { id: 'players' as const, label: 'Players', title: 'Practice without the practice feeling.', desc: 'Your next high score is waiting. Play your favorite challenges, build your streak, challenge your friends and keep improving your stickhandling even when team practice is over.', points: ['Compete with friends and teammates', 'Build your own training routine', 'See your scores and progress'] },
    { id: 'coaches' as const, label: 'Coaches', title: 'Make every player want one more rep.', desc: 'Bring a new kind of energy to hockey training. Use Hockey Beats as a playful addition to camps, team sessions and independent practice.', points: ['Add engaging activities to camps and sessions', 'Encourage practice outside club hours', 'Use scores and activity as motivational feedback'] },
    { id: 'parents' as const, label: 'Parents', title: 'Screen time that gets them moving.', desc: 'They want to play games. You want them to move, learn and enjoy their sport. Hockey Beats brings both together through active gameplay with familiar hockey equipment.', points: ['Encourages active, independent practice', 'Uses their own stick and ball', 'Easy to start with a suitable camera and screen'] },
  ];
  const active = tabs.find(t => t.id === tab)!;

  return (
    <section className="py-20 sm:py-28">
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
    <section className="py-24 sm:py-32 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">Choose your favorite</h2>
          <p className="mt-4 text-lg text-white/40 max-w-xl mx-auto">Discover a crew of bold characters, each with a game of their own.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main highlighted mascot */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ background: `radial-gradient(circle, #22c55e40 0%, #22c55e15 40%, transparent 70%)`, transform: 'scale(2.2)' }} />
              <Image
                src={mascot.imageHappy}
                alt={mascot.name}
                width={220}
                height={220}
                className="relative z-10 rounded-2xl animate-mascot-bounce"
                key={mascot.id}
              />
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{mascot.name}</div>
            <div className="text-sm text-emerald-400 font-bold mt-1">{mascot.adjective}</div>
            <p className="text-sm text-white/50 mt-4 max-w-xs leading-relaxed">{MASCOT_DESCRIPTIONS[mascot.id] || ''}</p>
          </div>

          {/* Sidebar with all mascots */}
          <div className="lg:w-80">
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
              {MASCOTS.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(i)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all duration-300 ${selected === i ? 'bg-white/10 border border-emerald-500/50' : 'bg-white/3 border border-transparent hover:bg-white/5'}`}
                >
                  <Image src={selected === i ? m.imageHappy : m.image} alt={m.name} width={56} height={56} className="rounded-lg" />
                  <div className={`text-[10px] font-bold truncate w-full text-center ${selected === i ? 'text-white' : 'text-white/40'}`}>{m.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

