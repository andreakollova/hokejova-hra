'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';

interface TrainingRecord {
  id: string;
  game_type: string;
  difficulty: string;
  duration_seconds: number;
  score: number;
  accuracy: number;
  correct_passes: number;
  total_cones: number;
  longest_streak: number;
  created_at: string;
}

export default function ProfilPage() {
  const { user, profile, loading, updateNickname, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [history, setHistory] = useState<TrainingRecord[]>([]);
  const [editNick, setEditNick] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('training_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  };

  const handleSaveNickname = async () => {
    if (newNickname.length < 2) return;
    await updateNickname(newNickname);
    setEditNick(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-gray-500">Načítavam...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-lg mx-auto text-center pt-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Môj profil</h1>
          <p className="text-gray-500 mb-6">
            Prihlas sa, aby si videl svoju históriu a osobné rekordy.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="btn-primary"
          >
            Prihlásiť sa
          </button>
          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              &larr; Späť
            </Link>
          </div>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 inline-block"
        >
          &larr; Späť
        </Link>

        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex justify-between items-start">
            <div>
              {editNick ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="input-field w-48"
                    placeholder="Nová prezývka"
                  />
                  <button onClick={handleSaveNickname} className="btn-primary text-sm px-3 py-2">
                    Uložiť
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.nickname || 'Hráč'}
                  </h1>
                  <button
                    onClick={() => {
                      setEditNick(true);
                      setNewNickname(profile?.nickname || '');
                    }}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Upraviť
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Odhlásiť
            </button>
          </div>
        </div>

        {/* Training history */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          História tréningov
        </h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-500">Zatiaľ žiadne tréningy</p>
            <Link href="/trening" className="btn-primary mt-4 inline-block">
              Začať trénovať
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {rec.game_type === 'slalom' ? 'Slalom' : 'Osmičky'}{' '}
                    <span className="text-gray-400">
                      {rec.difficulty === 'easy'
                        ? 'Ľahká'
                        : rec.difficulty === 'medium'
                        ? 'Stredná'
                        : 'Ťažká'}{' '}
                      / {rec.duration_seconds}s
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(rec.created_at).toLocaleDateString('sk-SK', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 tabular-nums">
                    {rec.score}
                  </div>
                  <div className="text-xs text-gray-400">
                    {rec.accuracy}% | Séria {rec.longest_streak}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
