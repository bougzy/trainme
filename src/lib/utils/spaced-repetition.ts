// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo 2 algorithm by Piotr Wozniak

export interface SM2Result {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReviewDate: Date;
}

/**
 * Calculate the next review schedule using SM-2 algorithm
 * @param quality - Self-rated quality of response (0-5)
 *   0: Complete blackout
 *   1: Incorrect, but recognized correct answer
 *   2: Incorrect, but correct answer seemed easy to recall
 *   3: Correct with serious difficulty
 *   4: Correct with some hesitation
 *   5: Perfect response
 * @param currentEaseFactor - Current ease factor (default 2.5)
 * @param currentInterval - Current interval in days
 * @param currentRepetitions - Number of successful repetitions
 */
export function calculateSM2(
  quality: number,
  currentEaseFactor: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): SM2Result {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let easeFactor = currentEaseFactor;
  let interval: number;
  let repetitions: number;

  if (q < 3) {
    // Failed - reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    // Passed - increase interval
    repetitions = currentRepetitions + 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Convert a score (0-100) to SM-2 quality rating (0-5)
 */
export function scoreToQuality(score: number): number {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

/**
 * Check if a challenge is due for review
 */
export function isDueForReview(nextReviewDate: Date | null): boolean {
  if (!nextReviewDate) return false;
  return new Date() >= new Date(nextReviewDate);
}

/**
 * Get review priority (lower = more urgent)
 */
export function getReviewPriority(nextReviewDate: Date): number {
  const now = new Date();
  const diff = new Date(nextReviewDate).getTime() - now.getTime();
  return diff; // Negative means overdue (highest priority)
}
