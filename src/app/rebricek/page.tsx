'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import Avatar from '@/components/ui/Avatar';
import Link from 'next/link';

interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  accuracy: number;
  longest_streak: number;
  song_name: string | null;
  song_artist: string | null;
  difficulty: string;
  duration_seconds: number;
  created_at: string;
}

interface TimeEntry {
  username: string;
  totalMinutes: number;
}

const MOCK_SCORES: ScoreEntry[] = [
  { id: 'm1', username: 'matej_k', score: 2840, accuracy: 96, longest_streak: 34, song_name: 'Blinding Lights', song_artist: 'The Weeknd', difficulty: 'hard', duration_seconds: 60, created_at: '2026-10-19T14:30:00Z' },
  { id: 'm2', username: 'zuzka99', score: 2510, accuracy: 91, longest_streak: 28, song_name: 'Levitating', song_artist: 'Dua Lipa', difficulty: 'hard', duration_seconds: 60, created_at: '2026-10-18T16:45:00Z' },
  { id: 'm3', username: 'hockeyboy', score: 2280, accuracy: 88, longest_streak: 25, song_name: 'Flowers', song_artist: 'Miley Cyrus', difficulty: 'medium', duration_seconds: 90, created_at: '2026-10-20T09:15:00Z' },
  { id: 'm5', username: 'petra_h', score: 1720, accuracy: 82, longest_streak: 19, song_name: 'Unholy', song_artist: 'Sam Smith', difficulty: 'medium', duration_seconds: 60, created_at: '2026-10-17T11:20:00Z' },
  { id: 'm6', username: 'tomas_s', score: 1580, accuracy: 79, longest_streak: 16, song_name: 'As It Was', song_artist: 'Harry Styles', difficulty: 'easy', duration_seconds: 90, created_at: '2026-10-16T19:00:00Z' },
  { id: 'm7', username: 'lenka22', score: 1350, accuracy: 76, longest_streak: 14, song_name: 'Heat Waves', song_artist: 'Glass Animals', difficulty: 'medium', duration_seconds: 60, created_at: '2026-10-15T15:30:00Z' },
  { id: 'm8', username: 'adam_pro', score: 1120, accuracy: 73, longest_streak: 12, song_name: 'Shivers', song_artist: 'Ed Sheeran', difficulty: 'easy', duration_seconds: 60, created_at: '2026-10-14T20:10:00Z' },
];

