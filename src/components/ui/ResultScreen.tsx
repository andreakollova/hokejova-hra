'use client';

import { SlalomResult } from '@/components/games/SlalomGame';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useSettings } from '@/hooks/useSettings';
import { useEngagement, XPBreakdown } from '@/hooks/useEngagement';
import StreakBadge from '@/components/ui/StreakBadge';
import { useState, useEffect, useRef } from 'react';

interface ResultScreenProps {
  type: 'slalom' | 'figure_eight';
  result: SlalomResult | FigureEightResult;
  onPlayAgain: () => void;
  onMenu: () => void;
  songName?: string;
  songArtist?: string;
  songBpm?: number;
}

export default function ResultScreen({
  type,
  result,
  onPlayAgain,
  onMenu,
  songName,
  songArtist,
  songBpm,
}: ResultScreenProps) {
  const { settings, isLoggedIn } = useSettings();
  const { recordGame, getStreak, getPersonalBest, loaded: engLoaded } = useEngagement();
  const [rank, setRank] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [xpBreakdown, setXpBreakdown] = useState<XPBreakdown | null>(null);
  const recordedRef = useRef(false);

  const isSlalom = type === 'slalom';
  const slalomResult = result as SlalomResult;
  const f8Result = result as FigureEightResult;
  const score = isSlalom ? slalomResult.score : f8Result.completedEights;
  const accuracy = isSlalom ? slalomResult.accuracy : 100;
  const correctPasses = isSlalom ? slalomResult.correctPasses : 0;

  useEffect(() => {
    saveScore();
  }, []);

  // Record engagement once loaded
  useEffect(() => {
    if (!engLoaded || recordedRef.current) return;
    recordedRef.current = true;

    const breakdown = recordGame({
      score,
      accuracy,
      correctPasses,
      durationSeconds: result.duration,
      gameType: type,
    });
    setXpBreakdown(breakdown);
  }, [engLoaded]);

  const saveScore = async () => {
    if (!isLoggedIn) return;

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: settings.username,
          game_type: type,
          song_name: songName || null,
          song_artist: songArtist || null,
          song_bpm: songBpm || null,
          difficulty: isSlalom ? slalomResult.difficulty : 'medium',
          duration_seconds: result.duration,
          score,
          accuracy: isSlalom ? slalomResult.accuracy : 100,
          correct_passes: isSlalom ? slalomResult.correctPasses : 0,
          longest_streak: isSlalom ? slalomResult.longestStreak : 0,
          input_mode: result.inputMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRank(data.rank);
        setSaved(true);
      }
    } catch {}
  };

  const streak = getStreak();

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          {rank && rank <= 3 && (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs text-yellow-600 font-semibold mb-3">
              #{rank} in rankings!
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            {isSlalom ? 'Slalom complete' : 'Figure 8 complete'}
          </h1>
          {songName && (
            <p className="text-sm text-gray-500">{songName} - {songArtist}</p>
          )}
          {result.inputMode === 'demo' && (
            <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full mt-2">
              Demo mode
            </span>
          )}
        </div>

        {/* Main score */}
        <div className="text-center py-6">
          <div className="text-6xl font-black text-gray-900 tabular-nums">
            {isSlalom ? slalomResult.score : f8Result.completedEights}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isSlalom ? 'points' : 'figure 8s'}
          </div>
          {rank && (
            <div className="mt-3 text-sm text-green-600 font-medium">
              #{rank} overall
            </div>
          )}
        </div>

        {/* Streak badge */}
        {result.inputMode !== 'demo' && streak.currentStreak > 0 && (
          <div className="flex justify-center">
            <StreakBadge currentStreak={streak.currentStreak} frozen={streak.frozen} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {isSlalom ? (
            <>
              <StatCard label="Accuracy" value={`${slalomResult.accuracy}%`} />
              <StatCard label="Streak" value={slalomResult.longestStreak.toString()} />
              <StatCard label="Correct" value={`${slalomResult.correctPasses}/${slalomResult.totalCones}`} />
            </>
          ) : (
            <>
              <StatCard label="Figure 8s" value={f8Result.completedEights.toString()} />
              <StatCard label="Tempo" value={`${f8Result.tempo}/min`} />
              <StatCard label="Time" value={`${f8Result.duration}s`} />
            </>
          )}
        </div>

        {/* XP Breakdown */}
        {xpBreakdown && xpBreakdown.total > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">XP Earned</h3>
            <div className="space-y-1.5">
              {xpBreakdown.gameComplete > 0 && (
                <XPLine label="Game completed" value={xpBreakdown.gameComplete} />
              )}
              {xpBreakdown.correctPasses > 0 && (
                <XPLine label="Correct passes" value={xpBreakdown.correctPasses} />
              )}
              {xpBreakdown.perfectAccuracy > 0 && (
                <XPLine label="Perfect accuracy!" value={xpBreakdown.perfectAccuracy} highlight />
              )}
              {xpBreakdown.beatPersonalBest > 0 && (
                <XPLine label="New personal best!" value={xpBreakdown.beatPersonalBest} highlight />
              )}
              {xpBreakdown.dailyFirstGame > 0 && (
                <XPLine label="Daily first game" value={xpBreakdown.dailyFirstGame} />
              )}
              {xpBreakdown.streakBonus > 0 && (
                <XPLine label={`Streak bonus (x${streak.currentStreak})`} value={xpBreakdown.streakBonus} />
              )}
              <div className="border-t border-gray-100 pt-1.5 mt-2 flex justify-between">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900 tabular-nums">+{xpBreakdown.total} XP</span>
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && result.inputMode !== 'demo' && (
          <p className="text-center text-xs text-gray-400">
            Log in to save your score to the rankings
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1">Play again</button>
          <a href="/dashboard" className="btn-secondary flex-1 text-center">Menu</a>
        </div>

        <div className="text-center">
          <a href="/rebricek" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            View rankings
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function XPLine({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${highlight ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-xs font-medium tabular-nums ${highlight ? 'text-green-600' : 'text-gray-700'}`}>+{value}</span>
    </div>
  );
}
