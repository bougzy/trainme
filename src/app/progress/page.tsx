'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Target, Crown, Flame, Trophy, Clock,
  CheckCircle2, ArrowRight, Calendar, Zap, TrendingUp,
  Monitor, Server, Network, Binary, MessageSquare
} from 'lucide-react';
import { useUserStore, useChallengeStore } from '@/lib/stores/useStore';
import { getLevelFromXP, getXPProgress, LEVELS } from '@/lib/utils/xp';
import { CATEGORIES } from '@/lib/utils/categories';
import type { Challenge } from '@/lib/types';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Server, Network, Binary, MessageSquare,
};

export default function ProgressPage() {
  const { profile } = useUserStore();
  const { challenges, progressMap, getCompletionStats, getReviewQueue } = useChallengeStore();
  const stats = getCompletionStats();
  const levelInfo = profile ? getLevelFromXP(profile.xp) : null;
  const xpProgress = profile ? getXPProgress(profile.xp) : null;

  const [reviewQueue, setReviewQueue] = useState<{ challengeId: string }[]>([]);

  useEffect(() => {
    getReviewQueue().then(setReviewQueue);
  }, [getReviewQueue]);

  const overallPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Last 7 days activity
  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasActivity = Object.values(progressMap).some(p => {
        if (!p.lastAttempted) return false;
        return new Date(p.lastAttempted).toISOString().split('T')[0] === dateStr;
      });
      days.push({
        date: dateStr,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        active: hasActivity || dateStr === profile?.lastActiveDate,
      });
    }
    return days;
  }, [progressMap, profile]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Your Progress</h1>
        <p className="text-gray-400 text-sm mt-1">Track your growth across all skill areas</p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: `${stats.completed}/${stats.total}`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Completion', value: `${overallPercentage}%`, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Mastered', value: stats.mastered, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Level', value: levelInfo?.level ?? 1, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10', subtitle: levelInfo?.title },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className={`p-2 rounded-lg ${item.bg} w-fit mb-3`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
            {item.subtitle && <p className="text-xs text-gray-600 mt-0.5">{item.subtitle}</p>}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Category breakdown + Level roadmap */}
        <div className="lg:col-span-2 space-y-8">
          {/* Skill Breakdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5">Skill Breakdown</h2>
            <div className="space-y-4">
              {CATEGORIES.map((cat, i) => {
                const catStats = stats.byCategory[cat.id] ?? { completed: 0, total: 0 };
                const pct = catStats.total > 0 ? Math.round((catStats.completed / catStats.total) * 100) : 0;
                const Icon = iconMap[cat.icon] ?? Monitor;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      <span className="text-sm font-medium text-gray-300 flex-1">{cat.label}</span>
                      <span className="text-xs text-gray-500">{catStats.completed}/{catStats.total}</span>
                      <span className="text-xs font-medium w-10 text-right" style={{ color: cat.color }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Level Roadmap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5">Level Roadmap</h2>
            <div className="space-y-2">
              {LEVELS.slice(0, 10).map((lvl, i) => {
                const isUnlocked = profile ? profile.xp >= lvl.minXp : false;
                const isCurrent = levelInfo?.level === lvl.level;
                return (
                  <motion.div
                    key={lvl.level}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isCurrent ? 'bg-blue-600/10 border border-blue-500/30' :
                      isUnlocked ? 'bg-gray-800/30' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent ? 'bg-blue-600 text-white' :
                      isUnlocked ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-600'
                    }`}>
                      {lvl.level}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-blue-400' : isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                        {lvl.title}
                      </p>
                      <p className="text-xs text-gray-600">{lvl.minXp.toLocaleString()} XP</p>
                    </div>
                    {isCurrent && xpProgress && (
                      <span className="text-xs text-blue-400">{xpProgress.percentage}%</span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column - Streak + Review Queue */}
        <div className="space-y-6">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Study Streak</h2>
            </div>
            <div className="flex gap-6 mb-5">
              <div>
                <p className="text-3xl font-bold text-orange-400">{profile?.currentStreak ?? 0}</p>
                <p className="text-xs text-gray-500">Current</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-400">{profile?.longestStreak ?? 0}</p>
                <p className="text-xs text-gray-500">Best</p>
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              {last7Days.map(day => (
                <div key={day.date} className="flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    day.active ? 'bg-emerald-500/20' : 'bg-gray-800'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${day.active ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                  </div>
                  <span className="text-[10px] text-gray-500">{day.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">XP Progress</h2>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{profile?.xp?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-gray-500 mb-3">Total XP earned</p>
            {xpProgress && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>To next level</span>
                  <span>{xpProgress.current}/{xpProgress.needed}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Review Queue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Review Queue</h2>
            </div>
            {reviewQueue.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up! No reviews due.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reviewQueue.slice(0, 5).map(item => {
                  const challenge = challenges.find((c: Challenge) => c.id === item.challengeId);
                  if (!challenge) return null;
                  return (
                    <Link key={item.challengeId} href={`/challenge/${challenge.id}`}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-sm text-gray-300 truncate flex-1">{challenge.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    </Link>
                  );
                })}
                {reviewQueue.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">+{reviewQueue.length - 5} more due</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
