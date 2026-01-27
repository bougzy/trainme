import { create } from 'zustand';
import type { Challenge, UserProfile, Progress, Category, ChallengeType } from '../types';
import { db, initializeDB } from '../db';
import { calculateXP } from '../utils/xp';
import { calculateSM2, scoreToQuality } from '../utils/spaced-repetition';
import { getAllChallenges } from '../data';

// ============================================
// User Store
// ============================================
interface UserState {
  profile: UserProfile | null;
  isLoaded: boolean;
  loadProfile: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoaded: false,

  loadProfile: async () => {
    await initializeDB();
    const profiles = await db.userProfile.toArray();
    if (profiles.length > 0) {
      set({ profile: profiles[0], isLoaded: true });
    }
  },

  addXP: async (amount: number) => {
    const { profile } = get();
    if (!profile || !profile.id) return;
    const newXP = profile.xp + amount;
    await db.userProfile.update(profile.id, { xp: newXP });
    set({ profile: { ...profile, xp: newXP } });
  },

  updateStreak: async () => {
    const { profile } = get();
    if (!profile || !profile.id) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.lastActiveDate;

    if (lastActive === today) return; // Already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.currentStreak;
    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1; // Reset streak
    }

    const longestStreak = Math.max(profile.longestStreak, newStreak);

    await db.userProfile.update(profile.id, {
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today,
    });

    set({
      profile: {
        ...profile,
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
      },
    });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { profile } = get();
    if (!profile || !profile.id) return;
    await db.userProfile.update(profile.id, updates);
    set({ profile: { ...profile, ...updates } });
  },
}));

// ============================================
// Challenge Store
// ============================================
interface ChallengeState {
  challenges: Challenge[];
  progressMap: Record<string, Progress>;
  isLoaded: boolean;
  loadChallenges: () => Promise<void>;
  loadProgress: () => Promise<void>;
  getChallengesByCategory: (category: Category) => Challenge[];
  getChallengesBySubcategory: (category: Category, subcategory: string) => Challenge[];
  getProgress: (challengeId: string) => Progress | null;
  submitChallenge: (
    challengeId: string,
    score: number,
    userAnswer: string,
    userCode: string,
    hintsUsed: number
  ) => Promise<number>;
  getReviewQueue: () => Promise<{ challengeId: string; progress: Progress }[]>;
  getDailyChallenges: (count: number) => Challenge[];
  getCompletionStats: () => {
    total: number;
    completed: number;
    mastered: number;
    byCategory: Record<Category, { completed: number; total: number }>;
  };
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  progressMap: {},
  isLoaded: false,

  loadChallenges: async () => {
    const challenges = getAllChallenges();
    set({ challenges, isLoaded: true });
  },

  loadProgress: async () => {
    const allProgress = await db.progress.toArray();
    const map: Record<string, Progress> = {};
    for (const p of allProgress) {
      map[p.challengeId] = p;
    }
    set({ progressMap: map });
  },

  getChallengesByCategory: (category: Category) => {
    return get().challenges.filter(c => c.category === category);
  },

  getChallengesBySubcategory: (category: Category, subcategory: string) => {
    return get().challenges.filter(
      c => c.category === category && c.subcategory === subcategory
    );
  },

  getProgress: (challengeId: string) => {
    return get().progressMap[challengeId] ?? null;
  },

  submitChallenge: async (challengeId, score, userAnswer, userCode, hintsUsed) => {
    const { challenges, progressMap } = get();
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return 0;

    const existing = progressMap[challengeId];
    const isFirstAttempt = !existing || existing.attempts === 0;

    // Calculate XP
    const xp = calculateXP(challenge.type, challenge.difficulty, score, isFirstAttempt, hintsUsed);

    // Calculate spaced repetition
    const quality = scoreToQuality(score);
    const sm2 = calculateSM2(
      quality,
      existing?.easeFactor ?? 2.5,
      existing?.interval ?? 0,
      existing?.repetitions ?? 0
    );

    const newStatus = score >= 95 && (existing?.attempts ?? 0) >= 2 ? 'mastered' as const
      : score >= 60 ? 'completed' as const
      : 'in_progress' as const;

    const progressUpdate: Progress = {
      challengeId,
      status: newStatus,
      attempts: (existing?.attempts ?? 0) + 1,
      bestScore: Math.max(existing?.bestScore ?? 0, score),
      lastAttempted: new Date(),
      userAnswer,
      userCode,
      nextReviewDate: sm2.nextReviewDate,
      easeFactor: sm2.easeFactor,
      interval: sm2.interval,
      repetitions: sm2.repetitions,
    };

    if (existing?.id) {
      await db.progress.update(existing.id, progressUpdate);
      progressUpdate.id = existing.id;
    } else {
      const id = await db.progress.add(progressUpdate);
      progressUpdate.id = id;
    }

    // Update progress map
    set({
      progressMap: { ...progressMap, [challengeId]: progressUpdate },
    });

    // Add XP to user
    const userStore = useUserStore.getState();
    await userStore.addXP(xp);
    await userStore.updateStreak();

    // Update total completed
    if (newStatus === 'completed' || newStatus === 'mastered') {
      if (!existing || existing.status === 'not_started' || existing.status === 'in_progress') {
        const profile = userStore.profile;
        if (profile?.id) {
          await userStore.updateProfile({
            totalChallengesCompleted: profile.totalChallengesCompleted + 1,
          });
        }
      }
    }

    return xp;
  },

