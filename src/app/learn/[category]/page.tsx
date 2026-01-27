'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, Code, ChevronRight } from 'lucide-react';
import { useChallengeStore } from '@/lib/stores/useStore';
import { getCategoryById } from '@/lib/utils/categories';
import { getChallengesBySubcategory } from '@/lib/data';
import type { Category } from '@/lib/types';

const typeColors: Record<string, string> = {
  CODE: 'text-blue-400',
  EXPLAIN: 'text-purple-400',
  DEBUG: 'text-red-400',
  REVIEW: 'text-yellow-400',
  DESIGN: 'text-emerald-400',
  SCENARIO: 'text-orange-400',
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);
  const { progressMap } = useChallengeStore();

  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Category not found</p>
        <Link href="/learn" className="text-blue-400 text-sm mt-2 hover:underline">Back to learning paths</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/learn" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Learning Paths
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}15` }}>
            <span className="text-lg" style={{ color: category.color }}>&#9679;</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{category.label}</h1>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div className="space-y-4">
        {category.subcategories.map((sub, i) => {
          const challenges = getChallengesBySubcategory(category.id as Category, sub.id);
          const completed = challenges.filter(c => {
            const p = progressMap[c.id];
            return p && (p.status === 'completed' || p.status === 'mastered');
          }).length;
          const percentage = challenges.length > 0 ? Math.round((completed / challenges.length) * 100) : 0;

          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Subcategory header */}
              <div className="px-5 py-4 border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">{sub.label}</h2>
                  <span className="text-xs text-gray-500">{completed}/{challenges.length} completed</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: category.color }} />
                </div>
              </div>

              {/* Challenges */}
              <div className="divide-y divide-gray-800/30">
                {challenges.map(challenge => {
                  const progress = progressMap[challenge.id];
                  const isDone = progress && (progress.status === 'completed' || progress.status === 'mastered');

                  return (
                    <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                      <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition-colors group">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Code className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">
                            {challenge.title}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${typeColors[challenge.type] ?? 'text-gray-500'}`}>
                          {challenge.type}
                        </span>
                        <span className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(d => (
                            <span key={d} className={`w-1 h-1 rounded-full ${d <= challenge.difficulty ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                          ))}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{challenge.estimatedMinutes}m
                        </span>
                        {progress?.bestScore ? (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            progress.bestScore >= 80 ? 'text-emerald-400' : progress.bestScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{progress.bestScore}%</span>
                        ) : null}
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
