'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useChallengeStore } from '@/lib/stores/useStore';
import type { Challenge } from '@/lib/types';

function timeAgo(date: Date | string | null): string {
  if (!date) return 'Never';
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function RecentActivity() {
  const { challenges, progressMap } = useChallengeStore();

  const recentItems = useMemo(() => {
    const withProgress = Object.values(progressMap)
      .filter(p => p.lastAttempted)
      .sort((a, b) => new Date(b.lastAttempted!).getTime() - new Date(a.lastAttempted!).getTime())
      .slice(0, 5);

    return withProgress.map(p => {
      const challenge = challenges.find((c: Challenge) => c.id === p.challengeId);
      return { progress: p, challenge };
    }).filter(item => item.challenge);
  }, [challenges, progressMap]);

  if (recentItems.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No activity yet. Start your first challenge!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {recentItems.map((item, i) => {
          const statusIcon = item.progress.status === 'completed' || item.progress.status === 'mastered'
            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
            : item.progress.status === 'in_progress'
            ? <AlertCircle className="w-4 h-4 text-yellow-400" />
            : <XCircle className="w-4 h-4 text-gray-500" />;

          return (
            <motion.div
              key={item.progress.challengeId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/challenge/${item.challenge!.id}`}>
                <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-3 hover:bg-gray-900 transition-colors">
                  {statusIcon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{item.challenge!.title}</p>
                    <p className="text-xs text-gray-500">{timeAgo(item.progress.lastAttempted)}</p>
                  </div>
                  {item.progress.bestScore > 0 && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.progress.bestScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      item.progress.bestScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.progress.bestScore}%
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