  getReviewQueue: async () => {
    const allProgress = await db.progress
      .where('nextReviewDate')
      .belowOrEqual(new Date())
      .toArray();

    return allProgress
      .filter(p => p.nextReviewDate !== null)
      .map(p => ({ challengeId: p.challengeId, progress: p }))
      .sort((a, b) => {
        const aDate = new Date(a.progress.nextReviewDate!).getTime();
        const bDate = new Date(b.progress.nextReviewDate!).getTime();
        return aDate - bDate;
      });
  },

  getDailyChallenges: (count: number) => {
    const { challenges, progressMap } = get();
    // Pick challenges not yet completed, spread across categories
    const incomplete = challenges.filter(c => {
      const p = progressMap[c.id];
      return !p || p.status === 'not_started' || p.status === 'in_progress';
    });

    // Shuffle and take count
    const shuffled = [...incomplete].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getCompletionStats: () => {
    const { challenges, progressMap } = get();
    const total = challenges.length;
    let completed = 0;
    let mastered = 0;
    const byCategory: Record<string, { completed: number; total: number }> = {};

    for (const c of challenges) {
      if (!byCategory[c.category]) {
        byCategory[c.category] = { completed: 0, total: 0 };
      }
      byCategory[c.category].total++;

      const p = progressMap[c.id];
      if (p && (p.status === 'completed' || p.status === 'mastered')) {
        completed++;
        byCategory[c.category].completed++;
      }
      if (p && p.status === 'mastered') {
        mastered++;
      }
    }

    return { total, completed, mastered, byCategory: byCategory as Record<Category, { completed: number; total: number }> };
  },
}));

// ============================================
// Session Store
// ============================================
interface SessionState {
  activeSession: {
    type: ChallengeType | 'mixed';
    category: Category | 'mixed';
    challenges: Challenge[];
    currentIndex: number;
    startedAt: Date;
    scores: number[];
    timeLimit?: number; // minutes
  } | null;
  startSession: (challenges: Challenge[], type: ChallengeType | 'mixed', category: Category | 'mixed', timeLimit?: number) => void;
  nextChallenge: () => void;
  recordScore: (score: number) => void;
  endSession: () => Promise<{ totalScore: number; xpEarned: number }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,

  startSession: (challenges, type, category, timeLimit) => {
    set({
      activeSession: {
        type,
        category,
        challenges,
        currentIndex: 0,
        startedAt: new Date(),
        scores: [],
        timeLimit,
      },
    });
  },

  nextChallenge: () => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({
      activeSession: {
        ...activeSession,
        currentIndex: activeSession.currentIndex + 1,
      },
    });
  },

  recordScore: (score: number) => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({
      activeSession: {
        ...activeSession,
        scores: [...activeSession.scores, score],
      },
    });
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return { totalScore: 0, xpEarned: 0 };

    const totalScore = activeSession.scores.length > 0
      ? Math.round(activeSession.scores.reduce((a, b) => a + b, 0) / activeSession.scores.length)
      : 0;

    // Save session to DB
    await db.sessions.add({
      type: 'interview',
      startedAt: activeSession.startedAt,
      endedAt: new Date(),
      challengeIds: activeSession.challenges.map(c => c.id),
      xpEarned: 0, // Calculated separately per challenge
      mode: activeSession.category === 'mixed' ? 'mixed' : activeSession.category,
      score: totalScore,
    });

    set({ activeSession: null });
    return { totalScore, xpEarned: 0 };
  },
}));
