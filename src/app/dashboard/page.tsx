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

export default function DashboardPage() {
  const { settings, isLoggedIn } = useSettings();
  const { getStreak, getLevelProgress, getXP, getAvatar, loaded } = useEngagement();
  const [musicHistory, setMusicHistory] = useState<TrackRecord[]>([]);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [myScores, setMyScores] = useState<ScoreEntry[]>([]);

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

  // Redirect to home if not logged in
  if (!isLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  const streak = loaded ? getStreak() : { currentStreak: 0, frozen: false };
  const level = loaded ? getLevelProgress() : { level: 0, xpInLevel: 0, xpNeeded: 100, progress: 0 };
  const totalXP = loaded ? getXP() : 0;
  const avatar = loaded ? getAvatar() : null;

  const favorites = [...musicHistory].sort((a, b) => b.playCount - a.playCount).slice(0, 5);
  const recent = [...musicHistory].sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 3);

  // Find my rank
  const myRank = topScores.findIndex(s => s.username === settings.username) + 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 sm:px-10 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo.png" alt="HockeyBeats" width={130} height={30} className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {streak.currentStreak > 0 && <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} size="sm" />}
            <Link href="/nastavenia" className="flex items-center gap-2">
              <Avatar username={settings.username} photoUrl={avatar} size="sm" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{settings.username}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8">

        {/* Welcome + stats row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Welcome back{isLoggedIn ? `, ${settings.username}` : ''}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Choose a game and start practising.</p>
          </div>
          {loaded && (
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 tabular-nums">{totalXP}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">XP</div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900 tabular-nums">{level.level}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Level</div>
              </div>
              {myRank > 0 && (
                <>
                  <div className="w-px h-8 bg-gray-100" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900 tabular-nums">#{myRank}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Rank</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* XP bar */}
        {loaded && level.level >= 0 && (
          <div className="mb-10">
            <XPBar level={level.level} xpInLevel={level.xpInLevel} xpNeeded={level.xpNeeded} progress={level.progress} totalXP={totalXP} compact />
          </div>
        )}

        {/* Games grid */}
        <div className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Games</h2>
          {/* Main games - PS5 style cards */}
          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <Link href="/trening" className="group block">
              <div className="game-tile rounded-3xl overflow-hidden relative aspect-[4/5] bg-gray-100">
                <Image src="/images/game-hockeybeats.png" alt="HockeyBeats" fill className="object-cover group-hover:scale-105 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="text-sm font-bold text-white">Play</div>
                </div>
              </div>
            </Link>
            <Link href="/space" className="group block">
              <div className="game-tile rounded-3xl overflow-hidden relative aspect-[4/5] bg-[#0f172a]">
                <Image src="/images/game-spaceinvaders.png" alt="Space Invaders" fill className="object-cover group-hover:scale-105 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="text-sm font-bold text-white">Play</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Other games */}
          <div className="grid grid-cols-3 gap-3">
            <Link href="/terciky" className="group block">
              <div className="game-tile bg-gray-50 rounded-2xl p-4 h-24 flex flex-col justify-between border border-gray-100">
                <span className="text-lg">🎯</span>
                <div className="text-xs font-bold text-gray-900">Targets</div>
              </div>
            </Link>
            <Link href="/osmicky-terciky" className="group block">
              <div className="game-tile bg-gray-50 rounded-2xl p-4 h-24 flex flex-col justify-between border border-gray-100">
                <span className="text-lg">♾️</span>
                <div className="text-xs font-bold text-gray-900">Figure 8</div>
              </div>
            </Link>
            <Link href="/osmicky" className="group block">
              <div className="game-tile bg-gray-50 rounded-2xl p-4 h-24 flex flex-col justify-between border border-gray-100">
                <span className="text-lg">🔄</span>
                <div className="text-xs font-bold text-gray-900">Classic 8s</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom grid: Music + Ranking */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Music */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Music</h2>

            {favorites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Favourites</h3>
                <div className="space-y-2">
                  {favorites.map((rec) => (
                    <div key={rec.track.id} className="flex items-center gap-3 rounded-2xl p-3 bg-gray-50 border border-gray-100">
                      {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{rec.track.name}</div>
                        <div className="text-xs text-gray-400 truncate">{rec.track.artists}</div>
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">{rec.playCount}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Recent</h3>
                <div className="space-y-2">
                  {recent.filter(r => !favorites.find(f => f.track.id === r.track.id)).map((rec) => (
                    <div key={rec.track.id} className="flex items-center gap-3 rounded-2xl p-3 bg-gray-50 border border-gray-100">
                      {rec.track.albumArt && <img src={rec.track.albumArt} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{rec.track.name}</div>
                        <div className="text-xs text-gray-400 truncate">{rec.track.artists}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {musicHistory.length === 0 && (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-400">No music played yet. Connect Spotify or Apple Music in any game.</p>
              </div>
            )}
          </div>

          {/* Rankings */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Rankings</h2>
              <Link href="/rebricek" className="text-xs text-emerald-600 font-medium hover:text-emerald-700">View all</Link>
            </div>

            {topScores.length > 0 ? (
              <div className="space-y-2">
                {topScores.map((entry, idx) => {
                  const isMe = entry.username === settings.username;
                  return (
                    <div key={entry.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isMe ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                      }`}>{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {entry.username} {isMe && <span className="text-emerald-600 text-xs">(you)</span>}
                        </div>
                        <div className="text-xs text-gray-400">{entry.song_name || 'Slalom'} · {entry.accuracy}%</div>
                      </div>
                      <div className="text-lg font-black text-gray-900 tabular-nums">{entry.score}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-400">No scores yet. Play a game to set your first score.</p>
              </div>
            )}

            {/* My recent scores */}
            {myScores.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Your recent</h3>
                <div className="space-y-2">
                  {myScores.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-2xl p-3 bg-gray-50 border border-gray-100">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{entry.score} pts</div>
                        <div className="text-xs text-gray-400">{entry.song_name || 'Slalom'} · {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                      <div className="text-xs text-gray-400">{entry.accuracy}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
