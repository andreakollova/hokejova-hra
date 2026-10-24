'use client';

import { useSettings } from '@/hooks/useSettings';
import { useEngagement } from '@/hooks/useEngagement';
import { ACHIEVEMENTS, CATEGORY_LABELS } from '@/lib/achievements';
import Link from 'next/link';
import Image from 'next/image';

export default function AchievementsPage() {
  const { settings, isLoggedIn, loaded } = useSettings();
  const { getUnlockedAchievements, getXP, loaded: engLoaded } = useEngagement();

  if (!loaded || !engLoaded) return null;
  if (!isLoggedIn) { if (typeof window !== 'undefined') window.location.href = '/'; return null; }

  const unlocked = getUnlockedAchievements();
  const totalXP = getXP();
  const unlockedSet = new Set(unlocked);
  const categories = ['time', 'games', 'streak', 'social', 'score', 'mastery'];

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlocked.length;
  const totalAchXP = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 px-6 sm:px-10 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <Image src="/images/hb-logo-white.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Achievements</h1>
          <div className="flex items-center gap-6">
            <div className="text-sm text-white/50">
              <span className="text-emerald-400 font-bold">{unlockedCount}</span> / {totalAchievements} unlocked
            </div>
            <div className="text-sm text-white/50">
              <span className="text-amber-400 font-bold">{totalAchXP.toLocaleString()}</span> XP earned from achievements
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>
        </div>

        {categories.map(cat => {
          const achievements = ACHIEVEMENTS.filter(a => a.category === cat);
          const catUnlocked = achievements.filter(a => unlockedSet.has(a.id)).length;

          return (
            <div key={cat} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{CATEGORY_LABELS[cat]}</h2>
                <span className="text-xs text-white/40">{catUnlocked}/{achievements.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map(ach => {
                  const isUnlocked = unlockedSet.has(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`flex items-center gap-4 rounded-2xl p-4 border transition-all ${
                        isUnlocked
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white/3 border-white/5 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        isUnlocked ? 'bg-emerald-500/20' : 'bg-white/5 grayscale'
                      }`}>
                        {ach.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{ach.name}</div>
                        <div className="text-xs text-white/50 truncate">{ach.description}</div>
                      </div>
                      <div className={`text-xs font-bold tabular-nums ${isUnlocked ? 'text-amber-400' : 'text-white/20'}`}>
                        +{ach.xp} XP
                      </div>
                      {isUnlocked && (
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
