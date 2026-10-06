// Deterministic scoring system
// Score = correct_passes * base_points * difficulty_multiplier + streak_bonus

export interface ScoreConfig {
  basePoints: number;
  difficultyMultiplier: number;
  streakBonusPerCone: number;
  maxStreakBonus: number;
}

export const DIFFICULTY_CONFIGS: Record<string, ScoreConfig> = {
  easy: {
    basePoints: 10,
    difficultyMultiplier: 1.0,
    streakBonusPerCone: 2,
    maxStreakBonus: 20,
  },
  medium: {
    basePoints: 10,
    difficultyMultiplier: 1.5,
    streakBonusPerCone: 3,
    maxStreakBonus: 30,
  },
  hard: {
    basePoints: 10,
    difficultyMultiplier: 2.0,
    streakBonusPerCone: 5,
    maxStreakBonus: 50,
  },
};

export interface TrainingStats {
  score: number;
  correctPasses: number;
  totalCones: number;
  accuracy: number;
  longestStreak: number;
  errors: number;
}

/**
 * Calculate score for a single cone pass.
 * Score = basePoints * difficultyMultiplier + min(streak * streakBonus, maxStreakBonus)
 */
export function calculateConeScore(
  difficulty: string,
  currentStreak: number
): number {
  const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.easy;
  const base = config.basePoints * config.difficultyMultiplier;
  const streakBonus = Math.min(
    currentStreak * config.streakBonusPerCone,
    config.maxStreakBonus
  );
  return Math.round(base + streakBonus);
}

/**
 * Calculate final training stats
 */
export function calculateFinalStats(
  correctPasses: number,
  totalCones: number,
  longestStreak: number,
  difficulty: string
): TrainingStats {
  const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.easy;

  // Recalculate total score deterministically
  let score = 0;
  let streak = 0;
  // We approximate: assume the longest streak happened once
  // For exact scoring, we'd track each cone, but this is deterministic
  // given the same inputs
  for (let i = 0; i < correctPasses; i++) {
    streak++;
    score += calculateConeScore(difficulty, streak);
    if (streak >= longestStreak && i < correctPasses - 1) {
      // Reset streak at some point to simulate errors
      // This is a simplification - real scoring tracks each cone
    }
  }

  // Simpler: just compute based on correct passes and average streak
  score = 0;
  const avgStreakPoints = Math.min(
    Math.floor(longestStreak / 2) * config.streakBonusPerCone,
    config.maxStreakBonus
  );
  score = correctPasses * Math.round(
    config.basePoints * config.difficultyMultiplier + avgStreakPoints
  );

  return {
    score,
    correctPasses,
    totalCones,
    accuracy: totalCones > 0 ? Math.round((correctPasses / totalCones) * 100) : 0,
    longestStreak,
    errors: totalCones - correctPasses,
  };
}

// Slalom game parameters by difficulty
export interface SlalomConfig {
  /** Speed of cones approaching (units per second) */
  coneSpeed: number;
  /** Minimum gap between cones (seconds) */
  minGap: number;
  /** Maximum gap between cones (seconds) */
  maxGap: number;
  /** Required lateral movement range (0-1, fraction of total width) */
  movementRange: number;
  /** Label */
  label: string;
}

export const SLALOM_CONFIGS: Record<string, SlalomConfig> = {
  easy: {
    coneSpeed: 3.0,
    minGap: 1.8,
    maxGap: 2.8,
    movementRange: 0.3,
    label: 'Ľahká',
  },
  medium: {
    coneSpeed: 4.5,
    minGap: 1.3,
    maxGap: 2.2,
    movementRange: 0.4,
    label: 'Stredná',
  },
  hard: {
    coneSpeed: 6.0,
    minGap: 0.9,
    maxGap: 1.6,
    movementRange: 0.5,
    label: 'Ťažká',
  },
};

/**
 * Generate a deterministic cone sequence for a rated challenge.
 * Uses a seeded PRNG for reproducibility.
 */
export function generateConeSequence(
  duration: number,
  difficulty: string,
  seed: string
): ConeDefinition[] {
  const config = SLALOM_CONFIGS[difficulty] || SLALOM_CONFIGS.easy;
  const rng = seededRandom(seed);
  const cones: ConeDefinition[] = [];

  let time = 2.0; // Start after 2 seconds
  let lastSide: 'left' | 'right' = rng() > 0.5 ? 'left' : 'right';

  while (time < duration - 1) {
    // Alternate sides to force movement
    const side: 'left' | 'right' = lastSide === 'left' ? 'right' : 'left';
    lastSide = side;

    // Random gap within range
    const gap = config.minGap + rng() * (config.maxGap - config.minGap);

    cones.push({
      time,
      side,
      scored: false,
    });

    time += gap;
  }

  return cones;
}

export interface ConeDefinition {
  time: number;
  side: 'left' | 'right';
  scored: boolean;
}

/**
 * Seeded PRNG (mulberry32)
 */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }

  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Challenge versions - fixed seeds for fair comparison
export const CHALLENGE_VERSIONS: Record<string, string> = {
  'slalom-easy-30': 'v1-se30',
  'slalom-easy-60': 'v1-se60',
  'slalom-easy-90': 'v1-se90',
  'slalom-medium-30': 'v1-sm30',
  'slalom-medium-60': 'v1-sm60',
  'slalom-medium-90': 'v1-sm90',
  'slalom-hard-30': 'v1-sh30',
  'slalom-hard-60': 'v1-sh60',
  'slalom-hard-90': 'v1-sh90',
};
