'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useChallengeStore, useUserStore } from '@/lib/stores/useStore';

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-500/20 text-blue-400',
  backend: 'bg-emerald-500/20 text-emerald-400',
  fullstack: 'bg-purple-500/20 text-purple-400',
  algorithms: 'bg-yellow-500/20 text-yellow-400',
  behavioral: 'bg-red-500/20 text-red-400',
};

const typeColors: Record<string, string> = {
  CODE: 'text-blue-400',
  EXPLAIN: 'text-purple-400',
  DEBUG: 'text-red-400',
  REVIEW: 'text-yellow-400',
  DESIGN: 'text-emerald-400',
  SCENARIO: 'text-orange-400',
};

export default function DailyChallenges() {
  const { getDailyChallenges, getProgress } = useChallengeStore();
  const { profile } = useUserStore();

  const dailyChallenges = useMemo(() => {
    return getDailyChallenges(profile?.settings?.dailyChallengeCount ?? 3);
  }, [getDailyChallenges, profile]);

  if (dailyChallenges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center"
      >
        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-400 text-sm">You&apos;ve completed all available challenges. More coming soon!</p>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Today&apos;s Challenges</h2>
        <span className="text-xs text-gray-500">{dailyChallenges.length} challenges</span>
      </div>
      <div className="space-y-3">
        {dailyChallenges.map((challenge, i) => {
          const progress = getProgress(challenge.id);
          const isStarted = progress && progress.status !== 'not_started';
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/challenge/${challenge.id}`}>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[challenge.category] ?? 'bg-gray-700 text-gray-300'}`}>
                          {challenge.category}
                        </span>
                        <span className={`text-xs font-medium ${typeColors[challenge.type] ?? 'text-gray-400'}`}>
                          {challenge.type}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-200 mb-1 truncate">{challenge.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {challenge.estimatedMinutes}m
                        </span>
                        <span className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(d => (
                            <span
                              key={d}
                              className={`w-1.5 h-1.5 rounded-full ${d <= challenge.difficulty ? 'bg-yellow-400' : 'bg-gray-700'}`}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {isStarted && (
                        <span className="text-xs text-emerald-400">In Progress</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
