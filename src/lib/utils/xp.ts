import type { ChallengeType, Difficulty, LevelInfo } from '../types';

// XP rewards by challenge type and difficulty
const BASE_XP: Record<ChallengeType, number> = {
  CODE: 80,
  EXPLAIN: 50,
  DEBUG: 70,
  REVIEW: 60,
  DESIGN: 100,
  SCENARIO: 150,
};

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 1.3,
  5: 1.6,
};

export function calculateXP(
  type: ChallengeType,
  difficulty: Difficulty,
  score: number, // 0-100
  isFirstAttempt: boolean,
  hintsUsed: number
): number {
  let xp = BASE_XP[type] * DIFFICULTY_MULTIPLIER[difficulty];

  // Score multiplier (0.5x to 1.5x based on score)
  xp *= 0.5 + (score / 100);

  // Perfect score bonus
  if (score === 100) xp *= 1.5;

  // First attempt bonus
  if (isFirstAttempt) xp *= 1.3;

  // Hint penalty
  xp *= Math.max(0.5, 1 - hintsUsed * 0.15);

  return Math.round(xp);
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Apprentice Developer', minXp: 0, maxXp: 200 },
  { level: 2, title: 'Junior Developer', minXp: 200, maxXp: 500 },
  { level: 3, title: 'Junior Developer II', minXp: 500, maxXp: 900 },
  { level: 4, title: 'Mid Developer', minXp: 900, maxXp: 1500 },
  { level: 5, title: 'Mid Developer II', minXp: 1500, maxXp: 2300 },
  { level: 6, title: 'Senior Developer', minXp: 2300, maxXp: 3500 },
  { level: 7, title: 'Senior Developer II', minXp: 3500, maxXp: 5000 },
  { level: 8, title: 'Staff Engineer', minXp: 5000, maxXp: 7000 },
  { level: 9, title: 'Senior Staff Engineer', minXp: 7000, maxXp: 10000 },
  { level: 10, title: 'Principal Engineer', minXp: 10000, maxXp: 14000 },
  { level: 11, title: 'Distinguished Engineer', minXp: 14000, maxXp: 20000 },
  { level: 12, title: 'Fellow Engineer', minXp: 20000, maxXp: Infinity },
];

export function getLevelFromXP(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const current = xp - level.minXp;
  const needed = level.maxXp - level.minXp;
  const percentage = needed === Infinity ? 100 : Math.round((current / needed) * 100);
  return { current, needed: needed === Infinity ? current : needed, percentage };
}

export const STREAK_BONUS = 25;
