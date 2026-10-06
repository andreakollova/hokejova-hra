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
  const { user } = useAuth();
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    saveResult();
  }, []);

  const saveResult = async () => {
    if (result.inputMode === 'demo') return;
    if (!user) return;

    try {
      const isSlalom = type === 'slalom';
      const slalomResult = result as SlalomResult;
      const f8Result = result as FigureEightResult;

      const score = isSlalom ? slalomResult.score : f8Result.completedEights;
      const accuracy = isSlalom ? slalomResult.accuracy : 100;

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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isNewRecord && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-xs text-yellow-400 font-semibold mb-4">
              Nový osobný rekord!
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-white mb-1">
            {isSlalom ? 'Slalom dokončený' : 'Osmičky dokončené'}
          </h1>
          {result.inputMode === 'demo' && (
            <span className="inline-block bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full mt-2">
              Demo režim - neukladá sa do rebríčka
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {isSlalom ? (
            <>
              <StatCard label="Skóre" value={slalomResult.score.toString()} highlight />
              <StatCard label="Úspešnosť" value={`${slalomResult.accuracy}%`} />
              <StatCard label="Správne prejazdy" value={`${slalomResult.correctPasses}/${slalomResult.totalCones}`} />
              <StatCard label="Najdlhšia séria" value={slalomResult.longestStreak.toString()} />
              <StatCard label="Chyby" value={slalomResult.errors.toString()} />
              <StatCard
                label="Obťažnosť"
                value={slalomResult.difficulty === 'easy' ? 'Ľahká' : slalomResult.difficulty === 'medium' ? 'Stredná' : 'Ťažká'}
              />
            </>
          ) : (
            <>
              <StatCard label="Osmičky" value={f8Result.completedEights.toString()} highlight />
              <StatCard label="Tempo" value={`${f8Result.tempo}/min`} />
              <StatCard label="Čas" value={`${f8Result.duration}s`} />
            </>
          )}
        </div>

        {personalBest !== null && !isNewRecord && (
          <div className="text-center text-sm text-gray-500">
            Osobný rekord: <span className="text-gray-300 font-semibold">{personalBest}</span>
          </div>
        )}

        {isSlalom && (
          <details className="text-xs text-gray-500 card p-4">
            <summary className="cursor-pointer hover:text-gray-400 font-medium">
              Ako sa počíta skóre?
            </summary>
            <p className="mt-2 leading-relaxed">
              Za každý správny prejazd získaš základné body (10) násobené
              obťažnosťou. K tomu sa pripočíta bonus za nepretržitú sériu
              správnych prejazdov. Séria sa resetuje pri chybe.
            </p>
          </details>
        )}

        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1">
            Hrať znova
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
    <div className="card p-4">
      <div className={`text-2xl font-bold ${highlight ? 'text-green-400' : 'text-white'} tabular-nums`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1.5">{label}</div>
    </div>
  );
}
