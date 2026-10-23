'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import StreakBadge from '@/components/ui/StreakBadge';
import XPBar from '@/components/ui/XPBar';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import Image from 'next/image';

const HISTORY_KEY = 'sportqo_music_history';

interface TrackRecord {
  track: { id: string; name: string; artists: string; albumArt: string };
  playCount: number;
  lastPlayed: number;
}

function loadMusicHistory(): TrackRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  accuracy: number;
  song_name: string | null;
  difficulty: string;
  created_at: string;
}

const GAMES = [
  { name: 'HockeyBeats', href: '/trening', image: '/images/game-hockeybeats.png', bg: '#1a1a2e', desc: 'Beat-synced slalom' },
  { name: 'Space Invaders', href: '/space', image: '/images/game-spaceinvaders.png', bg: '#0f172a', desc: 'Shoot the blocks' },
  { name: 'Jelly Stack', href: '/jelly-stack', image: '/images/game-jellystack.png', bg: '#2d1b3d', desc: 'Stack and balance' },
  { name: 'Orbit Hop', href: '/orbit-hop', image: '/images/game-orbithop.png', bg: '#1a2332', desc: 'Jump between planets' },
  { name: 'Neon Drift', href: '/neon-drift', image: '/images/game-neondrift.png', bg: '#0a1628', desc: 'Ride the neon track' },
  { name: 'Brick Rush', href: '/brick-rush', image: '/images/game-brickrush.png', bg: '#111111', desc: 'Break the bricks' },
  { name: 'Magnet Flip', href: '/magnet-flip', image: '/images/game-magnetflip.png', bg: '#1a1025', desc: 'Bounce between platforms' },
  { name: 'Laser Maze', href: '/laser-maze', image: '/images/game-lasermaze.png', bg: '#0f1f0f', desc: 'Navigate the laser maze' },
  { name: 'Targets', href: '/terciky', image: '/images/game-targets.png', bg: '#1f2937', desc: 'Hit the targets' },
  { name: 'Figure 8', href: '/osmicky-terciky', image: '/images/game-figure8.png', bg: '#1a2e1a', desc: 'Figure eight drills' },
  { name: 'Classic 8s', href: '/osmicky', image: '/images/game-classic8s.png', bg: '#2e2a1a', desc: 'Classic eight pattern' },
];

