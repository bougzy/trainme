'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Monitor, Server, Network, Binary, MessageSquare, ArrowRight } from 'lucide-react';
import { useChallengeStore } from '@/lib/stores/useStore';
import { CATEGORIES } from '@/lib/utils/categories';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Server, Network, Binary, MessageSquare,
};

export default function LearnPage() {
  const { getCompletionStats } = useChallengeStore();
  const stats = getCompletionStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
        <p className="text-gray-400 text-sm mt-1">Choose a skill area to start mastering</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat, i) => {
          const catStats = stats.byCategory[cat.id] ?? { completed: 0, total: 0 };
          const percentage = catStats.total > 0 ? Math.round((catStats.completed / catStats.total) * 100) : 0;
          const Icon = iconMap[cat.icon] ?? Monitor;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/learn/${cat.id}`}>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                      <Icon className="w-6 h-6" style={{ color: cat.color }} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-1">{cat.label}</h2>
                  <p className="text-sm text-gray-400 mb-4">{cat.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{catStats.completed}/{catStats.total}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cat.subcategories.slice(0, 4).map(sub => (
                      <span key={sub.id} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{sub.label}</span>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full">+{cat.subcategories.length - 4} more</span>
                    )}
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
