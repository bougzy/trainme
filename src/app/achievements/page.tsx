'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Rocket, Flame, Crown, Zap, Star, Target,
  Brain, Lightbulb, Timer, Compass, Layers, Monitor,
  Server, Binary, Briefcase, Award, Medal, Moon,
  Lock,
} from 'lucide-react';
import { db } from '@/lib/db';
import type { Achievement } from '@/lib/types';

const iconMap: Record<string, React.ElementType> = {
  rocket: Rocket,
  flame: Flame,
  trophy: Trophy,
  crown: Crown,
  zap: Zap,
  star: Star,
  target: Target,
  brain: Brain,
  lightbulb: Lightbulb,
  timer: Timer,
  compass: Compass,
  layers: Layers,
  monitor: Monitor,
  server: Server,
  binary: Binary,
  briefcase: Briefcase,
  award: Award,
  medal: Medal,
  moon: Moon,
};

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  progress: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  streak: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  mastery: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  speed: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  exploration: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

const categoryLabels: Record<string, string> = {
  progress: 'Progress',
  streak: 'Streaks',
  mastery: 'Mastery',
  speed: 'Speed',
  exploration: 'Exploration',
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    db.achievements.toArray().then(setAchievements);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const totalCount = achievements.length;

  const filtered = filter === 'all'
    ? achievements
    : achievements.filter(a => a.category === filter);

  const categories = ['all', 'progress', 'streak', 'mastery', 'speed', 'exploration'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Achievements</h1>
        <p className="text-gray-400 text-sm mt-1">
          {unlockedCount} of {totalCount} unlocked
        </p>
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{unlockedCount}/{totalCount}</p>
            <p className="text-sm text-gray-400">Achievements Unlocked</p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((achievement, i) => {
          const isUnlocked = achievement.unlockedAt !== null;
          const Icon = iconMap[achievement.icon] ?? Trophy;
          const colors = categoryColors[achievement.category] ?? categoryColors.progress;

          return (
            <motion.div
              key={achievement.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
              className={`relative rounded-xl border p-5 transition-all ${
                isUnlocked
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-gray-900/50 border-gray-800 opacity-50'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isUnlocked ? colors.bg : 'bg-gray-800'
                }`}>
                  {isUnlocked ? (
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-[10px] text-gray-500 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No achievements in this category</p>
        </div>
      )}
    </div>
  );
}
