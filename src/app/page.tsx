'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { settings, isLoggedIn, login, logout } = useSettings();
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
      {/* Navigation */}
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 transition-all duration-300 ${scrolled ? 'py-3 shadow-sm' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src={scrolled ? '/images/hb-icon.png' : '/images/hb-logo.png'}
              alt="HockeyBeats"
              width={scrolled ? 36 : 160}
              height={scrolled ? 20 : 36}
              className={`transition-all duration-300 ${scrolled ? 'h-5 w-auto' : 'h-8 w-auto'}`}
            />
          </Link>
          <nav className="flex items-center gap-5 sm:gap-7">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">How it works</a>
            <a href="#app" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Mobile app</a>
            <a href="#parents" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">For parents</a>
            <a href="#teams" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">For teams</a>
            {isLoggedIn ? (
              <>
                <Link href="/nastavenia" className="text-sm text-gray-500 hover:text-gray-900">{settings.username}</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Log out</button>
              </>
            ) : (
              <Link href="/trening" className="btn-primary text-sm px-5 py-2.5">Play HockeyBeats</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* 1. Hero */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 pt-20 sm:pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Get better at hockey to&nbsp;the music you love.
              </h1>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
                HockeyBeats turns time with your stick and ball into a game you'll want to come back to. Play along to any song through Spotify or Apple Music, build your score and see how you rank against your teammates.
              </p>
              <p className="mt-3 text-base text-gray-400">
                All while practising the skills you'll take back to the pitch.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/trening" className="btn-primary text-base px-8 py-4">Play HockeyBeats</Link>
                <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">See how it works</a>
              </div>
              <p className="mt-6 text-xs text-gray-400">Connected to Spotify and Apple Music.</p>
            </div>
            <div className="hidden lg:block">
              <div className="rounded-3xl overflow-hidden">
                <Image src="/images/hero-girl.png" alt="Player" width={600} height={500} className="w-full h-auto object-cover" priority />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Gameplay */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Keep your head up. There's a game in front of you.
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Follow the action on screen while your stick keeps the ball moving. You're focused on the game, but you're also practising something that matters every time you step onto the pitch: handling the ball while looking ahead.
              </p>
              <p className="mt-3 text-base text-gray-400">
                It's how you give yourself a chance to see the pass, the space or the teammate making a run.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Why players come back */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                You came for the music. Now you want to beat your score.
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Your favourite song is on, you're finding your rhythm and your best score is within reach. Suddenly, spending more time with your stick doesn't take much convincing.
              </p>
              <p className="mt-3 text-base text-gray-400">
                HockeyBeats brings music and competition into individual practice, giving you a reason to play even when there's no team session on the calendar.
              </p>
              <div className="mt-8">
                <Link href="/trening" className="btn-primary px-8 py-4">Give it a go</Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Spotify and Apple Music */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Finally, you get to choose the training playlist.
                </h2>
                <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                  Connect Spotify or Apple Music and play while listening to any song you want. Bring your pre-match playlist, discover a new favourite or keep the same track on repeat until you've beaten your record.
                </p>
                <p className="mt-3 text-base text-gray-400">
                  Your music is part of the experience from the moment you start.
                </p>
              </div>
              <div className="flex items-center justify-center gap-8">
                <svg className="w-14 h-14 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-2xl text-gray-300">+</span>
                <svg className="w-14 h-14 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393z"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How it works */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight text-center mb-16">
              Put on a song and you're almost ready.
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Prepare your playing space', desc: 'Get your mat, stick and ball ready. Leave enough room around you to move freely.' },
                { step: '02', title: 'Set up your phone', desc: 'Open HockeyBeats and follow the camera setup instructions. Position the screen where you can comfortably see it.' },
                { step: '03', title: 'Connect your music', desc: 'Open your music through Spotify or Apple Music and choose what you want to hear.' },
                { step: '04', title: 'Start playing', desc: 'Follow the action, work with the ball and build your score. See how you rank in the rankings.' },
              ].map((item) => (
                <div key={item.step}>
                  <div className="text-4xl font-black text-gray-200 mb-3">{item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/trening" className="btn-primary px-8 py-4">Start playing</Link>
            </div>
          </div>
        </section>

        {/* 6. Scores and rankings */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Someone on your team thinks they can beat you.
            </h2>
            <p className="mt-4 text-xl text-gray-500">Give them a score to aim for.</p>
            <p className="mt-5 text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
              Compare results, climb the rankings and bring a little team competition into your practice at home. And when you'd rather focus on yourself, your personal best is always there to chase.
            </p>
            <div className="mt-8">
              <Link href="/rebricek" className="btn-primary px-8 py-4">Set your score</Link>
            </div>
          </div>
        </section>

        {/* 7. Skill development */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Your coach will notice the extra practice.
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                More time with your stick means more opportunities to work on your game. HockeyBeats gives those extra repetitions a place in your day — with music you enjoy and a score that keeps you interested.
              </p>
              <p className="mt-3 text-base text-gray-400">
                The points stay in the app. The practice comes with you to training.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Mobile app */}
        <section id="app" className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-12">
              Make room for hockey on your phone.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
              HockeyBeats brings the game to your mobile, so you can get set up and start playing wherever you have a suitable space.
            </p>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: 'Start a game with your music', desc: 'Connect Spotify or Apple Music and listen to whatever you\'re in the mood for.' },
                { title: 'Keep track of your best performances', desc: 'Check your scores and see when you\'ve set a new personal best.' },
                { title: 'Stay connected to the competition', desc: 'See your place in the rankings and find your next score to beat.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/trening" className="btn-primary px-8 py-4">Explore the app</Link>
            </div>
          </div>
        </section>

        {/* 9. For parents */}
        <section id="parents" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mb-12">
              When they ask for another game, they're asking for more time with their stick.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-12">
              HockeyBeats brings something children already enjoy — music and gaming — into the sport they love.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'They\'re actively involved', desc: 'Playing means moving and working with a real hockey stick and ball while following the screen.' },
                { title: 'They\'re practising an important habit', desc: 'The game encourages them to look up while handling the ball, helping them become familiar with dividing their attention.' },
                { title: 'They\'re getting extra time on the ball', desc: 'HockeyBeats complements club sessions with individual practice that fits around everyday family life.' },
                { title: 'They have something to work towards', desc: 'Scores and rankings give their play a clear goal, without every session needing to feel like a formal training session.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <a href="#how-it-works" className="btn-secondary px-8 py-4">See how the game works</a>
            </div>
          </div>
        </section>

        {/* 10. Equipment */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              A little space is all your next game needs.
            </h2>
            <p className="mt-5 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
              Set up with your field hockey stick, ball, training mat and a supported phone with a camera. Choose a clear, level playing area and follow the setup instructions in the app.
            </p>
          </div>
        </section>

        {/* 11. For teams */}
        <section id="teams" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Give the team something to talk about at the next training session.
              </h2>
              <p className="mt-4 text-lg text-gray-500">A new high score can get the whole group involved.</p>
              <p className="mt-5 text-base text-gray-400 leading-relaxed">
                HockeyBeats adds friendly competition to the time players spend practising on their own. Bring it into your club as a shared activity, a team competition or a new way to introduce players to time on the ball.
              </p>
              <div className="mt-8">
                <a href="mailto:hello@hockeybeats.com" className="btn-primary px-8 py-4">Get in touch for your club</a>
              </div>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 sm:px-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently asked questions</h2>
            <div className="space-y-6">
              {[
                { q: 'What is HockeyBeats?', a: 'HockeyBeats is a field hockey game that combines music with real stick-and-ball practice. You follow the action on screen, earn points and compare your results while actively playing.' },
                { q: 'Can I listen to any song?', a: 'Yes. Connect Spotify or Apple Music and choose the songs or playlists you want to listen to while you play.' },
                { q: 'How does playing with my head up work?', a: 'The action happens on the screen in front of you, while you control the ball with your stick. Following the game encourages you to lift your eyes rather than watch the ball the entire time.' },
                { q: 'What do I need?', a: 'You\'ll need a field hockey stick, ball, training mat and a supported phone with a camera, plus a clear space where you can move safely.' },
                { q: 'Can I compare scores with my teammates?', a: 'Yes. Scores and rankings let you see how you\'re doing against other players and give you a result to aim for in your next game.' },
                { q: 'Does HockeyBeats replace club training?', a: 'No. It adds another way to practise between sessions. Your coach continues to guide your technique, teamwork and development on the pitch.' },
                { q: 'Is it for field hockey?', a: 'Yes. HockeyBeats is designed around field hockey stick-and-ball skills.' },
              ].map((faq) => (
                <details key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-5 group">
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

        {/* 13. Final CTA */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Put your next playlist to good use.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto">
              Grab your stick and see what happens when your favourite music becomes part of your practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/trening" className="btn-primary text-base px-8 py-4">Play HockeyBeats</Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-4">Watch the gameplay</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 sm:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <Image src="/images/hb-logo.png" alt="HockeyBeats" width={140} height={32} className="h-7 w-auto mb-2" />
              <p className="text-xs text-gray-400">Field hockey practice, played to your music.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-gray-400">
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
              <a href="#app" className="hover:text-gray-900 transition-colors">Mobile app</a>
              <a href="#parents" className="hover:text-gray-900 transition-colors">For parents</a>
              <a href="#teams" className="hover:text-gray-900 transition-colors">For teams</a>
              {isLoggedIn && <Link href="/nastavenia" className="hover:text-gray-900 transition-colors">Settings</Link>}
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
