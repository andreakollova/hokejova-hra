'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  score: number;
  accuracy: number;
  longest_streak: number;
  correct_passes: number;
  total_cones: number;
  created_at: string;
  profiles: { nickname: string } | null;
}

export default function RebricekPage() {
  const { user } = useAuth();
  const [gameType, setGameType] = useState<'slalom' | 'figure_eight'>('slalom');
  const [difficulty, setDifficulty] = useState('easy');
  const [duration, setDuration] = useState(60);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [gameType, difficulty, duration]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('training_results')
        .select('id, score, accuracy, longest_streak, correct_passes, total_cones, created_at, profiles(nickname)')
        .eq('game_type', gameType)
        .eq('difficulty', difficulty)
        .eq('duration_seconds', duration)
        .eq('input_mode', 'camera')
        .order('score', { ascending: false })
        .limit(50);

      if (data) {
        setEntries(data as unknown as LeaderboardEntry[]);

        // Find user rank
        if (user) {
          const { data: userResult } = await supabase
            .from('training_results')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', gameType)
            .eq('difficulty', difficulty)
            .eq('duration_seconds', duration)
            .eq('input_mode', 'camera')
            .order('score', { ascending: false })
            .limit(1);

          if (userResult && userResult.length > 0) {
            const { count } = await supabase
              .from('training_results')
              .select('*', { count: 'exact', head: true })
              .eq('game_type', gameType)
              .eq('difficulty', difficulty)
              .eq('duration_seconds', duration)
              .eq('input_mode', 'camera')
              .gt('score', userResult[0].score);

            setUserRank(count !== null ? count + 1 : null);
          } else {
            setUserRank(null);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block"
        >
          &larr; Späť
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Rebríček</h1>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Game type */}
          <div className="flex gap-2">
            <button
              onClick={() => setGameType('slalom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                gameType === 'slalom'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Slalom
            </button>
            <button
              onClick={() => setGameType('figure_eight')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                gameType === 'figure_eight'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Osmičky
            </button>
          </div>

          <div className="flex gap-4">
            {/* Difficulty */}
            {gameType === 'slalom' && (
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      difficulty === d
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                    }`}
                  >
                    {d === 'easy' ? 'Ľahká' : d === 'medium' ? 'Stredná' : 'Ťažká'}
                  </button>
                ))}
              </div>
            )}

            {/* Duration */}
            <div className="flex gap-2">
              {[30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    duration === d
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User rank */}
        {userRank && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <span className="text-sm text-green-600">
              Tvoje umiestnenie: <strong>#{userRank}</strong>
            </span>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Načítavam...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Zatiaľ žiadne výsledky v tejto kategórii
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  idx < 3
                    ? 'bg-white border border-gray-200 shadow-sm'
                    : 'bg-white border border-gray-100'
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0
                      ? 'bg-yellow-50 text-yellow-600'
                      : idx === 1
                      ? 'bg-gray-100 text-gray-500'
                      : idx === 2
                      ? 'bg-orange-50 text-orange-500'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {entry.profiles?.nickname || 'Anonymný'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.accuracy}% presnosť | Séria {entry.longest_streak}
                  </div>
                </div>

                {/* Score */}
                <div className="text-xl font-bold text-green-600 tabular-nums">
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
