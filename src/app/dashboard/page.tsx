'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import StreakBadge from '@/components/ui/StreakBadge';
import XPBar from '@/components/ui/XPBar';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';
import Image from 'next/image';
import { MASCOTS } from '@/lib/mascots';

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
  { name: 'HockeyBeats', href: '/trening', image: '/images/game-hockeybeats.png', bg: '#1a1a2e', desc: 'Beat-synced slalom', clean: false },
  { name: 'Target Smash', href: '/target-smash', image: '/images/game-targets.png', bg: '#1a1a2e', desc: 'Smash the bullseyes', clean: false },
  { name: 'Space Invaders', href: '/space', image: '/images/game-spaceinvaders.png', bg: '#0f172a', desc: 'Shoot the blocks' },
  { name: 'Jelly Stack', href: '/jelly-stack', image: '/images/game-jellystack.png', bg: '#2d1b3d', desc: 'Stack and balance' },
  { name: 'Orbit Hop', href: '/orbit-hop', image: '/images/game-orbithop.png', bg: '#1a2332', desc: 'Jump between planets' },
  { name: 'Neon Drift', href: '/neon-drift', image: '/images/game-neondrift.png', bg: '#0a1628', desc: 'Ride the neon track' },
  { name: 'Brick Rush', href: '/brick-rush', image: '/images/game-brickrush.png', bg: '#111111', desc: 'Break the bricks' },
  { name: 'Magnet Flip', href: '/magnet-flip', image: '/images/game-magnetflip.png', bg: '#1a1025', desc: 'Bounce between platforms' },
  { name: 'Laser Maze', href: '/laser-maze', image: '/images/game-lasermaze.png', bg: '#0f1f0f', desc: 'Navigate the laser maze' },
  { name: 'Color Catch', href: '/color-catch', image: '/images/game-colorcatch.png', bg: '#111111', desc: 'Match colors, catch balls' },
  { name: 'Targets', href: '/terciky', image: '/images/game-targets-classic.png', bg: '#1f2937', desc: 'Hit the targets' },
  { name: 'Figure 8', href: '/osmicky-terciky', image: '/images/game-figure8.png', bg: '#1a2e1a', desc: 'Figure eight drills' },
  { name: 'Classic 8s', href: '/osmicky', image: '/images/game-classic8s.png', bg: '#2e2a1a', desc: 'Classic eight pattern' },
];

