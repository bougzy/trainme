# TrainMe - Senior Engineer Interview Preparation Platform

## Architecture & Implementation Plan

---

## STORAGE DECISION: IndexedDB via Dexie.js

**Why not localStorage:**
- 5-10MB limit, string-only storage, no indexing, no queries
- Will fail with hundreds of challenges + code snippets + progress data

**Why not Firebase:**
- Requires internet, auth setup, costs money at scale
- Overkill for a personal offline-first training tool
- Can be added later as optional sync layer

**Why IndexedDB (Dexie.js):**
- Hundreds of MB storage capacity
- Structured data with indexes and queries
- Fully offline, persists until explicitly cleared
- Dexie.js provides clean Promise-based API over raw IndexedDB
- Supports versioned schema migrations

---

## TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4+ |
| Local DB | Dexie.js (IndexedDB) |
| State | Zustand (lightweight client state) |
| Code Editor | @monaco-editor/react |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## WHAT MAKES THIS NOT A QUIZ APP

1. **Scenario-Driven Missions** - Not "What is X?" but "You're debugging X in production. Here's the code. Fix it and explain why."
2. **Six Distinct Modes** - CODE, EXPLAIN, DEBUG, REVIEW, DESIGN, SCENARIO
3. **Interactive Code Editor** - Write and validate real code with test cases
4. **Spaced Repetition Engine** - SM-2 algorithm schedules reviews based on performance
5. **XP Progression System** - Levels, streaks, achievements that reward depth
6. **Structured Feedback** - Model answers revealed after your attempt with detailed explanations
7. **Mock Interview Simulator** - Timed pressure sessions that simulate real interviews
8. **Difficulty Scaling** - Challenges adapt based on your performance history

---

## DATABASE SCHEMA (IndexedDB Tables)

```
userProfile:
  id mod, name, xp, level, streak, currentStreak, longestStreak,
  lastActiveDate, totalChallengesCompleted, settings

challenges:
  id, category, subcategory, title, difficulty (1-5),
  type (CODE|EXPLAIN|DEBUG|REVIEW|DESIGN|SCENARIO),
  description, scenario, starterCode, solution, solutionExplanation,
  hints[], testCases[], tags[], estimatedMinutes

progress:
  id mod, challengeId, status (not_started|in_progress|completed|mastered),
  attempts, bestScore, lastAttempted, userAnswer, userCode,
  nextReviewDate, easeFactor, interval, repetitions

achievements:
  id, key, title, description, icon, unlockedAt, category

sessions:
  id mod, type (learn|practice|interview|review),
  startedAt, endedAt, challengeIds[], xpEarned, mode

notes:
  id mod, challengeId, content, createdAt, updatedAt
```

---

## CATEGORIES & CONTENT MAP

### 1. Frontend (React / Next.js / TypeScript)
- Component Architecture (8 challenges)
- React Internals & Rendering (8 challenges)
- State Management (6 challenges)
- Performance Optimization (6 challenges)
- Accessibility (4 challenges)
- Testing Strategies (4 challenges)

### 2. Backend (Node.js / Express / TypeScript)
- API Design & REST (8 challenges)
- Architecture Patterns (6 challenges)
- Authentication & Security (6 challenges)
- Data Modeling & Storage (6 challenges)
- Scalability & Reliability (6 challenges)
- Observability (4 challenges)

### 3. Fullstack & System Design
- Authentication Flows (4 challenges)
- Real-time Systems (4 challenges)
- File Upload Systems (3 challenges)
- Notification Systems (3 challenges)
- System Design Exercises (6 challenges)

### 4. Algorithms & Data Structures
- Two Pointers (4 challenges)
- Sliding Window (4 challenges)
- Hash Map Patterns (4 challenges)
- Stack & Queue (4 challenges)
- Tree Traversal (4 challenges)
- Dynamic Programming Intro (4 challenges)

### 5. Behavioral & Communication
- STAR Method Scenarios (6 challenges)
- Technical Explanation Practice (6 challenges)
- Trade-off Discussions (4 challenges)

**Total seed content: ~140 challenges**

---

## CHALLENGE TYPES EXPLAINED

### CODE
- Full Monaco editor with starter code
- Write implementation, run against test cases
- Hints available (cost XP penalty)
- Solution + explanation revealed after attempt

### EXPLAIN
- Prompt asks you to explain a concept/decision
- You type your explanation in a rich text area
- Model answer revealed for self-comparison
- Self-rate your answer (1-5) which feeds into spaced repetition

### DEBUG
- Buggy code presented in editor
- Find and fix the issue(s)
- Validated against test cases
- Explanation of what was wrong and why

### REVIEW
- Code snippet presented (read-only)
- Identify issues: bugs, performance, security, maintainability
- Checklist of issues to find
- Score based on how many you catch

### DESIGN
- System design prompt with constraints
- Structured response form: components, data flow, trade-offs, scaling
- Model answer for comparison
- Self-rate for spaced repetition

### SCENARIO
- Multi-part real-world scenario
- Combines coding + explanation + decision-making
- Progressive difficulty within the scenario
- Most XP rewarding type

---

## XP & PROGRESSION SYSTEM

| Action | XP |
|--------|-----|
| Complete CODE challenge | 50-150 (by difficulty) |
| Complete EXPLAIN challenge | 30-80 |
| Complete DEBUG challenge | 40-120 |
| Complete REVIEW challenge | 40-100 |
| Complete DESIGN challenge | 60-150 |
| Complete SCENARIO | 100-250 |
| Daily streak bonus | 25 per day |
| Perfect score | 2x multiplier |
| First attempt success | 1.5x multiplier |
| Use hint | -20% XP |

