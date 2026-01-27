'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, Server, Network, Binary, MessageSquare } from 'lucide-react';
import { useChallengeStore } from '@/lib/stores/useStore';
import { CATEGORIES } from '@/lib/utils/categories';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Server, Network, Binary, MessageSquare,
};

export default function CategoryProgress() {
  const { getCompletionStats } = useChallengeStore();
  const stats = getCompletionStats();

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Skill Areas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat, i) => {
          const catStats = stats.byCategory[cat.id] ?? { completed: 0, total: 0 };
          const percentage = catStats.total > 0 ? Math.round((catStats.completed / catStats.total) * 100) : 0;
          const Icon = iconMap[cat.icon] ?? Monitor;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Link href={`/learn/${cat.id}`}>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{cat.label}</h3>
                      <p className="text-xs text-gray-500">{catStats.completed}/{catStats.total} completed</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{percentage}%</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