export default function DashboardPage() {
  const { settings, isLoggedIn, loaded } = useSettings();
  const { data: engData, getStreak, getLevelProgress, getXP, getAvatar, getProfile, loaded: engLoaded, clearUnfroze, checkAchievementsNow } = useEngagement();
  const [showUnfrozePopup, setShowUnfrozePopup] = useState(false);
  const [musicHistory, setMusicHistory] = useState<TrackRecord[]>([]);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [myScores, setMyScores] = useState<ScoreEntry[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [friends, setFriends] = useState<{ username: string; online: boolean; lastPlayed: string; totalTime: string; lastSong: string; lastGame: string; pending: boolean; incoming: boolean }[]>([]);
  const [selectedSong, setSelectedSong] = useState<{ name: string; artist: string; id?: string; albumArt?: string } | null>(null);
  const [showGamePicker, setShowGamePicker] = useState(false);

  const [friendError, setFriendError] = useState('');
  const [friendSuccess, setFriendSuccess] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);

  const loadFriends = () => {
    if (isLoggedIn && settings.username) {
      fetch(`/api/friends?username=${encodeURIComponent(settings.username)}`)
        .then(r => r.json())
        .then(json => {
          if (json.friends) {
            setFriends(json.friends);
            try { localStorage.setItem('hb_friends', JSON.stringify(json.friends)); } catch {}
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    setMusicHistory(loadMusicHistory());
    loadScores();
    // Load friends from localStorage first, then sync from cloud
    try {
      const saved = localStorage.getItem('hb_friends');
      if (saved) setFriends(JSON.parse(saved));
    } catch {}
    loadFriends();
    // Sync music history from cloud
    if (isLoggedIn && settings.username) {
      fetch(`/api/user-data?username=${encodeURIComponent(settings.username)}`)
        .then(r => r.json())
        .then(json => {
          if (json.data) {
            if (json.data.music_history && Array.isArray(json.data.music_history) && json.data.music_history.length > 0) {
              setMusicHistory(json.data.music_history);
              localStorage.setItem(HISTORY_KEY, JSON.stringify(json.data.music_history));
            }
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show "streak is back" popup after unfreeze
  useEffect(() => {
    if (engLoaded && engData.streak.justUnfroze) {
      setShowUnfrozePopup(true);
      clearUnfroze();
    }
  }, [engLoaded]);

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
  const profile = engLoaded ? getProfile() : null;
  const mascotImage = profile?.mascotId ? MASCOTS.find(m => m.id === profile.mascotId)?.image : null;

  const favorites = [...musicHistory].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
  const favoriteIds = new Set(favorites.map(f => f.track.id));
  const recent = [...musicHistory].filter(r => !favoriteIds.has(r.track.id)).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 5);

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
            <Image src="/images/hb-logo-white.png" alt="Hockey Beats" width={240} height={64} className="h-10 sm:h-12 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/achievements" className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full transition-all">
              Achievements
            </Link>
            {streak.currentStreak > 0 && <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} size="sm" />}
            <Link href="/settings" className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 rounded-full pl-1 pr-4 py-1 transition-colors">
              <Avatar username={settings.username} photoUrl={avatar} mascotImage={mascotImage} profileColor={profile?.color} size="sm" />
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
              {(() => {
                const greetings = [
                  `Hey, `,
                  `What's up, `,
                  `Ready to roll, `,
                  `Let's go, `,
                  `Good to see you, `,
                  `Game on, `,
                ];
                const hour = new Date().getHours();
                const timeGreetings = hour < 12 ? [`Morning, `, `Rise and grind, `] : hour < 18 ? [`What's up, `, `Hey, `] : [`Evening, `, `Night session, `];
                const all = [...greetings, ...timeGreetings];
                const idx = Math.floor((Date.now() / 86400000)) % all.length;
                return <>{all[idx]}<span className="text-emerald-400">{settings.username}</span>!</>;
              })()}
            </h1>
            <p className="text-sm text-white/70 mt-1">Pick a game and start training.</p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums text-emerald-400">{totalXP}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">XP</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{level.level}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">Level</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{gamesPlayed}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">Games</div>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
              <div className="text-xl font-black tabular-nums">{streak.currentStreak}<span className="text-sm ml-0.5">d</span></div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">Streak</div>
            </div>
            {myRank > 0 && (
              <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-center min-w-[80px]">
                <div className="text-xl font-black tabular-nums text-amber-400">#{myRank}</div>
                <div className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">Rank</div>
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

        {/* Frozen streak challenge */}
        {streak.frozen && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <i className="fi fi-sr-icicles text-blue-400 text-xl" />
              <h3 className="text-lg font-bold text-white">Your streak is frozen</h3>
            </div>
            <p className="text-sm text-white/80 mb-4">Play one game to get your streak back. Here is a challenge for you:</p>
            {(() => {
              const randomGame = GAMES[Math.floor(Date.now() / 86400000) % GAMES.length];
              return (
                <Link href={randomGame.href} className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play {randomGame.name}
                </Link>
              );
            })()}
          </div>
        )}

        {/* Featured banner + Friends */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-6">
          {/* Banner */}
          <Link href="/trening" className="group block">
            <div className="relative rounded-2xl overflow-hidden h-full">
              <Image src="/images/hero-clean.png" alt="Hockey Beats" width={1942} height={809} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-8">
                <div className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-base font-bold px-8 py-4 rounded-full transition-colors shadow-lg shadow-emerald-500/30">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play now
                </div>
              </div>
            </div>
          </Link>

          {/* Friends panel */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/90">Friend beats</h3>
              <button onClick={() => setShowAddFriend(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                + Add
              </button>
            </div>

            {/* Add friend input */}
            {showAddFriend && (
              <div className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => { setFriendInput(e.target.value); setFriendError(''); setFriendSuccess(''); }}
                    placeholder="Enter username"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
                  />
                  <button
                    disabled={friendLoading}
                    onClick={async () => {
                      if (!friendInput.trim()) return;
                      setFriendLoading(true);
                      setFriendError('');
                      setFriendSuccess('');
                      try {
                        const res = await fetch('/api/friends', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'add', username: settings.username, friendUsername: friendInput.trim() }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setFriendSuccess(data.message || 'Request sent!');
                          setFriendInput('');
                          loadFriends();
                          checkAchievementsNow();
                          setTimeout(() => { setShowAddFriend(false); setFriendSuccess(''); }, 2000);
                        } else {
                          setFriendError(data.error || 'Something went wrong');
                        }
                      } catch { setFriendError('Connection error'); }
                      setFriendLoading(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {friendLoading ? '...' : 'Send'}
                  </button>
                </div>
                {friendError && <p className="text-xs text-red-400">{friendError}</p>}
                {friendSuccess && <p className="text-xs text-emerald-400">{friendSuccess}</p>}
              </div>
            )}

            {/* Pending requests */}
            {friends.filter(f => f.incoming).length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">Requests</div>
                {friends.filter(f => f.incoming).map((f) => (
                  <div key={f.username} className="flex items-center gap-2.5 rounded-xl p-2 bg-white/5 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">{f.username[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{f.username}</div>
                    </div>
                    <button onClick={async () => {
                      await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept', username: settings.username, friendUsername: f.username }) });
                      loadFriends();
                    }} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Accept</button>
                    <button onClick={async () => {
                      await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', username: settings.username, friendUsername: f.username }) });
                      loadFriends();
                    }} className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">Reject</button>
                  </div>
                ))}
              </div>
            )}

            {/* Friends list */}
            <div className="flex-1 overflow-y-auto space-y-1.5" style={{ maxHeight: '280px' }}>
              {friends.filter(f => !f.incoming).length === 0 && !showAddFriend && (
                <div className="text-center py-6">
                  <div className="text-sm text-white mb-2">No friends yet</div>
                  <button onClick={() => setShowAddFriend(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300">Add a friend</button>
                </div>
              )}
              {friends.filter(f => !f.incoming).sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0)).map((f) => (
                <div key={f.username} className="group flex items-center gap-2.5 rounded-xl p-2.5 bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">{f.username[0].toUpperCase()}</div>
                    {f.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{f.username}</div>
                    <div className="text-[10px] text-white/30 truncate">
                      {f.pending ? 'Request sent' : f.online ? 'Playing now' : [f.lastPlayed, f.totalTime].filter(Boolean).join(' · ') || 'No activity yet'}
                    </div>
                  </div>
                  {f.pending && (
                    <span className="text-[9px] font-medium text-amber-400/60 bg-amber-500/10 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm(`Remove ${f.username} from friends?`)) return;
                      await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove', username: settings.username, friendUsername: f.username }) });
                      loadFriends();
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All games grid */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-5">All games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GAMES.slice(1).map((game) => (
              <Link key={game.href} href={game.href} className="group block">
                <div className="rounded-2xl overflow-hidden relative aspect-[3/4]" style={{ background: game.bg }}>
                  <Image src={game.image} alt={game.name} fill className={`object-cover group-hover:scale-105 transition-all duration-500 ${game.clean ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                  {!game.clean && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-sm font-bold">{game.name}</div>
                    <div className="text-[10px] text-white/80 mt-0.5">{game.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Music: Favourites + Recently played side by side */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-white mb-5">Music</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Favourites */}
            <div>
              <h3 className="text-sm font-bold text-white/90 mb-3">Favourites</h3>
              <div className="space-y-2">
                {favorites.slice(0, 5).map((rec) => (
                  <button key={rec.track.id} onClick={() => handleSongClick({ name: rec.track.name, artist: rec.track.artists, id: rec.track.id, albumArt: rec.track.albumArt })}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
                    {rec.track.albumArt ? <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" /> : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{rec.track.name}</div>
                      <div className="text-xs text-white/70 truncate">{rec.track.artists}</div>
                    </div>
                    <span className="text-xs text-white/70 tabular-nums">{rec.playCount}x</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recently played */}
            <div>
              <h3 className="text-sm font-bold text-white/90 mb-3">Recently played</h3>
              <div className="space-y-2">
                {recent.slice(0, 5).map((rec) => (
                  <button key={rec.track.id} onClick={() => handleSongClick({ name: rec.track.name, artist: rec.track.artists, id: rec.track.id, albumArt: rec.track.albumArt })}
                    className="w-full flex items-center gap-3 rounded-2xl p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left">
                    {rec.track.albumArt ? <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" /> : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{rec.track.name}</div>
                      <div className="text-xs text-white/70 truncate">{rec.track.artists}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard: Score left + Time Played right */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-white">Leaderboard</h2>
            <Link href="/rebricek" className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors">View all</Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score ranking */}
            <div>
              <h3 className="text-sm font-bold text-white/90 mb-3">Best score</h3>
              <div className="space-y-2">
                {(topScores.length > 0 ? topScores.slice(0, 5) : [] as { id: string; username: string; score: number; song_name: string }[]).map((entry, idx) => {
                  const isMe = entry.username === settings.username;
                  return (
                    <div key={entry.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-amber-400/20 text-amber-400' : idx === 1 ? 'bg-white/10 text-white/90' : idx === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-white/70'
                      }`}>{idx + 1}</div>
                      {isMe && mascotImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: profile?.color || '#22c55e' }}>
                          <Image src={mascotImage} alt="" width={32} height={32} className="w-7 h-7 object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white/60">{entry.username[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {entry.username} {isMe && <span className="text-emerald-400 text-xs">(you)</span>}
                        </div>
                        <div className="text-xs text-white/70 truncate">{entry.song_name}</div>
                      </div>
                      <div className="text-lg font-black tabular-nums">{entry.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time played ranking */}
            <div>
              <h3 className="text-sm font-bold text-white/90 mb-3">Time played</h3>
              <div className="space-y-2">
                {(() => {
                  const mySecs = engLoaded ? (engData.totalSecondsPlayed || (engData.totalMinutesPlayed || 0) * 60 || 0) : 0;
                  const formatSecs = (secs: number) => {
                    const hrs = Math.floor(secs / 3600);
                    const mins = Math.floor((secs % 3600) / 60);
                    const s = secs % 60;
                    if (hrs > 0) return `${hrs}h ${mins}m ${s}s`;
                    if (mins > 0) return `${mins}m ${s}s`;
                    return `${s}s`;
                  };
                  const entries = [
                    { name: settings.username, secs: mySecs },
                  ].sort((a, b) => b.secs - a.secs);
                  return entries.map((entry, idx) => {
                    const isMe = entry.name === settings.username;
                    return (
                      <div key={entry.name} className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/5'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-400/20 text-amber-400' : idx === 1 ? 'bg-white/10 text-white/90' : idx === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-white/70'
                        }`}>{idx + 1}</div>
                        {isMe && mascotImage ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: profile?.color || '#22c55e' }}>
                            <Image src={mascotImage} alt="" width={32} height={32} className="w-7 h-7 object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white/60">{entry.name[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {entry.name} {isMe && <span className="text-emerald-400 text-xs">(you)</span>}
                          </div>
                          <div className="text-xs text-white/70">{formatSecs(entry.secs)} of practice</div>
                        </div>
                        <div className="text-lg font-black tabular-nums">{formatSecs(entry.secs)}</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
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
                  <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold truncate">{selectedSong.name}</div>
                <div className="text-sm text-white/80 truncate">{selectedSong.artist}</div>
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
                  className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-2xl px-5 py-4 transition-colors text-white/90">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </button>
              </div>
            ) : (
              /* Game picker */
              <div className="px-6 pb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">Choose a game</p>
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

      {/* Streak is back popup */}
      {showUnfrozePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUnfrozePopup(false)}>
          <div className="bg-[#1a1a24] rounded-3xl p-8 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <i className="fi fi-ss-fire-flame-curved text-orange-500 text-5xl block mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Streak is back!</h2>
            <p className="text-sm text-white/80 mb-1">Your {streak.currentStreak} day streak continues.</p>
            <p className="text-xs text-white/70 mb-6">Keep playing every day to build it up.</p>
            <button onClick={() => setShowUnfrozePopup(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-8 py-3 rounded-full transition-colors">
              Nice!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
