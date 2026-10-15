'use client';

import { SlalomResult } from '@/components/games/SlalomGame';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';

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
  const [rank, setRank] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    saveScore();
  }, []);

  const saveScore = async () => {
    if (!isLoggedIn) return;
    if (result.inputMode === 'demo') return;

    const isSlalom = type === 'slalom';
    const slalomResult = result as SlalomResult;
    const score = isSlalom ? slalomResult.score : (result as FigureEightResult).completedEights;

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

  const isSlalom = type === 'slalom';
  const slalomResult = result as SlalomResult;
  const f8Result = result as FigureEightResult;

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          {rank && rank <= 3 && (
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs text-yellow-600 font-semibold mb-3">
              #{rank} v rebriku!
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            {isSlalom ? 'Slalom dokonceny' : 'Osmicky dokoncene'}
          </h1>
          {songName && (
            <p className="text-sm text-gray-500">{songName} - {songArtist}</p>
          )}
          {result.inputMode === 'demo' && (
            <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full mt-2">
              Demo rezim
            </span>
          )}
        </div>

        {/* Main score */}
        <div className="text-center py-6">
          <div className="text-6xl font-black text-gray-900 tabular-nums">
            {isSlalom ? slalomResult.score : f8Result.completedEights}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isSlalom ? 'bodov' : 'osmiciek'}
          </div>
          {rank && (
            <div className="mt-3 text-sm text-green-600 font-medium">
              #{rank} celkovo
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {isSlalom ? (
            <>
              <StatCard label="Presnost" value={`${slalomResult.accuracy}%`} />
              <StatCard label="Seria" value={slalomResult.longestStreak.toString()} />
              <StatCard label="Spravne" value={`${slalomResult.correctPasses}/${slalomResult.totalCones}`} />
            </>
          ) : (
            <>
              <StatCard label="Osmicky" value={f8Result.completedEights.toString()} />
              <StatCard label="Tempo" value={`${f8Result.tempo}/min`} />
              <StatCard label="Cas" value={`${f8Result.duration}s`} />
            </>
          )}
        </div>

        {!isLoggedIn && result.inputMode !== 'demo' && (
          <p className="text-center text-xs text-gray-400">
            Prihlas sa pre ukladanie skore do rebricka
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1">Hrat znova</button>
          <button onClick={onMenu} className="btn-secondary flex-1">Menu</button>
        </div>

        <div className="text-center">
          <a href="/rebricek" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            Pozriet rebricek
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
