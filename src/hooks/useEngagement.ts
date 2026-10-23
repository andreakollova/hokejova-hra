'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sportqo_engagement';

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
  dailyFirstGameDate: string; // YYYY-MM-DD of last daily bonus
}

interface AvatarData {
  photoBase64: string | null;
}

interface EngagementData {
  streak: StreakData;
  xp: XPData;
  avatar: AvatarData;
  personalBest: Record<string, number>; // game_type -> best score
  totalGamesPlayed: number;
  totalMinutesPlayed: number;
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

function daysBetween(dateA: string, dateB: string): number {
  if (!dateA || !dateB) return Infinity;
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.floor(Math.abs(b - a) / (1000 * 60 * 60 * 24));
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
  } catch {
    // localStorage full or unavailable
  }
}

// --- Hook ---

export function useEngagement() {
  const [data, setData] = useState<EngagementData>(defaultEngagement);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const d = loadEngagement();
    // Check if streak should be frozen (missed a day)
    const today = getToday();
    const yesterday = getYesterday();
    const last = d.streak.lastPlayDate;

    if (last && last !== today && last !== yesterday && !d.streak.frozen && d.streak.currentStreak > 0) {
      // Missed a day - freeze the streak, NEVER lose it
      d.streak.frozen = true;
      d.streak.frozenDate = last;
      d.streak.consecutiveDaysAfterFreeze = 0;
      saveEngagement(d);
    }

    setData(d);
    setLoaded(true);
  }, []);

  const persist = useCallback((next: EngagementData) => {
    setData(next);
    saveEngagement(next);
  }, []);

  // Record a game and return XP breakdown
  const recordGame = useCallback(
    (opts: {
      score: number;
      accuracy: number;
      correctPasses: number;
      durationSeconds: number;
      gameType: string;
    }): XPBreakdown => {
      const today = getToday();
      const next = { ...data, streak: { ...data.streak }, xp: { ...data.xp }, avatar: { ...data.avatar } };

      // --- Streak logic ---
      const wasPlayedToday = next.streak.lastPlayDate === today;

      // Always unfreeze when playing a game, regardless of whether played today
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

      // --- XP calculation ---
      const breakdown: XPBreakdown = {
        gameComplete: 50,
        correctPasses: opts.correctPasses * 5,
        perfectAccuracy: opts.accuracy === 100 ? 100 : 0,
        beatPersonalBest: 0,
        dailyFirstGame: 0,
        streakBonus: 0,
        total: 0,
      };

      // Personal best check
      const prevBest = next.personalBest[opts.gameType] || 0;
      if (opts.score > prevBest) {
        if (prevBest > 0) {
          breakdown.beatPersonalBest = 200;
        }
        next.personalBest = { ...next.personalBest, [opts.gameType]: opts.score };
      }

      // Daily first game bonus
      if (next.xp.dailyFirstGameDate !== today) {
        breakdown.dailyFirstGame = 50;
        next.xp.dailyFirstGameDate = today;
      }

      // Streak bonus
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
      next.totalMinutesPlayed = (next.totalMinutesPlayed || 0) + Math.round(opts.durationSeconds / 60);

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

  const getStreak = useCallback(() => {
    return data.streak;
  }, [data]);

  const getXP = useCallback(() => {
    return data.xp.totalXP || 0;
  }, [data]);

  const getLevel = useCallback(() => {
    return calculateLevel(data.xp.totalXP || 0);
  }, [data]);

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

  const getAvatar = useCallback(() => {
    return data.avatar.photoBase64;
  }, [data]);

  const getPersonalBest = useCallback(
    (gameType: string) => {
      return data.personalBest[gameType] || 0;
    },
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
