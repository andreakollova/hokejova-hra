'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import StreakBadge from '@/components/ui/StreakBadge';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { settings, isLoggedIn, login, logout } = useSettings();
  const { getStreak, getLevelProgress, loaded: engLoaded } = useEngagement();
  const [showAuth, setShowAuth] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const err = login(loginUsername, loginPassword);
    if (err) { setLoginError(err); } else { window.location.href = '/dashboard'; }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_20px_-6px_rgba(0,0,0,0.08)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/hb-icon.png" alt="" width={32} height={32} className="h-6 w-auto" />
            <span className="text-base font-black tracking-tight text-gray-900" style={{ fontFamily: "'GC Bustle Sans', sans-serif" }}>hockey beats</span>
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">How it works</a>
            <a href="#games" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Games</a>
            <a href="#platforms" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Play anywhere</a>
            {isLoggedIn ? (
              <>
                {engLoaded && getStreak().currentStreak > 0 && (
                  <StreakBadge currentStreak={getStreak().currentStreak} frozen={getStreak().frozen} size="sm" />
                )}
                <Link href="/dashboard" className="text-sm font-medium text-gray-700">{settings.username}</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAuth(true)} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Log in</button>
                <button onClick={() => setShowAuth(true)} className="text-sm font-bold px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300">Sign up</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* 1. Hero banner - fullscreen with photo */}
        <HeroBanner isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuth(true)} />

        {/* Start Playing */}
        <StartPlayingSection />

        {/* 2. Gameplay */}
        <section className="bg-gray-50/50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Better play starts with keeping your head up.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                  When you&apos;re always watching the ball, you miss what&apos;s happening around you.
                </p>
                <p className="mt-3 text-base text-gray-400 leading-relaxed">
                  HockeyBeats puts the action on the screen in front of you. As you follow it, you practise handling the ball while looking ahead — an important habit for spotting teammates, finding space and recognising your next opportunity.
                </p>
                <p className="mt-3 text-sm text-gray-400 italic">
                  You&apos;re concentrating on the game. You might not even realise how much you&apos;re practising.
                </p>
              </div>
              <div>
                <div className="rounded-3xl overflow-hidden">
                  <Image src="/images/hero-indoor.png" alt="Player practising at home" width={600} height={450} className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Music - right after gameplay */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative h-48 flex items-center justify-center order-2 lg:order-1">
                <div className="absolute animate-[bounce_3s_ease-in-out_infinite]" style={{ left: '15%', top: '10%' }}>
                  <svg className="w-16 h-16 text-[#1DB954] drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </div>
                <div className="absolute animate-[bounce_3.5s_ease-in-out_infinite_0.5s]" style={{ right: '15%', bottom: '10%' }}>
                  <img src="/images/icon-applemusic.svg" alt="Apple Music" className="w-16 h-16 rounded-2xl drop-shadow-lg" />
                </div>
                <span className="text-4xl font-light text-gray-300">+</span>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Audio</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Your favourite music can come to training, too.</h2>
                <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                  Connect Spotify or Apple Music and listen to any song while you play. Put on your usual playlist, find something that gets you moving or listen to the same favourite again.
                </p>
                <p className="mt-3 text-base text-gray-400">Music adds to the experience while you focus on the game and your practice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Game previews */}
        <section id="games" className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Game library</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Different games keep practice interesting.</h2>
              <p className="mt-5 text-base text-gray-500">Start with HockeyBeats, then explore extra games that give you another reason to pick up your stick.</p>
            </div>

            {/* Horizontal scrolling carousel */}
            <div className="relative -mx-6 sm:-mx-10">
              <div className="flex gap-5 overflow-x-auto px-6 sm:px-10 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {[
                  { href: '/trening', img: '/images/game-hockeybeats.png', name: 'HockeyBeats', bg: '#e8e0d4' },
                  { href: '/space', img: '/images/game-spaceinvaders.png', name: 'Space Invaders', bg: '#0f172a' },
                  { href: '/jelly-stack', img: '/images/game-jellystack.png', name: 'Jelly Stack', bg: '#faf5eb' },
                  { href: '/orbit-hop', img: '/images/game-orbithop.png', name: 'Orbit Hop', bg: '#ede9fe' },
                  { href: '/neon-drift', img: '/images/game-neondrift.png', name: 'Neon Drift', bg: '#0a1628' },
                  { href: '/brick-rush', img: '/images/game-brickrush.png', name: 'Brick Rush', bg: '#111111' },
                  { href: '/magnet-flip', img: '/images/game-magnetflip.png', name: 'Magnet Flip', bg: '#1a1025' },
                  { href: '/laser-maze', img: '/images/game-lasermaze.png', name: 'Laser Maze', bg: '#0f1f0f' },
                  { href: '/terciky', img: '/images/game-targets.png', name: 'Targets', bg: '#f3f4f6' },
                  { href: '/osmicky-terciky', img: '/images/game-figure8.png', name: 'Figure 8', bg: '#f3f4f6' },
                  { href: '/osmicky', img: '/images/game-classic8s.png', name: 'Classic 8s', bg: '#f3f4f6' },
                ].map((game) => (
                  <Link key={game.href} href={game.href} className="group block flex-shrink-0 snap-start" style={{ width: 'clamp(200px, 40vw, 260px)' }}>
                    <div className="game-tile rounded-3xl overflow-hidden relative aspect-[3/4]" style={{ background: game.bg }}>
                      <Image src={game.img} alt={game.name} fill className="object-cover group-hover:scale-105 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-sm font-bold text-white mb-2">{game.name}</div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full group-hover:bg-white/30 transition-all">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          Play
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Devices / Play anywhere section */}
        <section id="platforms" className="relative overflow-hidden">
          <div className="relative">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image src="/images/devices-bg.png" alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a1030]/95 via-[#0a1030]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1030]/60 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
              <div className="max-w-lg">
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight">
                  your game.<br />your screen.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed">
                  Play in your browser after signing in, or download HockeyBeats for mobile, desktop, or TV.
                </p>

                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418', label: 'Browser' },
                    { icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3', label: 'Mobile' },
                    { icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z', label: 'Desktop' },
                    { icon: 'M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z', label: 'TV' },
                  ].map((p) => (
                    <div key={p.label} className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 px-3">
                      <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={p.icon} /></svg>
                      <span className="text-xs font-bold text-white/80">{p.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (isLoggedIn) { window.location.href = '/dashboard'; }
                      else { setShowAuth(true); }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-full transition-all inline-flex items-center gap-2"
                  >
                    Log in to play
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                  <a href="#" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm px-6 py-3 rounded-full transition-all inline-flex items-center gap-2">
                    Get the app
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sports */}
        <section id="sports" className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Select your sport</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Three sports. A shared reason to keep practising.</h2>
              <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto">
                Whether you play on ice, on the pitch or in the sports hall, time with your stick matters.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="sport-card flex flex-col items-center text-center">
                <Image src="/images/sport-icehockey.png" alt="Ice hockey puck" width={120} height={120} className="w-24 h-24 mb-5" />
                <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Ice hockey</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Keep working on your stickhandling away from the rink, with off-ice practice that gets you moving and looking ahead.</p>
              </div>
              <div className="sport-card flex flex-col items-center text-center">
                <Image src="/images/sport-fieldhockey.png" alt="Field hockey ball" width={120} height={120} className="w-24 h-24 mb-5" />
                <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Field hockey</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Spend more time on ball control and practise lifting your eyes while your stick stays involved.</p>
              </div>
              <div className="sport-card flex flex-col items-center text-center">
                <Image src="/images/sport-floorball.png" alt="Floorball" width={120} height={120} className="w-24 h-24 mb-5" />
                <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Floorball</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Give your stick skills extra attention outside team training, with games that keep you engaged in every movement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Why HockeyBeats */}
        <section className="bg-gray-50/50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Make practice something you look forward to.</h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Getting better takes repetition. Finding the motivation to repeat the same movements can be the harder part. HockeyBeats gives those movements a purpose inside a game.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-sm font-black text-gray-400">01</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">Build control through repetition</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Give yourself more opportunities to get comfortable with your stick and ball.</p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-sm font-black text-gray-400">02</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">Practise looking ahead</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Follow the screen while keeping the ball moving, rather than watching your stick the whole time.</p>
              </div>
              <div className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-sm font-black text-gray-400">03</span>
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">Build a habit that lasts</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Make individual practice easier to return to with different games, personal bests and friendly competition.</p>
              </div>
            </div>
          </div>
        </section>
        {/* 6. How it works */}
        <section id="how-it-works" className="bg-gray-50/50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">Quest steps</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight text-center mb-16">Set up at home and get straight into practice.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Prepare your space', desc: 'Get your stick, ball and training mat ready, leaving enough clear space to move comfortably.' },
                { step: '2', title: 'Open the app', desc: 'Position your phone and follow the camera setup instructions. Make sure you can see the screen clearly.' },
                { step: '3', title: 'Choose a game', desc: 'Start with the HockeyBeats slalom or try one of the extra games.' },
                { step: '4', title: 'Play and check your score', desc: 'Follow the action, keep the ball moving and see how you did. Come back to improve your result.' },
              ].map((item) => (
                <div key={item.step} className="achievement-step">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center mb-5 shadow-md shadow-emerald-500/20">
                    <span className="text-lg font-black text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  {/* Achievement progress bar */}
                  <div className="progress-bar mt-5">
                    <div style={{ width: `${Number(item.step) * 25}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-14">
              <Link href="/trening" className="btn-primary px-8 py-4">Start your first session</Link>
            </div>
          </div>
        </section>

        {/* 7. Scores and rankings */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Leaderboard</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">See your progress. Give your teammates something to chase.</h2>
            <p className="mt-6 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              Your score gives you a clear goal for the next session. Rankings bring your teammates into it, too. Compare results, challenge each other and keep the competition going between training sessions.
            </p>
            {/* Gaming stat badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="inline-flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 font-medium">Rating</p>
                  <p className="text-sm font-extrabold text-gray-900 tracking-tight">4.8 / 5.0</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 font-medium">Active players</p>
                  <p className="text-sm font-extrabold text-gray-900 tracking-tight">Growing daily</p>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <Link href="/rebricek" className="btn-primary px-8 py-4">Set your first score</Link>
            </div>
          </div>
        </section>

        {/* 9. Mobile app */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-4">Your practice starts on your phone.</h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-14">
              Open HockeyBeats to choose a game, start playing and keep track of your results. During play, your phone becomes the screen you follow.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: 'Your games in one place', desc: 'Move between the HockeyBeats slalom and extra games whenever you want to change things up.' },
                { title: 'A record of your results', desc: 'See your scores and personal bests, so you know what you\'re working towards.' },
                { title: 'A connection to your teammates', desc: 'Check the rankings and see how your latest result compares.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                  <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. For parents */}
        <section id="parents" className="bg-gray-50/50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">For parents</p>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-4">Help them build a practice habit of their own.</h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Team training gives children coaching, structure and time with their teammates. Individual practice gives them more opportunities to work with their stick. HockeyBeats makes that extra practice easier to enjoy.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden">
                <Image src="/images/parents.png" alt="Child practising at home with parent watching" width={600} height={400} className="w-full h-auto" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Active time with a purpose', desc: 'Children play by moving and working with a real stick and ball.' },
                { title: 'Practice with their eyes up', desc: 'Following the screen encourages them to look ahead while handling the ball.' },
                { title: 'Extra repetitions between team sessions', desc: 'They can spend more time on individual skills at home, alongside the guidance they receive from their coach.' },
                { title: 'Motivation they can make their own', desc: 'Whether they enjoy beating a personal best, competing with friends or trying another game, there\'s more than one reason to practise.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                  <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <a href="#how-it-works" className="btn-secondary px-8 py-4">See HockeyBeats in action</a>
            </div>
          </div>
        </section>

        {/* 11. Equipment */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Equipment</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Turn a clear space into a place to practise.</h2>
            <p className="mt-6 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              You'll need your stick, a suitable training ball, the mat and a supported phone with a camera. Follow the setup instructions for your sport and leave enough space for your movements.
            </p>
          </div>
        </section>

        {/* 12. Teams and coaches */}
        <section id="teams" className="bg-gray-50/50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">For teams</p>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">Keep players engaged between training sessions.</h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                HockeyBeats gives individual practice a shared goal. Players can work on their own, compare scores and bring a little friendly competition back to the team.
              </p>
              <p className="mt-3 text-base text-gray-400">
                For coaches, it's another way to encourage regular time with the stick. For clubs, it's an interactive activity to introduce at training, team events or player development sessions.
              </p>
              <div className="mt-10">
                <a href="mailto:hello@hockeybeats.com" className="btn-primary px-8 py-4">Bring HockeyBeats to your team</a>
              </div>
            </div>
          </div>
        </section>

        {/* 13. FAQ */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-6 sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 text-center">Help menu</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-14 text-center tracking-tight">Frequently asked questions</h2>
            <div className="space-y-3">
              {[
                { q: 'What is HockeyBeats?', a: 'HockeyBeats is an interactive training app for stick-and-ball practice. Players use real movements to play games on screen, build scores and compete in rankings.' },
                { q: 'Which sports is it for?', a: 'HockeyBeats is designed for ice hockey, field hockey and floorball. Ice hockey players use it for off-ice practice.' },
                { q: 'How does it encourage playing with your head up?', a: 'The game takes place on a screen in front of you. To follow the action while handling the ball, you practise lifting your eyes and looking ahead.' },
                { q: 'What games can I play?', a: 'The main HockeyBeats game features a slalom. Extra games include a space-themed arcade game, with other games to explore in the app.' },
                { q: 'Can I listen to my own music?', a: 'Yes. You can connect Spotify or Apple Music and listen to your choice of songs while playing.' },
                { q: 'What equipment do I need?', a: 'A stick, suitable training ball, mat and supported phone with a camera. Check the setup requirements for your sport before starting.' },
                { q: 'Can I compete with teammates?', a: 'Yes. Scores and rankings let you compare results with friends and teammates, as well as work towards your own personal best.' },
                { q: 'Does it replace team training?', a: 'No. HockeyBeats adds individual practice between team sessions. Coaches remain essential for technical feedback, team play and development.' },
              ].map((faq) => (
                <details key={faq.q} className="faq-item rounded-2xl p-6 group">
                  <summary className="font-bold text-gray-900 cursor-pointer list-none flex justify-between items-center tracking-tight">
                    {faq.q}
                    <span className="text-gray-300 group-open:rotate-45 transition-transform duration-300 text-xl font-light">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 14. Final CTA */}
        <section className="bg-gray-50/50 py-28 sm:py-36">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.08]">Give your next training session a head start.</h2>
            <p className="mt-5 text-lg text-gray-500 max-w-md mx-auto">
              Pick up your stick, play a game and put in the practice you'll take back to your team.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/trening" className="btn-primary text-base px-8 py-4">Start training</Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">Watch it in action</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 sm:px-10 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Image src="/images/hb-logo-stacked.png" alt="HockeyBeats" width={80} height={56} className="h-10 w-auto mb-2" />
              <p className="text-xs text-gray-400 tracking-wide">Interactive practice for ice hockey, field hockey and floorball.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium tracking-tight">
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors duration-300">How it works</a>
              <a href="#sports" className="hover:text-gray-900 transition-colors duration-300">Sports</a>
              <a href="#games" className="hover:text-gray-900 transition-colors duration-300">Games</a>
              <a href="#parents" className="hover:text-gray-900 transition-colors duration-300">For parents</a>
              <a href="#teams" className="hover:text-gray-900 transition-colors duration-300">For teams</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400 tracking-wide">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </footer>

      {/* Login modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-gray-900/10 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Log in</h2>
              <button onClick={() => { setShowAuth(false); setLoginError(''); }} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="input-field" placeholder="Username" required />
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="input-field" placeholder="Password" required />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" className="btn-primary w-full">Log in</button>
            </form>
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
              style={{ fontFamily: "'GC Bustle Sans', sans-serif" }}
            >
              Play now
            </button>
            <a
              href="#how-it-works"
              className="font-bold text-base text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center gap-1.5"
              style={{ fontFamily: "'GC Bustle Sans', sans-serif" }}
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
function StartPlayingSection() {
  const [expanded, setExpanded] = useState<'mobile' | 'desktop' | 'tv' | null>('mobile');

  return (
    <section className="relative bg-[#111111] py-14 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-10">
          <Image src="/images/logo-startnow.png" alt="Start Now" width={300} height={100} className="h-16 sm:h-20 w-auto mx-auto" />
          <p className="mt-3 text-white text-sm">Free on all platforms.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
          {/* Mobile */}
          <div className="flex-1">
            <button
              onClick={() => setExpanded(expanded === 'mobile' ? null : 'mobile')}
              className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'mobile' ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8 hover:border-white/15'}`}
            >
              <svg className={`w-7 h-7 ${expanded === 'mobile' ? 'text-gray-900' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
              <div className="text-center">
                <div className={`text-sm font-bold tracking-tight ${expanded === 'mobile' ? 'text-gray-900' : 'text-white'}`}>mobile</div>
                <div className={`text-[10px] ${expanded === 'mobile' ? 'text-gray-400' : 'text-white/30'}`}>iOS & Android</div>
              </div>
            </button>
            {expanded === 'mobile' && (
              <div className="mt-2 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                <Link href="/trening" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                  <div className="text-sm font-medium text-white">Play on web now</div>
                </Link>
                <a href="#" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-sm font-medium text-white">App Store</div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.842l2.458 1.42c.544.317.544 1.114 0 1.43l-2.458 1.42-2.534-2.535 2.534-2.535zM5.864 3.458L16.8 9.79l-2.302 2.302-8.635-8.635z"/></svg>
                  <div className="text-sm font-medium text-white">Google Play</div>
                </a>
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="flex-1">
            <button
              onClick={() => setExpanded(expanded === 'desktop' ? null : 'desktop')}
              className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'desktop' ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8 hover:border-white/15'}`}
            >
              <svg className={`w-7 h-7 ${expanded === 'desktop' ? 'text-gray-900' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              <div className="text-center">
                <div className={`text-sm font-bold tracking-tight ${expanded === 'desktop' ? 'text-gray-900' : 'text-white'}`}>desktop</div>
                <div className={`text-[10px] ${expanded === 'desktop' ? 'text-gray-400' : 'text-white/30'}`}>Mac & Windows</div>
              </div>
            </button>
            {expanded === 'desktop' && (
              <div className="mt-2 animate-[fadeIn_0.2s_ease-out]">
                <Link href="/trening" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                  <div className="text-sm font-medium text-white">Play on web</div>
                </Link>
              </div>
            )}
          </div>

          {/* TV */}
          <div className="flex-1">
            <button
              onClick={() => setExpanded(expanded === 'tv' ? null : 'tv')}
              className={`w-full flex flex-col items-center gap-3 rounded-2xl px-6 py-6 transition-all duration-300 ${expanded === 'tv' ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border border-white/8 hover:border-white/15'}`}
            >
              <svg className={`w-7 h-7 ${expanded === 'tv' ? 'text-gray-900' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="13" rx="2" /><line x1="7" y1="21" x2="17" y2="21" /><line x1="9" y1="17" x2="9" y2="21" /><line x1="15" y1="17" x2="15" y2="21" /></svg>
              <div className="text-center">
                <div className={`text-sm font-bold tracking-tight ${expanded === 'tv' ? 'text-gray-900' : 'text-white'}`}>tv</div>
                <div className={`text-[10px] ${expanded === 'tv' ? 'text-gray-400' : 'text-white/30'}`}>Smart TV</div>
              </div>
            </button>
            {expanded === 'tv' && (
              <div className="mt-2 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                <Link href="/trening" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                  <div className="text-sm font-medium text-white">Web via HDMI</div>
                </Link>
                <a href="#" className="flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-xl px-5 py-3 transition-all">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-[8px] font-bold text-white/70">TV</div>
                  <div className="text-sm font-medium text-white">Samsung · LG · TCL · Hisense</div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
