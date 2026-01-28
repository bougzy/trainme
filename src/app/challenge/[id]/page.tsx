'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Zap, Trophy, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getChallengeById, getChallengesBySubcategory } from '@/lib/data';
import { useChallengeStore } from '@/lib/stores/useStore';
import CodeEditor from '@/components/challenge/CodeEditor';
import ExplainEditor from '@/components/challenge/ExplainEditor';
import ReviewEditor from '@/components/challenge/ReviewEditor';
import HintPanel from '@/components/challenge/HintPanel';
import CodeWalkthrough from '@/components/challenge/CodeWalkthrough';
import type { RunResult } from '@/lib/utils/code-runner';

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-500/20 text-blue-400',
  backend: 'bg-emerald-500/20 text-emerald-400',
  fullstack: 'bg-purple-500/20 text-purple-400',
  algorithms: 'bg-yellow-500/20 text-yellow-400',
  behavioral: 'bg-red-500/20 text-red-400',
};

const typeLabels: Record<string, string> = {
  CODE: 'Write Code',
  EXPLAIN: 'Explain',
  DEBUG: 'Debug',
  REVIEW: 'Code Review',
  DESIGN: 'System Design',
  SCENARIO: 'Scenario',
};

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const challenge = getChallengeById(id);
  const { getProgress, submitChallenge } = useChallengeStore();

  const [userCode, setUserCode] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, isCompleted]);

  // Load existing progress
  useEffect(() => {
    if (challenge) {
      const progress = getProgress(challenge.id);
      if (progress) {
        setUserCode(progress.userCode || challenge.starterCode || '');
        setUserAnswer(progress.userAnswer || '');
      } else {
        setUserCode(challenge.starterCode || '');
      }
    }
  }, [challenge, getProgress]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCodeResult = useCallback((result: RunResult) => {
    setScore(result.score);
  }, []);

  const handleSelfRate = useCallback((rating: number) => {
    // Convert 1-5 rating to 0-100 score
    setScore(rating * 20);
  }, []);

  const handleReviewComplete = useCallback((reviewScore: number) => {
    setScore(reviewScore);
  }, []);

  const handleSubmit = async () => {
    if (score === null || !challenge) return;
    const xp = await submitChallenge(challenge.id, score, userAnswer, userCode, hintsUsed);
    setXpEarned(xp);
    setIsCompleted(true);
  };

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-400">Challenge not found</p>
        <Link href="/learn" className="text-blue-400 text-sm mt-2 hover:underline">Browse challenges</Link>
      </div>
    );
  }

  // Find next challenge in same subcategory
  const siblingChallenges = getChallengesBySubcategory(challenge.category, challenge.subcategory);
  const currentIndex = siblingChallenges.findIndex(c => c.id === challenge.id);
  const nextChallenge = currentIndex < siblingChallenges.length - 1 ? siblingChallenges[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[challenge.category] ?? 'bg-gray-700 text-gray-400'}`}>
              {challenge.category}
            </span>
            <span className="text-xs text-gray-500">{challenge.subcategory}</span>
          </div>
          <h1 className="text-xl font-bold text-white">{challenge.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{challenge.estimatedMinutes} min
            </span>
            <span className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(d => (
                <span key={d} className={`w-1.5 h-1.5 rounded-full ${d <= challenge.difficulty ? 'bg-yellow-400' : 'bg-gray-700'}`} />
              ))}
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
              {typeLabels[challenge.type] ?? challenge.type}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono text-gray-400">{formatTime(elapsed)}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">Challenge Brief</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{challenge.description}</p>
        {challenge.scenario && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-sm text-gray-400 leading-relaxed italic">{challenge.scenario}</p>
          </div>
        )}
      </div>

      {/* Hints */}
      <HintPanel hints={challenge.hints} onHintUsed={setHintsUsed} />

      {/* Challenge Editor */}
      {(challenge.type === 'CODE' || challenge.type === 'DEBUG') && (
        <CodeEditor
          initialCode={userCode || challenge.starterCode || '// Write your solution here\n'}
          testCases={challenge.testCases ?? []}
          onChange={setUserCode}
          onRunResult={handleCodeResult}
          showPreview={challenge.tags.some(t => ['html', 'ui', 'css', 'dom'].includes(t))}
        />
      )}

      {(challenge.type === 'EXPLAIN' || challenge.type === 'DESIGN' || challenge.type === 'SCENARIO') && (
        <ExplainEditor
          initialAnswer={userAnswer}
          solution={challenge.solution}
          solutionExplanation={challenge.solutionExplanation}
          conceptSections={challenge.conceptSections}
          onChange={setUserAnswer}
          onSelfRate={handleSelfRate}
        />
      )}

      {challenge.type === 'REVIEW' && (
        <ReviewEditor
          code={challenge.starterCode ?? ''}
          issues={challenge.reviewIssues ?? []}
          onComplete={handleReviewComplete}
        />
      )}

      {/* Submit / Completion */}
      {!isCompleted && score !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Complete Challenge
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-4"
          >
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Challenge Complete!</h2>
            <div className="flex items-center justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-blue-400">+{xpEarned}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-center"><Zap className="w-3 h-3" /> XP Earned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{score}%</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{formatTime(elapsed)}</p>
                <p className="text-xs text-gray-500">Time</p>
              </div>
            </div>

            {/* Show solution for CODE/DEBUG */}
            {(challenge.type === 'CODE' || challenge.type === 'DEBUG') && (
              <div className="text-left">
                {!showSolution ? (
                  <button onClick={() => setShowSolution(true)} className="text-sm text-blue-400 hover:text-blue-300">
                    View Solution
                  </button>
                ) : (
                  <div className="mt-3">
                    <CodeWalkthrough
                      code={challenge.solution}
                      walkthrough={challenge.walkthrough}
                      solutionExplanation={challenge.solutionExplanation}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Link href={`/learn/${challenge.category}`} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
                Back to {challenge.category}
              </Link>
              {nextChallenge && (
                <Link href={`/challenge/${nextChallenge.id}`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                  Next Challenge <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
