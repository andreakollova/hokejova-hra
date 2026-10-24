// Free games (always available)
export const FREE_GAMES = ['trening']; // slalom/HockeyBeats

// All premium games
export const PREMIUM_GAMES = [
  'target-smash', 'space', 'jelly-stack', 'orbit-hop', 'neon-drift',
  'brick-rush', 'magnet-flip', 'laser-maze', 'color-catch',
  'terciky', 'osmicky-terciky', 'osmicky',
];

// Free trial: 10 minutes per game before lock
export const FREE_TRIAL_SECONDS = 600; // 10 minutes

export const PLANS = {
  monthly: { price: 845, currency: 'eur', interval: 'month' as const, label: '€8.45/month' },
  yearly: { price: 7999, currency: 'eur', interval: 'year' as const, label: '€79.99/year', savings: '21%' },
};

export type PromoType = '1month' | '3months' | 'lifetime';

export interface PromoCode {
  code: string;
  type: PromoType;
  maxUses: number;
  usedCount: number;
  clubName?: string; // for group discounts
  discountPercent?: number; // for club group discounts (e.g. 20% off)
}

export function isGameFree(gameSlug: string): boolean {
  return FREE_GAMES.includes(gameSlug);
}

export function getTrialSecondsUsed(gameSlug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('hb_trial_usage');
    if (raw) {
      const usage = JSON.parse(raw);
      return usage[gameSlug] || 0;
    }
  } catch {}
  return 0;
}

export function addTrialSeconds(gameSlug: string, seconds: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('hb_trial_usage');
    const usage = raw ? JSON.parse(raw) : {};
    usage[gameSlug] = (usage[gameSlug] || 0) + seconds;
    localStorage.setItem('hb_trial_usage', JSON.stringify(usage));
  } catch {}
}

export function isTrialExpired(gameSlug: string): boolean {
  return getTrialSecondsUsed(gameSlug) >= FREE_TRIAL_SECONDS;
}

export function getTrialRemaining(gameSlug: string): number {
  return Math.max(0, FREE_TRIAL_SECONDS - getTrialSecondsUsed(gameSlug));
}

export function hasActiveSubscription(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('hb_subscription');
    if (!raw) return false;
    const sub = JSON.parse(raw);
    if (sub.type === 'lifetime') return true;
    if (sub.expiresAt && new Date(sub.expiresAt) > new Date()) return true;
  } catch {}
  return false;
}

export function getSubscriptionInfo(): { active: boolean; type: string; expiresAt: string | null } {
  if (typeof window === 'undefined') return { active: false, type: 'free', expiresAt: null };
  try {
    const raw = localStorage.getItem('hb_subscription');
    if (!raw) return { active: false, type: 'free', expiresAt: null };
    const sub = JSON.parse(raw);
    if (sub.type === 'lifetime') return { active: true, type: 'lifetime', expiresAt: null };
    if (sub.expiresAt && new Date(sub.expiresAt) > new Date()) return { active: true, type: sub.type, expiresAt: sub.expiresAt };
  } catch {}
  return { active: false, type: 'free', expiresAt: null };
}

export function activatePromo(type: PromoType) {
  const now = new Date();
  let expiresAt: string | null = null;
  if (type === '1month') {
    now.setMonth(now.getMonth() + 1);
    expiresAt = now.toISOString();
  } else if (type === '3months') {
    now.setMonth(now.getMonth() + 3);
    expiresAt = now.toISOString();
  }
  const sub = { type: type === 'lifetime' ? 'lifetime' : 'promo', expiresAt, promoType: type, activatedAt: new Date().toISOString() };
  localStorage.setItem('hb_subscription', JSON.stringify(sub));
}

export function canPlayGame(gameSlug: string): boolean {
  if (isGameFree(gameSlug)) return true;
  if (hasActiveSubscription()) return true;
  if (!isTrialExpired(gameSlug)) return true;
  return false;
}