export default function DashboardPage() {
  const { settings, isLoggedIn, loaded } = useSettings();
  const { data: engData, getStreak, getLevelProgress, getXP, getAvatar, loaded: engLoaded } = useEngagement();
  const [musicHistory, setMusicHistory] = useState<TrackRecord[]>([]);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [myScores, setMyScores] = useState<ScoreEntry[]>([]);
  const [selectedSong, setSelectedSong] = useState<{ name: string; artist: string; id?: string; albumArt?: string } | null>(null);
  const [showGamePicker, setShowGamePicker] = useState(false);

  useEffect(() => {
    setMusicHistory(loadMusicHistory());
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const [topRes, myRes] = await Promise.all([
        fetch('/api/leaderboard?type=overall'),
        isLoggedIn ? fetch(`/api/leaderboard?type=personal&user=${settings.username}`) : null,
      ]);
      const topData = await topRes.json();
      setTopScores((topData.scores || []).slice(0, 5));
      if (myRes) {
        const myData = await myRes.json();
        setMyScores((myData.scores || []).slice(0, 5));
      }
    } catch {}
  };

  if (!loaded) return null;

  if (!isLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  const streak = engLoaded ? getStreak() : { currentStreak: 0, frozen: false };
  const level = engLoaded ? getLevelProgress() : { level: 0, xpInLevel: 0, xpNeeded: 100, progress: 0 };
  const totalXP = engLoaded ? getXP() : 0;
  const avatar = engLoaded ? getAvatar() : null;

  const favorites = [...musicHistory].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
  const favoriteIds = new Set(favorites.map(f => f.track.id));
  const recent = [...musicHistory].filter(r => !favoriteIds.has(r.track.id)).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 3);

  const myRank = topScores.findIndex(s => s.username === settings.username) + 1;

  const gamesPlayed = engLoaded ? (engData.totalGamesPlayed || 0) : 0;

  const handleSongClick = (song: { name: string; artist: string; id?: string; albumArt?: string }) => {
    setSelectedSong(song);
    setShowGamePicker(false);
  };

  const handlePlayGame = () => {
    setShowGamePicker(true);
  };

  const handlePickGame = (gameHref: string) => {
    if (selectedSong?.id) {
      // Store selected song in localStorage so the game page can prefill it
      try {
        localStorage.setItem('hb_prefill_track', JSON.stringify(selectedSong));
      } catch {}
    }
    window.location.href = gameHref;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-white.png" alt="HockeyBeats" width={130} height={30} className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {streak.currentStreak > 0 && <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} size="sm" />}
            <Link href="/nastavenia" className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 rounded-full pl-1 pr-4 py-1 transition-colors">
              <Avatar username={settings.username} photoUrl={avatar} size="sm" />
              <span className="text-sm font-medium text-white/80 hidden sm:block">{settings.username}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">

        {/* Welcome + Stats bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{settings.username}</span>
            </h1>
            <p className="text-sm text-white/30 mt-1">Pick a game and start training.</p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums text-emerald-400">{totalXP}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">XP</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{level.level}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Level</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{gamesPlayed}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Games</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{streak.currentStreak}<span className="text-sm ml-0.5">d</span></div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Streak</div>
            </div>
            {myRank > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
                <div className="text-xl font-black tabular-nums text-amber-400">#{myRank}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Rank</div>
              </div>
            )}
          </div>
        </div>

        {/* XP bar */}
        {engLoaded && level.level >= 0 && (
          <div className="mb-10">
            <XPBar level={level.level} xpInLevel={level.xpInLevel} xpNeeded={level.xpNeeded} progress={level.progress} totalXP={totalXP} compact />
          </div>
        )}

        {/* Featured game - big hero card */}
        <div className="mb-6">
          <Link href={GAMES[0].href} className="group block">
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] sm:aspect-[3/1]" style={{ background: GAMES[0].bg }}>
              <Image src={GAMES[0].image} alt={GAMES[0].name} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">Featured</div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">{GAMES[0].name}</h2>
                <p className="text-sm text-white/50 mt-1">{GAMES[0].desc}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-5 py-2.5 rounded-full group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play now
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* All games grid */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-5">All games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GAMES.slice(1).map((game) => (
              <Link key={game.href} href={game.href} className="group block">
                <div className="rounded-2xl overflow-hidden relative aspect-[3/4]" style={{ background: game.bg }}>
                  <Image src={game.image} alt={game.name} fill className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-sm font-bold">{game.name}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{game.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom grid: Music + Ranking */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Music */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-5">Music</h2>

            {favorites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white/60 mb-3">Favourites</h3>
                <div className="space-y-2">
                  {favorites.map((rec) => (
                    <button key={rec.track.id} onClick={() => handleSongClick({ name: rec.track.name, artist: rec.track.artists, id: rec.track.id, albumArt: rec.track.albumArt })}
                      className="w-full flex items-center gap-3 rounded-2xl p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
                      {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{rec.track.name}</div>
                        <div className="text-xs text-white/30 truncate">{rec.track.artists}</div>
                      </div>
                      <span className="text-xs text-white/30 tabular-nums">{rec.playCount}x</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/60 mb-3">Recently played</h3>
                <div className="space-y-2">
                  {recent.filter(r => !favorites.find(f => f.track.id === r.track.id)).map((rec) => (
                    <button key={rec.track.id} onClick={() => handleSongClick({ name: rec.track.name, artist: rec.track.artists, id: rec.track.id, albumArt: rec.track.albumArt })}
                      className="w-full flex items-center gap-3 rounded-2xl p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
                      {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{rec.track.name}</div>
                        <div className="text-xs text-white/30 truncate">{rec.track.artists}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {musicHistory.length === 0 && (
              <div className="space-y-2">
                {[
                  { name: 'Blinding Lights', artist: 'The Weeknd', plays: 24 },
                  { name: 'Levitating', artist: 'Dua Lipa', plays: 18 },
                  { name: 'Flowers', artist: 'Miley Cyrus', plays: 12 },
                  { name: 'Anti-Hero', artist: 'Taylor Swift', plays: 9 },
                  { name: 'Unholy', artist: 'Sam Smith, Kim Petras', plays: 7 },
                ].map((t) => (
                  <button key={t.name} onClick={() => handleSongClick({ name: t.name, artist: t.artist })}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{t.name}</div>
                      <div className="text-xs text-white/30 truncate">{t.artist}</div>
                    </div>
                    <span className="text-xs text-white/30 tabular-nums">{t.plays}x</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rankings */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Leaderboard</h2>
              <Link href="/rebricek" className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors">View all</Link>
            </div>

            {topScores.length > 0 ? (
              <div className="space-y-2">
                {topScores.map((entry, idx) => {
                  const isMe = entry.username === settings.username;
                  return (
                    <div key={entry.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-amber-400/20 text-amber-400' : idx === 1 ? 'bg-white/10 text-white/60' : idx === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-white/30'
                      }`}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {entry.username} {isMe && <span className="text-emerald-400 text-xs">(you)</span>}
                        </div>
                        <div className="text-xs text-white/30">{entry.song_name || 'Slalom'} · {entry.accuracy}%</div>
                      </div>
                      <div className="text-lg font-black tabular-nums">{entry.score}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'matej_k', score: 2840, song: 'Blinding Lights', acc: 96 },
                    { rank: 2, name: 'zuzka99', score: 2510, song: 'Levitating', acc: 91 },
                    { rank: 3, name: 'hockeyboy', score: 2280, song: 'Flowers', acc: 88 },
                    { rank: 4, name: settings.username, score: 1950, song: favorites.length > 0 ? favorites[0].track.name : 'Slalom', acc: 85 },
                    { rank: 5, name: 'petra_h', score: 1720, song: 'Unholy', acc: 82 },
                  ].map((entry) => {
                    const isMe = entry.name === settings.username;
                    const idx = entry.rank - 1;
                    return (
                      <div key={entry.rank} className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-400/20 text-amber-400' : idx === 1 ? 'bg-white/10 text-white/60' : idx === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-white/30'
                        }`}>{entry.rank}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {entry.name} {isMe && <span className="text-emerald-400 text-xs">(you)</span>}
                          </div>
                          <div className="text-xs text-white/30">{entry.song} · {entry.acc}%</div>
                        </div>
                        <div className="text-lg font-black tabular-nums">{entry.score}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {myScores.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-white/60 mb-3">Your recent</h3>
                <div className="space-y-2">
                  {myScores.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-2xl p-3 bg-white/5 border border-white/5">
                      <div>
                        <div className="text-sm font-semibold">{entry.score} pts</div>
                        <div className="text-xs text-white/30">{entry.song_name || 'Slalom'} · {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="text-xs text-white/30">{entry.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song action modal */}
      {selectedSong && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={() => { setSelectedSong(null); setShowGamePicker(false); }}>
          <div className="bg-[#1a1a24] rounded-3xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Song header */}
            <div className="p-6 pb-4 flex items-center gap-4">
              {selectedSong.albumArt ? (
                <img src={selectedSong.albumArt} alt="" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold truncate">{selectedSong.name}</div>
                <div className="text-sm text-white/40 truncate">{selectedSong.artist}</div>
              </div>
            </div>

            {!showGamePicker ? (
              /* Action buttons */
              <div className="px-6 pb-6 space-y-2">
                <button onClick={handlePlayGame}
                  className="w-full flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl px-5 py-4 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play a game with this song
                </button>
                <button onClick={() => { setSelectedSong(null); }}
                  className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-2xl px-5 py-4 transition-colors text-white/60">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </button>
              </div>
            ) : (
              /* Game picker */
              <div className="px-6 pb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Choose a game</p>
                <div className="grid grid-cols-2 gap-2">
                  {GAMES.map((game) => (
                    <button key={game.href} onClick={() => handlePickGame(game.href)}
                      className="group rounded-2xl overflow-hidden relative aspect-[4/3] text-left" style={{ background: game.bg }}>
                      <Image src={game.image} alt={game.name} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-xs font-bold">{game.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
