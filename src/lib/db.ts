import Dexie, { type Table } from 'dexie';
import type { Progress, UserProfile, Achievement, Session, Note, CustomChallenge } from './types';

export class TrainMeDB extends Dexie {
  progress!: Table<Progress, number>;
  userProfile!: Table<UserProfile, number>;
  achievements!: Table<Achievement, number>;
  sessions!: Table<Session, number>;
  notes!: Table<Note, number>;
  customChallenges!: Table<CustomChallenge, number>;

  constructor() {
    super('trainme');
    this.version(1).stores({
      progress: '++id, challengeId, status, nextReviewDate',
      userProfile: '++id',
      achievements: '++id, key, unlockedAt',
      sessions: '++id, type, startedAt',
      notes: '++id, challengeId, createdAt',
    });

    this.version(2).stores({
      progress: '++id, challengeId, status, nextReviewDate',
      userProfile: '++id',
      achievements: '++id, key, unlockedAt',
      sessions: '++id, type, startedAt',
      notes: '++id, challengeId, createdAt',
      customChallenges: '++id, category, subcategory, type, difficulty',
    });
  }
}

export const db = new TrainMeDB();

// Initialize default user profile if none exists
export async function initializeDB() {
  const profileCount = await db.userProfile.count();
  if (profileCount === 0) {
    await db.userProfile.add({
      name: 'Engineer',
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalChallengesCompleted: 0,
      settings: {
        theme: 'dark',
        dailyChallengeCount: 3,
        showHints: true,
        timerEnabled: true,
        soundEnabled: false,
        aiProvider: null,
        openaiApiKey: '',
        anthropicApiKey: '',
      },
    });
  }

  // Initialize achievements if none exist
  const achievementCount = await db.achievements.count();
  if (achievementCount === 0) {
    await db.achievements.bulkAdd(defaultAchievements);
  }
}

const defaultAchievements: Achievement[] = [
  { key: 'first_challenge', title: 'First Steps', description: 'Complete your first challenge', icon: 'rocket', unlockedAt: null, category: 'progress' },
  { key: 'ten_challenges', title: 'Getting Serious', description: 'Complete 10 challenges', icon: 'flame', unlockedAt: null, category: 'progress' },
  { key: 'fifty_challenges', title: 'Dedicated Learner', description: 'Complete 50 challenges', icon: 'trophy', unlockedAt: null, category: 'progress' },
  { key: 'hundred_challenges', title: 'Centurion', description: 'Complete 100 challenges', icon: 'crown', unlockedAt: null, category: 'progress' },
  { key: 'streak_3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: 'zap', unlockedAt: null, category: 'streak' },
  { key: 'streak_7', title: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: 'flame', unlockedAt: null, category: 'streak' },
  { key: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'star', unlockedAt: null, category: 'streak' },
  { key: 'perfect_score', title: 'Perfectionist', description: 'Get a perfect score on any challenge', icon: 'target', unlockedAt: null, category: 'mastery' },
  { key: 'master_5', title: 'Pattern Recognition', description: 'Master 5 challenges', icon: 'brain', unlockedAt: null, category: 'mastery' },
  { key: 'master_20', title: 'Deep Understanding', description: 'Master 20 challenges', icon: 'lightbulb', unlockedAt: null, category: 'mastery' },
  { key: 'speed_demon', title: 'Speed Demon', description: 'Complete a challenge in under 2 minutes', icon: 'timer', unlockedAt: null, category: 'speed' },
  { key: 'all_categories', title: 'Renaissance Engineer', description: 'Complete at least 1 challenge in every category', icon: 'compass', unlockedAt: null, category: 'exploration' },
  { key: 'all_types', title: 'Jack of All Trades', description: 'Complete every challenge type', icon: 'layers', unlockedAt: null, category: 'exploration' },
  { key: 'frontend_10', title: 'Frontend Specialist', description: 'Complete 10 frontend challenges', icon: 'monitor', unlockedAt: null, category: 'mastery' },
  { key: 'backend_10', title: 'Backend Specialist', description: 'Complete 10 backend challenges', icon: 'server', unlockedAt: null, category: 'mastery' },
  { key: 'algo_10', title: 'Algorithm Ace', description: 'Complete 10 algorithm challenges', icon: 'binary', unlockedAt: null, category: 'mastery' },
  { key: 'interview_complete', title: 'Interview Ready', description: 'Complete a full mock interview session', icon: 'briefcase', unlockedAt: null, category: 'progress' },
  { key: 'level_5', title: 'Senior Developer', description: 'Reach level 5 (Senior Developer)', icon: 'award', unlockedAt: null, category: 'progress' },
  { key: 'level_10', title: 'Staff Engineer', description: 'Reach level 10 (Staff Engineer)', icon: 'medal', unlockedAt: null, category: 'progress' },
  { key: 'night_owl', title: 'Night Owl', description: 'Complete a challenge after midnight', icon: 'moon', unlockedAt: null, category: 'exploration' },
];
