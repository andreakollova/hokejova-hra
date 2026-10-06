'use client';

import { SlalomResult } from '@/components/games/SlalomGame';
import { FigureEightResult } from '@/components/games/FigureEightGame';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface ResultScreenProps {
  type: 'slalom' | 'figure_eight';
  result: SlalomResult | FigureEightResult;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function ResultScreen({
  type,
  result,
  onPlayAgain,
  onMenu,
}: ResultScreenProps) {
  const { user, profile } = useAuth();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    saveResult();
  }, []);

  const saveResult = async () => {
    if (result.inputMode === 'demo') return; // Demo results don't save to leaderboard
    if (!user) return;

    try {
      const isSlalom = type === 'slalom';
      const slalomResult = result as SlalomResult;
      const f8Result = result as FigureEightResult;

      const score = isSlalom ? slalomResult.score : f8Result.completedEights;
      const accuracy = isSlalom ? slalomResult.accuracy : 100;

      // Check personal best
      const { data: existing } = await supabase
        .from('training_results')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_type', type)
        .eq('difficulty', isSlalom ? slalomResult.difficulty : 'medium')
        .eq('duration_seconds', result.duration)
        .order('score', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        setPersonalBest(existing[0].score);
        if (score > existing[0].score) setIsNewRecord(true);
      } else {
        setIsNewRecord(true);
      }

      // Save result via API to validate server-side
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_type: type,
          difficulty: isSlalom ? slalomResult.difficulty : 'medium',
          duration_seconds: result.duration,
          score,
          accuracy,
          correct_passes: isSlalom ? slalomResult.correctPasses : f8Result.completedEights,
          total_cones: isSlalom ? slalomResult.totalCones : f8Result.completedEights,
          longest_streak: isSlalom ? slalomResult.longestStreak : f8Result.completedEights,
          challenge_version: isSlalom ? slalomResult.challengeVersion : 'v1',
          input_mode: result.inputMode,
          session_id: result.sessionId,
        }),
      });

      if (res.ok) setSaved(true);
    } catch (e) {
      console.error('Failed to save result:', e);
    }
  };

  const isSlalom = type === 'slalom';
  const slalomResult = result as SlalomResult;
  const f8Result = result as FigureEightResult;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-gray-900 rounded-2xl p-8 space-y-6">
        <div className="text-center">
          {isNewRecord && (
            <div className="text-yellow-400 text-sm font-medium mb-2">
              Novy osobny rekord!
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-1">
            {isSlalom ? 'Slalom dokonceny' : 'Osmicky dokoncene'}
          </h1>
          {result.inputMode === 'demo' && (
            <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded mt-1">
              Demo rezim - neuklada sa do rebricka
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {isSlalom ? (
            <>
              <StatCard
                label="Skore"
                value={slalomResult.score.toString()}
                highlight
              />
              <StatCard
                label="Uspesnost"
                value={`${slalomResult.accuracy}%`}
              />
              <StatCard
                label="Spravne prejazdy"
                value={`${slalomResult.correctPasses}/${slalomResult.totalCones}`}
              />
              <StatCard
                label="Najdlhsia seria"
                value={slalomResult.longestStreak.toString()}
              />
              <StatCard
                label="Chyby"
                value={slalomResult.errors.toString()}
              />
              <StatCard
                label="Obtaznost"
                value={slalomResult.difficulty === 'easy' ? 'Lahka' : slalomResult.difficulty === 'medium' ? 'Stredna' : 'Tazka'}
              />
            </>
          ) : (
            <>
              <StatCard
                label="Osmicky"
                value={f8Result.completedEights.toString()}
                highlight
              />
              <StatCard
                label="Tempo"
                value={`${f8Result.tempo}/min`}
              />
              <StatCard
                label="Cas"
                value={`${f8Result.duration}s`}
              />
            </>
          )}
        </div>

        {/* Personal best comparison */}
        {personalBest !== null && !isNewRecord && (
          <div className="text-center text-sm text-gray-400">
            Osobny rekord: {personalBest}
          </div>
        )}

        {/* Score explanation */}
        {isSlalom && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">
              Ako sa pocita skore?
            </summary>
            <p className="mt-2">
              Za kazdy spravny prejazd ziskas zakladne body (10) nasobene
              obtaznostou. K tomu sa pripocita bonus za nepretrzitu seriu
              spravnych prejazdov. Seria sa resetuje pri chybe.
            </p>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1">
            Hrat znova
          </button>
          <button onClick={onMenu} className="btn-secondary flex-1">
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className={`text-2xl font-bold ${highlight ? 'text-green-400' : 'text-white'} tabular-nums`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
