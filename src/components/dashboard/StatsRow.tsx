'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Flame, Crown } from 'lucide-react';
import { useUserStore, useChallengeStore } from '@/lib/stores/useStore';

export default function StatsRow() {
  const { profile } = useUserStore();
  const { getCompletionStats } = useChallengeStore();
  const stats = getCompletionStats();

  const items = [
    { label: 'Total XP', value: profile?.xp ?? 0, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Day Streak', value: profile?.currentStreak ?? 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Mastered', value: stats.mastered, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{item.value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
