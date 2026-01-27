'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Trophy, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';
import { useSessionStore, useChallengeStore } from '@/lib/stores/useStore';
import CodeEditor from '@/components/challenge/CodeEditor';
import ExplainEditor from '@/components/challenge/ExplainEditor';
import ReviewEditor from '@/components/challenge/ReviewEditor';
import type { RunResult } from '@/lib/utils/code-runner';

export default function InterviewSessionPage() {
  const router = useRouter();
  const { activeSession, nextChallenge, recordScore, endSession } = useSessionStore();
  const { submitChallenge } = useChallengeStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ totalScore: number; xpEarned: number } | null>(null);
  const [userCode, setUserCode] = useState('');
  const [userAnswer, setUserAnswer] = useState('');

  // Initialize timer
  useEffect(() => {
    if (activeSession?.timeLimit) {
      setTimeLeft(activeSession.timeLimit * 60);
    }
  }, [activeSession?.timeLimit]);

  // Countdown timer
  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCodeResult = useCallback((result: RunResult) => {
    setCurrentScore(result.score);
  }, []);

  const handleSelfRate = useCallback((rating: number) => {
    setCurrentScore(rating * 20);
  }, []);

  const handleReviewComplete = useCallback((score: number) => {
    setCurrentScore(score);
  }, []);

  const handleNext = async () => {
    if (!activeSession) return;
    const challenge = activeSession.challenges[activeSession.currentIndex];

    // Submit the score
    if (currentScore !== null) {
      recordScore(currentScore);
      await submitChallenge(challenge.id, currentScore, userAnswer, userCode, 0);
    }

    // Check if this is the last challenge
    if (activeSession.currentIndex >= activeSession.challenges.length - 1) {
      await handleFinish();
    } else {
      nextChallenge();
      setCurrentScore(null);
      setUserCode('');
      setUserAnswer('');
    }
  };

  const handleFinish = async () => {
    const results = await endSession();
    setSessionResults(results);
    setIsFinished(true);
  };

  // No active session
  if (!activeSession && !isFinished) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No active interview session</p>
        <button onClick={() => router.push('/interview')} className="text-blue-400 text-sm mt-2 hover:underline">
          Start a new interview
        </button>
      </div>
    );
  }

  // Session finished
  if (isFinished && sessionResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Interview Complete!</h1>
          <p className="text-gray-400 text-sm mb-6">Great practice session. Review your results below.</p>

          <div className="flex justify-center gap-8 mb-8">
            <div>
              <p className="text-3xl font-bold text-emerald-400">{sessionResults.totalScore}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">+{sessionResults.xpEarned}</p>
              <p className="text-xs text-gray-500">XP Earned</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/interview')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors">
              New Interview
            </button>
            <button onClick={() => router.push('/progress')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              View Progress
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!activeSession) return null;

  const currentChallenge = activeSession.challenges[activeSession.currentIndex];
  const progress = ((activeSession.currentIndex + 1) / activeSession.challenges.length) * 100;
  const isTimeWarning = timeLeft < 120 && timeLeft > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interview Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">
              Question {activeSession.currentIndex + 1} of {activeSession.challenges.length}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-lg font-mono ${isTimeWarning ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Challenge */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">{currentChallenge.title}</span>
          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full ml-auto">{currentChallenge.type}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{currentChallenge.description}</p>
      </div>

      {/* Editor */}
      {(currentChallenge.type === 'CODE' || currentChallenge.type === 'DEBUG') && (
        <CodeEditor
          initialCode={currentChallenge.starterCode || '// Write your solution\n'}
          testCases={currentChallenge.testCases ?? []}
          onChange={setUserCode}
          onRunResult={handleCodeResult}
        />
      )}

      {(currentChallenge.type === 'EXPLAIN' || currentChallenge.type === 'DESIGN' || currentChallenge.type === 'SCENARIO') && (
        <ExplainEditor
          initialAnswer={userAnswer}
          solution={currentChallenge.solution}
          solutionExplanation={currentChallenge.solutionExplanation}
          onChange={setUserAnswer}
          onSelfRate={handleSelfRate}
        />
      )}

      {currentChallenge.type === 'REVIEW' && (
        <ReviewEditor
          code={currentChallenge.starterCode ?? ''}
          issues={currentChallenge.reviewIssues ?? []}
          onComplete={handleReviewComplete}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleFinish}
          className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          End Interview
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {activeSession.currentIndex >= activeSession.challenges.length - 1 ? 'Finish' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
