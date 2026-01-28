// ============================================
// TrainMe - Core Type Definitions
// ============================================

export type ChallengeType = 'CODE' | 'EXPLAIN' | 'DEBUG' | 'REVIEW' | 'DESIGN' | 'SCENARIO';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export type Category =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'algorithms'
  | 'behavioral';

export type InterviewType = 'frontend' | 'backend' | 'fullstack' | 'algorithms' | 'behavioral' | 'mixed';

export type SessionMode = 'learn' | 'practice' | 'interview' | 'review';

// ============================================
// Challenge
// ============================================
export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface ReviewIssue {
  id: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  line?: number;
}

export interface ScenarioPart {
  id: string;
  prompt: string;
  type: 'code' | 'explain' | 'choice';
  starterCode?: string;
  choices?: string[];
  solution: string;
  solutionExplanation: string;
}

// ============================================
// Walkthrough / Interactive Explanation
// ============================================
export interface WalkthroughStep {
  title: string;
  lines: [number, number];
  what: string;
  why: string;
  when: string;
  how: string;
}

export interface ConceptSection {
  title: string;
  keyTakeaway: string;
  explanation: string;
  relatedPatterns: string[];
}

export interface Challenge {
  id: string;
  category: Category;
  subcategory: string;
  title: string;
  difficulty: Difficulty;
  type: ChallengeType;
  description: string;
  scenario?: string;
  starterCode?: string;
  solution: string;
  solutionExplanation: string;
  hints: string[];
  testCases?: TestCase[];
  reviewIssues?: ReviewIssue[];
  scenarioParts?: ScenarioPart[];
  tags: string[];
  estimatedMinutes: number;
  walkthrough?: WalkthroughStep[];
  conceptSections?: ConceptSection[];
}

// ============================================
// User Progress
// ============================================
export interface Progress {
  id?: number;
  challengeId: string;
  status: ChallengeStatus;
  attempts: number;
  bestScore: number;
  lastAttempted: Date | null;
  userAnswer: string;
  userCode: string;
  nextReviewDate: Date | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

// ============================================
// User Profile
// ============================================
export interface UserProfile {
  id?: number;
  name: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string
  totalChallengesCompleted: number;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  dailyChallengeCount: number;
  showHints: boolean;
  timerEnabled: boolean;
  soundEnabled: boolean;
  aiProvider: 'openai' | 'anthropic' | null;
  openaiApiKey: string;
  anthropicApiKey: string;
}

// ============================================
// Custom / AI-Generated Challenges
// ============================================
export interface CustomChallenge extends Challenge {
  createdAt: Date;
  source: 'ai-generated' | 'user-created';
  aiModel?: string;
}

// ============================================
// Achievements
// ============================================
export interface Achievement {
  id?: number;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  category: 'progress' | 'streak' | 'mastery' | 'speed' | 'exploration';
}

// ============================================
// Sessions
// ============================================
export interface Session {
  id?: number;
  type: SessionMode;
  startedAt: Date;
  endedAt: Date | null;
  challengeIds: string[];
  xpEarned: number;
  mode: InterviewType | null;
  score?: number;
}

// ============================================
// Notes
// ============================================
export interface Note {
  id?: number;
  challengeId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// UI / Computed Types
// ============================================
export interface CategoryInfo {
  id: Category;
  label: string;
  description: string;
  icon: string;
  color: string;
  subcategories: SubcategoryInfo[];
}

export interface SubcategoryInfo {
  id: string;
  label: string;
  challengeCount: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}

export interface DailyChallenge {
  challenge: Challenge;
  isCompleted: boolean;
}

export interface SkillBreakdown {
  category: Category;
  label: string;
  completed: number;
  total: number;
  mastered: number;
  percentage: number;
}

export interface ReviewQueueItem {
  challenge: Challenge;
  progress: Progress;
  dueDate: Date;
  priority: number;
}
