'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'sportqo_engagement';
const SYNC_DEBOUNCE = 2000;

// --- Types ---

interface StreakData {
  currentStreak: number;
  lastPlayDate: string;
  frozen: boolean;
  frozenDate: string;
  consecutiveDaysAfterFreeze: number;
  justUnfroze?: boolean;
}

interface XPData {
  totalXP: number;
  dailyFirstGameDate: string;
}

interface AvatarData {
  photoBase64: string | null;
}

interface EngagementData {
  streak: StreakData;
  xp: XPData;
  avatar: AvatarData;
  personalBest: Record<string, number>;
  totalGamesPlayed: number;
  totalMinutesPlayed: number;
  totalSecondsPlayed: number;
}

export interface XPBreakdown {
  gameComplete: number;
  correctPasses: number;
  perfectAccuracy: number;
  beatPersonalBest: number;
  dailyFirstGame: number;
  streakBonus: number;
  total: number;
}

const defaultEngagement: EngagementData = {
  streak: {
    currentStreak: 0,
    lastPlayDate: '',
    frozen: false,
    frozenDate: '',
    consecutiveDaysAfterFreeze: 0,
  },
  xp: {
    totalXP: 0,
    dailyFirstGameDate: '',
  },
  avatar: {
    photoBase64: null,
  },
  personalBest: {},
  totalGamesPlayed: 0,
  totalMinutesPlayed: 0,
  totalSecondsPlayed: 0,
};

// --- Helpers ---

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100));
}

function xpForLevel(level: number): number {
  return level * level * 100;
}

function loadEngagement(): EngagementData {
  if (typeof window === 'undefined') return defaultEngagement;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEngagement;
    return { ...defaultEngagement, ...JSON.parse(raw) };
  } catch {
    return defaultEngagement;
  }
}

function saveEngagement(data: EngagementData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sportqo_user_settings');
    if (raw) {
      const s = JSON.parse(raw);
      return s.loggedIn ? s.username : null;
    }
  } catch {}
  return null;
}

// Merge: pick the one with more XP / games (most progressed)
function mergeEngagement(local: EngagementData, cloud: EngagementData): EngagementData {
  const localXP = local.xp?.totalXP || 0;
  const cloudXP = cloud.xp?.totalXP || 0;
  // Use whichever has more progress
  const base = cloudXP >= localXP ? cloud : local;
  // But keep the best of both for personal bests
  const mergedBests = { ...(cloud.personalBest || {}), ...(local.personalBest || {}) };
  for (const key of Object.keys(mergedBests)) {
    mergedBests[key] = Math.max(local.personalBest?.[key] || 0, cloud.personalBest?.[key] || 0);
  }
  return { ...defaultEngagement, ...base, personalBest: mergedBests };
}

// --- Hook ---