const MOCK_TIME: TimeEntry[] = [
  { username: 'hockeyboy', totalMinutes: 847 },
  { username: 'matej_k', totalMinutes: 612 },
  { username: 'zuzka99', totalMinutes: 534 },
  { username: 'petra_h', totalMinutes: 389 },
  { username: 'tomas_s', totalMinutes: 276 },
  { username: 'lenka22', totalMinutes: 198 },
  { username: 'adam_pro', totalMinutes: 142 },
];

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export default function RebricekPage() {
  const { settings, isLoggedIn } = useSettings();
  const { data: engData, getLevelProgress, getAvatar, loaded: engLoaded } = useEngagement();
  const [mode, setMode] = useState<'score' | 'time'>('score');
  const [tab, setTab] = useState<'overall' | 'personal'>('overall');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [timeRanking, setTimeRanking] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (mode === 'score') loadScores(); else loadTimeRanking(); }, [tab, mode]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const params = tab === 'personal' && isLoggedIn
        ? `?type=personal&user=${settings.username}` : '?type=overall';
      const res = await fetch(`/api/leaderboard${params}`);
      const data = await res.json();
      const real = data.scores || [];
      if (real.length > 0) {
        setScores(real);
      } else if (tab === 'overall') {
        const mock = [...MOCK_SCORES];
        mock.splice(3, 0, { id: 'me', username: settings.username, score: 1950, accuracy: 85, longest_streak: 21, song_name: 'Anti-Hero', song_artist: 'Taylor Swift', difficulty: 'medium', duration_seconds: 60, created_at: '2026-10-20T12:00:00Z' });
        setScores(mock);
      } else {
        setScores([
          { id: 'p1', username: settings.username, score: 1950, accuracy: 85, longest_streak: 21, song_name: 'Anti-Hero', song_artist: 'Taylor Swift', difficulty: 'medium', duration_seconds: 60, created_at: '2026-10-20T12:00:00Z' },
          { id: 'p2', username: settings.username, score: 1680, accuracy: 80, longest_streak: 18, song_name: 'Blinding Lights', song_artist: 'The Weeknd', difficulty: 'hard', duration_seconds: 30, created_at: '2026-10-19T10:30:00Z' },
          { id: 'p3', username: settings.username, score: 1420, accuracy: 77, longest_streak: 15, song_name: 'Levitating', song_artist: 'Dua Lipa', difficulty: 'easy', duration_seconds: 90, created_at: '2026-10-18T14:00:00Z' },
        ]);
      }
    } catch {}
    setLoading(false);
  };

  const loadTimeRanking = () => {
    setLoading(true);
    const myMinutes = engLoaded ? (engData.totalMinutesPlayed || 0) : 0;
    const mock = [...MOCK_TIME];
    // Insert user at correct position
    const myEntry: TimeEntry = { username: settings.username, totalMinutes: myMinutes || 215 };
    const insertIdx = mock.findIndex(e => e.totalMinutes < myEntry.totalMinutes);
    if (insertIdx >= 0) {
      mock.splice(insertIdx, 0, myEntry);
    } else {
      mock.push(myEntry);
    }
    setTimeRanking(mock);
    setLoading(false);
  };

  const myLevel = getLevelProgress();
  const myAvatar = getAvatar();
  const myScoreRank = scores.findIndex(s => s.username === settings.username) + 1;
  const myTimeRank = timeRanking.findIndex(t => t.username === settings.username) + 1;

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rankings</h1>
        <p className="text-gray-400 mb-8">Compare yourself with other players.</p>

        {/* Mode toggle: Score vs Time */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-6">
          <button onClick={() => setMode('score')}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all ${mode === 'score' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            Best score
          </button>
          <button onClick={() => setMode('time')}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all ${mode === 'time' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            Time played
          </button>
        </div>

        {mode === 'score' && (
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('overall')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === 'overall' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
              Overall
            </button>
            {isLoggedIn && (
              <button onClick={() => setTab('personal')}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === 'personal' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                My scores
              </button>
            )}
          </div>
        )}

        {/* Your rank card */}
        {mode === 'score' && tab === 'overall' && myScoreRank > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-gray-500">Your rank</span>
            <span className="text-2xl font-bold text-gray-900">#{myScoreRank}</span>
          </div>
        )}
        {mode === 'time' && myTimeRank > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Your rank</span>
              <span className="text-2xl font-bold text-gray-900 ml-3">#{myTimeRank}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Total time</div>
              <div className="text-lg font-bold text-gray-900">{formatTime(engLoaded ? (engData.totalMinutesPlayed || 0) : 0)}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : mode === 'score' ? (
          /* Score ranking */
          scores.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No scores yet.</div>
          ) : (
            <div className="space-y-2">
              {scores.map((entry, idx) => {
                const isMe = entry.username === settings.username;
                const rank = tab === 'overall' ? idx + 1 : null;
                return (
                  <div key={entry.id}
                    className={`flex items-center gap-4 rounded-2xl p-4 ${isMe ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                    {rank && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-700' : rank === 2 ? 'bg-gray-100 text-gray-600' : rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                      }`}>{rank}</div>
                    )}
                    <Avatar username={entry.username} photoUrl={isMe ? myAvatar : null} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{entry.username}</span>
                        {isMe && <span className="text-green-600 text-xs">(you)</span>}
                        {isMe && myLevel.level > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-[10px] font-bold text-white">{myLevel.level}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {entry.song_name || 'Slalom'} · {entry.accuracy}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 tabular-nums">{entry.score}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Time ranking */
          <div className="space-y-2">
            {timeRanking.map((entry, idx) => {
              const isMe = entry.username === settings.username;
              const rank = idx + 1;
              return (
                <div key={entry.username}
                  className={`flex items-center gap-4 rounded-2xl p-4 ${isMe ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    rank === 1 ? 'bg-yellow-100 text-yellow-700' : rank === 2 ? 'bg-gray-100 text-gray-600' : rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                  }`}>{rank}</div>
                  <Avatar username={entry.username} photoUrl={isMe ? myAvatar : null} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{entry.username}</span>
                      {isMe && <span className="text-green-600 text-xs">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.totalMinutes >= 60 ? `${Math.floor(entry.totalMinutes / 60)} hours ${entry.totalMinutes % 60} min` : `${entry.totalMinutes} minutes`} of practice
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 tabular-nums">{formatTime(entry.totalMinutes)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