**Levels:** XP thresholds with titles
- 0-500: Junior Developer
- 500-1500: Mid Developer
- 1500-3500: Senior Developer
- 3500-7000: Staff Engineer
- 7000-12000: Principal Engineer
- 12000+: Distinguished Engineer

---

## SPACED REPETITION (SM-2 Algorithm)

After each challenge, rate difficulty 0-5:
- 0-2: Reset interval to 1 day (need more practice)
- 3: Repeat at same interval
- 4-5: Increase interval by ease factor

Default ease factor: 2.5
Minimum interval: 1 day
Review queue surfaces on dashboard daily

---

## APP STRUCTURE

```
/app
  layout.tsx              - Root layout with sidebar nav
  page.tsx                - Dashboard (progress overview, daily challenges, streaks)
  /learn
    page.tsx              - Category browser
    /[category]
      page.tsx            - Subcategory list with progress
      /[topic]
        page.tsx          - Topic challenges list
  /challenge
    /[id]
      page.tsx            - Challenge workspace (editor, prompt, hints, solution)
  /interview
    page.tsx              - Interview mode selector
    /[type]
      page.tsx            - Timed mock interview session
  /progress
    page.tsx              - Analytics, skill radar, weak areas, review queue
  /achievements
    page.tsx              - Achievement gallery
  /settings
    page.tsx              - App settings, data export/import

/components
  /ui                     - Base UI components (Button, Card, Badge, Modal, etc.)
  /layout                 - Sidebar, Header, Navigation
  /dashboard              - Dashboard widgets (StreakCard, XPBar, DailyChallenge, etc.)
  /challenge              - ChallengeCard, CodeEditor, ExplainEditor, ReviewChecklist, etc.
  /interview              - Timer, QuestionFlow, FeedbackPanel
  /progress               - SkillRadar, ProgressChart, ReviewQueue

/lib
  db.ts                   - Dexie database initialization and schema
  /stores                 - Zustand stores (user, challenge, session)
  /hooks                  - Custom React hooks
  /utils                  - Helpers (XP calculation, spaced repetition, etc.)
  /data                   - Seed challenge data files
  /types                  - TypeScript type definitions

/public
  /icons                  - Achievement icons, category icons
```

---

## BUILD PHASES

### Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript, Tailwind, ESLint
- [ ] Install dependencies (dexie, zustand, framer-motion, lucide-react, @monaco-editor/react)
- [ ] Set up Dexie database with full schema
- [ ] Create TypeScript type definitions
- [ ] Build base UI component library (Button, Card, Badge, Modal, Progress)
- [ ] Create app layout with sidebar navigation
- [ ] Build dashboard skeleton

### Phase 2: Data & State Layer
- [ ] Create Zustand stores (user profile, active challenge, session)
- [ ] Implement XP calculation and leveling utilities
- [ ] Implement spaced repetition (SM-2) utility
- [ ] Create seed data for all 140+ challenges
- [ ] Build data access hooks (useChallenge, useProgress, useUser, etc.)
- [ ] Implement achievement definitions and unlock logic

### Phase 3: Core Challenge System
- [ ] Build challenge workspace layout
- [ ] Integrate Monaco Editor for CODE/DEBUG challenges
- [ ] Build explain mode with rich text input + model answer reveal
- [ ] Build review mode with issue checklist
- [ ] Build design mode with structured response form
- [ ] Build scenario mode with multi-part progression
- [ ] Implement hint system
- [ ] Implement scoring and XP award flow
- [ ] Build solution reveal with detailed explanations

### Phase 4: Learning Paths & Navigation
- [ ] Build category browser page
- [ ] Build topic listing with progress indicators
- [ ] Implement challenge filtering and sorting
- [ ] Build breadcrumb navigation
- [ ] Implement "next challenge" flow

### Phase 5: Mock Interview Simulator
- [ ] Build interview mode selector (Frontend, Backend, Fullstack, Algo, Behavioral)
- [ ] Implement timed session with countdown
- [ ] Build question flow (random selection by category + difficulty)
- [ ] Build session summary with scoring
- [ ] Save interview session history

### Phase 6: Dashboard & Progress
- [ ] Build full dashboard with widgets
- [ ] Implement streak tracking and display
- [ ] Build daily challenge selector
- [ ] Build spaced repetition review queue
- [ ] Build progress analytics (completion %, skill breakdown)
- [ ] Build skill radar chart
- [ ] Implement weak area detection

### Phase 7: Achievements & Polish
- [ ] Implement all achievement triggers
- [ ] Build achievement gallery with unlock animations
- [ ] Add Framer Motion transitions throughout
- [ ] Add keyboard shortcuts
- [ ] Implement data export/import (JSON)
- [ ] Responsive design pass
- [ ] Final testing and bug fixes

---

## KEY DESIGN DECISIONS

1. **Client-only rendering** for all interactive pages (IndexedDB is browser-only)
2. **Monaco Editor** loaded dynamically to avoid SSR issues
3. **Code validation** uses Function constructor with try/catch for simple test cases (no server needed)
4. **Self-rating** for EXPLAIN/DESIGN types feeds into spaced repetition since we can't auto-grade prose
5. **Seed data** stored as TypeScript files, loaded into IndexedDB on first visit
6. **Zustand** over Context to avoid re-render cascades on frequent state updates
7. **All data stays local** - no API calls, no auth, fully offline-capable

---

## ESTIMATED SCOPE

This is a substantial application. The build covers:
- ~25 components
- ~15 pages/routes
- ~140 seed challenges with full content
- Database layer with 6 tables
- XP/leveling/achievement systems
- Spaced repetition engine
- Code editor integration
- Interview simulation mode

The app will be fully functional and immediately usable for interview preparation upon completion.