export function useEngagement() {
  const [data, setData] = useState<EngagementData>(defaultEngagement);
  const [loaded, setLoaded] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToCloud = useCallback((engData: EngagementData) => {
    const username = getUsername();
    if (!username) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        // Don't sync avatar base64 in engagement - it's separate
        const { avatar, ...rest } = engData;
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, engagement: rest, avatar: avatar.photoBase64 }),
        });
      } catch {}
    }, SYNC_DEBOUNCE);
  }, []);

  useEffect(() => {
    const d = loadEngagement();
    const today = getToday();
    const yesterday = getYesterday();
    const last = d.streak.lastPlayDate;

    if (last && last !== today && last !== yesterday && !d.streak.frozen && d.streak.currentStreak > 0) {
      d.streak.frozen = true;
      d.streak.frozenDate = last;
      d.streak.consecutiveDaysAfterFreeze = 0;
      saveEngagement(d);
    }

    setData(d);
    setLoaded(true);

    // Load from cloud and merge
    const username = getUsername();
    if (username) {
      fetch(`/api/user-data?username=${encodeURIComponent(username)}`)
        .then(r => r.json())
        .then(json => {
          if (json.data) {
            const cloudEng = json.data.engagement ? { ...defaultEngagement, ...json.data.engagement } : defaultEngagement;
            if (json.data.avatar) {
              cloudEng.avatar = { photoBase64: json.data.avatar };
            }
            const merged = mergeEngagement(d, cloudEng);
            setData(merged);
            saveEngagement(merged);
            // If local had more, push to cloud
            if ((d.xp?.totalXP || 0) > (cloudEng.xp?.totalXP || 0)) {
              syncToCloud(merged);
            }
          } else {
            // No cloud data yet, push local
            syncToCloud(d);
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((next: EngagementData) => {
    setData(next);
    saveEngagement(next);
    syncToCloud(next);
  }, [syncToCloud]);

  const recordGame = useCallback(
    (opts: {
      score: number;
      accuracy: number;
      correctPasses: number;
      durationSeconds: number;
      gameType: string;
    }): XPBreakdown => {
      const today = getToday();
      const fresh = loadEngagement();
      const next = { ...fresh, streak: { ...fresh.streak }, xp: { ...fresh.xp }, avatar: { ...fresh.avatar } };

      const wasPlayedToday = next.streak.lastPlayDate === today;

      if (next.streak.frozen) {
        next.streak.frozen = false;
        next.streak.frozenDate = '';
        next.streak.consecutiveDaysAfterFreeze = 0;
        if (!wasPlayedToday) next.streak.currentStreak += 1;
        next.streak.justUnfroze = true;
      } else if (!wasPlayedToday) {
        const yesterday = getYesterday();
        if (next.streak.lastPlayDate === yesterday || next.streak.lastPlayDate === '') {
          next.streak.currentStreak += 1;
        }
        if (next.streak.currentStreak === 0) {
          next.streak.currentStreak = 1;
        }
      }
      if (!wasPlayedToday) {
        next.streak.lastPlayDate = today;
      }

      const breakdown: XPBreakdown = {
        gameComplete: 50,
        correctPasses: opts.correctPasses * 5,
        perfectAccuracy: opts.accuracy === 100 ? 100 : 0,
        beatPersonalBest: 0,
        dailyFirstGame: 0,
        streakBonus: 0,
        total: 0,
      };

      const prevBest = next.personalBest[opts.gameType] || 0;
      if (opts.score > prevBest) {
        if (prevBest > 0) {
          breakdown.beatPersonalBest = 200;
        }
        next.personalBest = { ...next.personalBest, [opts.gameType]: opts.score };
      }

      if (next.xp.dailyFirstGameDate !== today) {
        breakdown.dailyFirstGame = 50;
        next.xp.dailyFirstGameDate = today;
      }

      if (!next.streak.frozen && next.streak.currentStreak > 0) {
        breakdown.streakBonus = next.streak.currentStreak * 10;
      }

      breakdown.total =
        breakdown.gameComplete +
        breakdown.correctPasses +
        breakdown.perfectAccuracy +
        breakdown.beatPersonalBest +
        breakdown.dailyFirstGame +
        breakdown.streakBonus;

      next.xp.totalXP = (next.xp.totalXP || 0) + breakdown.total;
      next.totalGamesPlayed = (next.totalGamesPlayed || 0) + 1;
      next.totalSecondsPlayed = (next.totalSecondsPlayed || 0) + opts.durationSeconds;
      next.totalMinutesPlayed = Math.floor((next.totalSecondsPlayed || 0) / 60);

      persist(next);
      return breakdown;
    },
    [data, persist],
  );

  const setAvatar = useCallback(
    (photoBase64: string | null) => {
      const next = { ...data, avatar: { photoBase64 } };
      persist(next);
    },
    [data, persist],
  );

  const getStreak = useCallback(() => data.streak, [data]);
  const getXP = useCallback(() => data.xp.totalXP || 0, [data]);
  const getLevel = useCallback(() => calculateLevel(data.xp.totalXP || 0), [data]);

  const getLevelProgress = useCallback(() => {
    const totalXP = data.xp.totalXP || 0;
    const level = calculateLevel(totalXP);
    const currentLevelXP = xpForLevel(level);
    const nextLevelXP = xpForLevel(level + 1);
    const progress = nextLevelXP - currentLevelXP === 0 ? 0 : (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
    return {
      level,
      currentXP: totalXP,
      xpInLevel: totalXP - currentLevelXP,
      xpNeeded: nextLevelXP - currentLevelXP,
      progress: Math.min(Math.max(progress, 0), 1),
    };
  }, [data]);

  const getAvatar = useCallback(() => data.avatar.photoBase64, [data]);

  const getPersonalBest = useCallback(
    (gameType: string) => data.personalBest[gameType] || 0,
    [data],
  );

  const clearUnfroze = useCallback(() => {
    if (data.streak.justUnfroze) {
      const next = { ...data, streak: { ...data.streak, justUnfroze: false } };
      persist(next);
    }
  }, [data, persist]);

  return {
    loaded,
    data,
    recordGame,
    setAvatar,
    getStreak,
    getXP,
    getLevel,
    getLevelProgress,
    getAvatar,
    getPersonalBest,
    clearUnfroze,
  };
}
