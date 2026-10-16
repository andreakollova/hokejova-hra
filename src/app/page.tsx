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
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const err = login(loginUsername, loginPassword);
    if (err) { setLoginError(err); } else { setShowAuth(false); setLoginUsername(''); setLoginPassword(''); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation - transparent on top, glass on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/20'
          : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src={scrolled ? '/images/hb-logo.png' : '/images/hb-logo-white.png'}
              alt="HockeyBeats"
              width={140}
              height={32}
              className={`transition-all duration-300 ${scrolled ? 'h-7 w-auto' : 'h-8 w-auto'}`}
            />
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7">
            <a href="#how-it-works" className={`text-sm transition-colors hidden sm:block ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>How it works</a>
            <a href="#sports" className={`text-sm transition-colors hidden sm:block ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>Sports</a>
            <a href="#games" className={`text-sm transition-colors hidden sm:block ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>Games</a>
            <a href="#parents" className={`text-sm transition-colors hidden sm:block ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>For parents</a>
            <a href="#teams" className={`text-sm transition-colors hidden sm:block ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/70 hover:text-white'}`}>For teams</a>
            {isLoggedIn ? (
              <>
                {engLoaded && getStreak().currentStreak > 0 && (
                  <StreakBadge currentStreak={getStreak().currentStreak} frozen={getStreak().frozen} size="sm" />
                )}
                <Link href="/nastavenia" className={`text-sm ${scrolled ? 'text-gray-500' : 'text-white/70'}`}>{settings.username}</Link>
              </>
            ) : (
              <Link href="/trening" className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all ${
                scrolled ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/20'
              }`}>Start training</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* 1. Hero banner - fullscreen with photo */}
        <HeroBanner />

        {/* 2. Gameplay */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Better play starts with keeping your head up.</h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                When you're always watching the ball, you miss what's happening around you.
              </p>
              <p className="mt-3 text-base text-gray-400 leading-relaxed">
                HockeyBeats puts the action on the screen in front of you. As you follow it, you practise handling the ball while looking ahead — an important habit for spotting teammates, finding space and recognising your next opportunity.
              </p>
              <p className="mt-3 text-sm text-gray-400 italic">
                You're concentrating on the game. You might not even realise how much you're practising.
              </p>
            </div>
            {/* Video */}
            <div className="mt-12 max-w-3xl">
              <div className="rounded-2xl overflow-hidden aspect-video bg-gray-900">
                <iframe
                  src="https://www.youtube.com/embed/F1_0Lkp16Rc?rel=0&modestbranding=1"
                  title="HockeyBeats gameplay"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sports */}
        <section id="sports" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Three sports. A shared reason to keep practising.</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
                Whether you play on ice, on the pitch or in the sports hall, time with your stick matters.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Ice hockey</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Keep working on your stickhandling away from the rink, with off-ice practice that gets you moving and looking ahead.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Field hockey</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Spend more time on ball control and practise lifting your eyes while your stick stays involved.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Floorball</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Give your stick skills extra attention outside team training, with games that keep you engaged in every movement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Why HockeyBeats */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Make practice something you look forward to.</h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Getting better takes repetition. Finding the motivation to repeat the same movements can be the harder part. HockeyBeats gives those movements a purpose inside a game.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Build control through repetition</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Give yourself more opportunities to get comfortable with your stick and ball.</p>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Practise looking ahead</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Follow the screen while keeping the ball moving, rather than watching your stick the whole time.</p>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Build a habit that lasts</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Make individual practice easier to return to with different games, personal bests and friendly competition.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Game previews */}
        <section id="games" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Different games keep practice interesting.</h2>
              <p className="mt-4 text-base text-gray-500">Start with HockeyBeats, then explore extra games that give you another reason to pick up your stick.</p>
            </div>

            {/* Main game */}
            <Link href="/trening" className="group block mb-6">
              <div className="rounded-3xl overflow-hidden relative h-72 sm:h-96 bg-gray-900">
                <Image src="/images/hero-dribble.jpg" alt="Slalom" fill className="object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium w-fit mb-3">HockeyBeats</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Find your way through the slalom.</h3>
                  <p className="text-sm text-white/70 max-w-lg">
                    Move through the slalom on screen using your stick-and-ball movements. Follow the course, respond to what's ahead and aim for a better score each time you play.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
                    Preview HockeyBeats
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Extra games */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Link href="/space" className="group block">
                <div className="rounded-2xl bg-[#0f172a] p-8 h-52 flex flex-col justify-between group-hover:bg-[#1e293b] transition-colors">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Extra game</p>
                    <h3 className="text-lg font-bold text-white mb-2">Space Invaders</h3>
                    <p className="text-sm text-white/50">Use your stick-and-ball movements to play through a space-themed game. Your next score is there to beat.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    Preview the game
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
              <Link href="/terciky" className="group block">
                <div className="rounded-2xl bg-gray-50 p-8 h-52 flex flex-col justify-between group-hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">More games to explore</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Change the game and keep practising.</h3>
                    <p className="text-sm text-gray-500">Discover other ways to play when you feel like something different.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    Explore the games
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. How it works */}
        <section id="how-it-works" className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-center mb-16">Set up at home and get straight into practice.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Prepare your space', desc: 'Get your stick, ball and training mat ready, leaving enough clear space to move comfortably.' },
                { step: '2', title: 'Open the app', desc: 'Position your phone and follow the camera setup instructions. Make sure you can see the screen clearly.' },
                { step: '3', title: 'Choose a game', desc: 'Start with the HockeyBeats slalom or try one of the extra games.' },
                { step: '4', title: 'Play and check your score', desc: 'Follow the action, keep the ball moving and see how you did. Come back to improve your result.' },
              ].map((item) => (
                <div key={item.step}>
                  <div className="text-4xl font-black text-gray-200 mb-3">{item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/trening" className="btn-primary px-8 py-4">Start your first session</Link>
            </div>
          </div>
        </section>

        {/* 7. Scores and rankings */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">See your progress. Give your teammates something to chase.</h2>
            <p className="mt-5 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              Your score gives you a clear goal for the next session. Rankings bring your teammates into it, too. Compare results, challenge each other and keep the competition going between training sessions.
            </p>
            <div className="mt-8">
              <Link href="/rebricek" className="btn-primary px-8 py-4">Set your first score</Link>
            </div>
          </div>
        </section>

        {/* 8. Music */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Your favourite music can come to training, too.</h2>
                <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                  Connect Spotify or Apple Music and listen to any song while you play. Put on your usual playlist, find something that gets you moving or listen to the same favourite again.
                </p>
                <p className="mt-3 text-base text-gray-400">Music adds to the experience while you focus on the game and your practice.</p>
              </div>
              <div className="flex items-center justify-center gap-8">
                <svg className="w-14 h-14 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span className="text-2xl text-gray-300">+</span>
                <svg className="w-14 h-14 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393z"/></svg>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Mobile app */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">Your practice starts on your phone.</h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
              Open HockeyBeats to choose a game, start playing and keep track of your results. During play, your phone becomes the screen you follow.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: 'Your games in one place', desc: 'Move between the HockeyBeats slalom and extra games whenever you want to change things up.' },
                { title: 'A record of your results', desc: 'See your scores and personal bests, so you know what you\'re working towards.' },
                { title: 'A connection to your teammates', desc: 'Check the rankings and see how your latest result compares.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. For parents */}
        <section id="parents" className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mb-4">Help them build a practice habit of their own.</h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
              Team training gives children coaching, structure and time with their teammates. Individual practice gives them more opportunities to work with their stick. HockeyBeats makes that extra practice easier to enjoy.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Active time with a purpose', desc: 'Children play by moving and working with a real stick and ball.' },
                { title: 'Practice with their eyes up', desc: 'Following the screen encourages them to look ahead while handling the ball.' },
                { title: 'Extra repetitions between team sessions', desc: 'They can spend more time on individual skills at home, alongside the guidance they receive from their coach.' },
                { title: 'Motivation they can make their own', desc: 'Whether they enjoy beating a personal best, competing with friends or trying another game, there\'s more than one reason to practise.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <a href="#how-it-works" className="btn-secondary px-8 py-4">See HockeyBeats in action</a>
            </div>
          </div>
        </section>

        {/* 11. Equipment */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Turn a clear space into a place to practise.</h2>
            <p className="mt-5 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              You'll need your stick, a suitable training ball, the mat and a supported phone with a camera. Follow the setup instructions for your sport and leave enough space for your movements.
            </p>
          </div>
        </section>

        {/* 12. Teams and coaches */}
        <section id="teams" className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Keep players engaged between training sessions.</h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                HockeyBeats gives individual practice a shared goal. Players can work on their own, compare scores and bring a little friendly competition back to the team.
              </p>
              <p className="mt-3 text-base text-gray-400">
                For coaches, it's another way to encourage regular time with the stick. For clubs, it's an interactive activity to introduce at training, team events or player development sessions.
              </p>
              <div className="mt-8">
                <a href="mailto:hello@hockeybeats.com" className="btn-primary px-8 py-4">Bring HockeyBeats to your team</a>
              </div>
            </div>
          </div>
        </section>

        {/* 13. FAQ */}
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently asked questions</h2>
            <div className="space-y-4">
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
                <details key={faq.q} className="bg-gray-50 rounded-2xl p-5 group">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 14. Final CTA */}
        <section className="bg-gray-50 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Give your next training session a head start.</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto">
              Pick up your stick, play a game and put in the practice you'll take back to your team.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/trening" className="btn-primary text-base px-8 py-4">Start training</Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">Watch it in action</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 sm:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Image src="/images/hb-logo-stacked.png" alt="HockeyBeats" width={80} height={56} className="h-10 w-auto mb-2" />
              <p className="text-xs text-gray-400">Interactive practice for ice hockey, field hockey and floorball.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-gray-400">
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
              <a href="#sports" className="hover:text-gray-900 transition-colors">Sports</a>
              <a href="#games" className="hover:text-gray-900 transition-colors">Games</a>
              <a href="#parents" className="hover:text-gray-900 transition-colors">For parents</a>
              <a href="#teams" className="hover:text-gray-900 transition-colors">For teams</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </footer>

      {/* Login modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Log in</h2>
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
function HeroBanner() {
  const [showPlatform, setShowPlatform] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'mobile' | 'desktop' | 'tv' | null>(null);

  return (
    <>
      <section className="relative h-screen flex flex-col justify-center overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0">
          <iframe
            src="https://www.youtube.com/embed/F1_0Lkp16Rc?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=F1_0Lkp16Rc&playsinline=1&modestbranding=1&iv_load_policy=3"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180vw] h-[180vh] sm:w-[120vw] sm:h-[120vh] pointer-events-none"
            allow="autoplay; encrypted-media"
            title="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        {/* Content - centered */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-32 pb-20 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.06] tracking-tight max-w-3xl">
            A game you want to&nbsp;play. Practice the coach will&nbsp;notice.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed">
            HockeyBeats turns stickhandling practice into an interactive game. Follow the action on screen, move the ball and build your score.
          </p>

          {/* Main CTA - prominent */}
          <div className="mt-10">
            <button
              onClick={() => setShowPlatform(true)}
              className="group relative bg-white text-gray-900 font-bold text-lg px-12 py-5 rounded-full hover:shadow-2xl hover:shadow-white/20 active:scale-[0.97] transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Play now — it&apos;s free
              </span>
            </button>
          </div>

          {/* Store badges */}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5">
              <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span className="text-sm font-semibold text-white">4.8</span>
              <span className="text-xs text-white/40">App Store</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.842l2.458 1.42c.544.317.544 1.114 0 1.43l-2.458 1.42-2.534-2.535 2.534-2.535zM5.864 3.458L16.8 9.79l-2.302 2.302-8.635-8.635z"/></svg>
              <span className="text-sm font-semibold text-white">4.8</span>
              <span className="text-xs text-white/40">Google Play</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-xs text-white/40">Web · TV</span>
          </div>

          <p className="mt-5 text-xs text-white/30">For ice hockey, field hockey and floorball.</p>
        </div>

        {/* Scroll arrow */}
        <a href="#more" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors">
          <span className="text-xs">More info</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* Anchor for scroll */}
      <div id="more" />

      {/* Platform selector modal */}
      {showPlatform && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Choose your platform</h2>
              <button onClick={() => { setShowPlatform(false); setSelectedPlatform(null); }} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>

            {!selectedPlatform ? (
              <div className="space-y-3">
                <button onClick={() => setSelectedPlatform('mobile')} className="w-full flex items-center gap-4 rounded-2xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all text-left">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mobile</div>
                    <div className="text-xs text-gray-400">iPhone, Android</div>
                  </div>
                </button>
                <button onClick={() => setSelectedPlatform('desktop')} className="w-full flex items-center gap-4 rounded-2xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all text-left">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Desktop</div>
                    <div className="text-xs text-gray-400">Mac, Windows, Linux</div>
                  </div>
                </button>
                <button onClick={() => setSelectedPlatform('tv')} className="w-full flex items-center gap-4 rounded-2xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all text-left">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="13" rx="2" /><line x1="7" y1="21" x2="17" y2="21" /><line x1="9" y1="17" x2="9" y2="21" /><line x1="15" y1="17" x2="15" y2="21" /></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">TV</div>
                    <div className="text-xs text-gray-400">Samsung, LG, TCL, Hisense</div>
                  </div>
                </button>
              </div>
            ) : selectedPlatform === 'mobile' ? (
              <div className="space-y-3">
                <button onClick={() => setSelectedPlatform(null)} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mobile</h3>
                <Link href="/trening" onClick={() => setShowPlatform(false)} className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                  <div><div className="font-semibold text-gray-900">Browser</div><div className="text-xs text-gray-400">Play instantly — no download</div></div>
                </Link>
                <a href="#" className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div><div className="font-semibold text-gray-900">App Store</div><div className="text-xs text-gray-400">Download for iPhone</div></div>
                </a>
                <a href="#" className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.842l2.458 1.42c.544.317.544 1.114 0 1.43l-2.458 1.42-2.534-2.535 2.534-2.535zM5.864 3.458L16.8 9.79l-2.302 2.302-8.635-8.635z"/></svg>
                  <div><div className="font-semibold text-gray-900">Google Play</div><div className="text-xs text-gray-400">Download for Android</div></div>
                </a>
              </div>
            ) : selectedPlatform === 'desktop' ? (
              <div className="space-y-3">
                <button onClick={() => setSelectedPlatform(null)} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Desktop</h3>
                <Link href="/trening" onClick={() => setShowPlatform(false)} className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                  <div><div className="font-semibold text-gray-900">Browser</div><div className="text-xs text-gray-400">Play instantly on any browser</div></div>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => setSelectedPlatform(null)} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
                </button>
                <h3 className="text-lg font-bold text-gray-900 mb-4">TV</h3>
                <Link href="/trening" onClick={() => setShowPlatform(false)} className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                  <div><div className="font-semibold text-gray-900">Browser via HDMI</div><div className="text-xs text-gray-400">Connect laptop to TV</div></div>
                </Link>
                <a href="#" className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">S</div>
                  <div><div className="font-semibold text-gray-900">Samsung Tizen</div><div className="text-xs text-gray-400">Download from Samsung Store</div></div>
                </a>
                <a href="#" className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">LG</div>
                  <div><div className="font-semibold text-gray-900">LG webOS</div><div className="text-xs text-gray-400">Download from LG Content Store</div></div>
                </a>
                <a href="#" className="w-full flex items-center gap-4 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">T</div>
                  <div><div className="font-semibold text-gray-900">TCL &amp; Hisense</div><div className="text-xs text-gray-400">Download from app store</div></div>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
