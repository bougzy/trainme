'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, CheckCircle2, Code } from 'lucide-react';
import { useChallengeStore } from '@/lib/stores/useStore';
import { CATEGORIES } from '@/lib/utils/categories';
import type { Category, ChallengeType, Difficulty } from '@/lib/types';

const typeColors: Record<string, string> = {
  CODE: 'text-blue-400',
  EXPLAIN: 'text-purple-400',
  DEBUG: 'text-red-400',
  REVIEW: 'text-yellow-400',
  DESIGN: 'text-emerald-400',
  SCENARIO: 'text-orange-400',
};

const categoryColors: Record<string, string> = {
  frontend: 'bg-blue-500/20 text-blue-400',
  backend: 'bg-emerald-500/20 text-emerald-400',
  fullstack: 'bg-purple-500/20 text-purple-400',
  algorithms: 'bg-yellow-500/20 text-yellow-400',
  behavioral: 'bg-red-500/20 text-red-400',
};

export default function ChallengeBrowserPage() {
  const { challenges, progressMap } = useChallengeStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ChallengeType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'completed'>('all');

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (statusFilter !== 'all') {
        const p = progressMap[c.id];
        if (statusFilter === 'not_started' && p && p.status !== 'not_started') return false;
        if (statusFilter === 'completed' && (!p || (p.status !== 'completed' && p.status !== 'mastered'))) return false;
      }
      return true;
    });
  }, [challenges, search, categoryFilter, typeFilter, statusFilter, progressMap]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Practice Challenges</h1>
        <p className="text-gray-400 text-sm mt-1">{challenges.length} challenges across all categories</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search challenges..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as Category | 'all')}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ChallengeType | 'all')}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="CODE">Code</option>
          <option value="EXPLAIN">Explain</option>
          <option value="DEBUG">Debug</option>
          <option value="REVIEW">Review</option>
          <option value="DESIGN">Design</option>
          <option value="SCENARIO">Scenario</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'not_started' | 'completed')}
          className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">{filtered.length} challenges found</p>

      {/* Challenge List */}
      <div className="space-y-2">
        {filtered.map((challenge, i) => {
          const progress = progressMap[challenge.id];
          const isCompleted = progress && (progress.status === 'completed' || progress.status === 'mastered');
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Link href={`/challenge/${challenge.id}`}>
                <div className="flex items-center gap-4 bg-gray-900/50 border border-gray-800/50 rounded-xl px-5 py-4 hover:bg-gray-900 hover:border-gray-700 transition-all group">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Code className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[challenge.category]}`}>
                        {challenge.category}
                      </span>
                      <span className={`text-xs font-medium ${typeColors[challenge.type]}`}>{challenge.type}</span>
                      <span className="text-xs text-gray-600">{challenge.subcategory}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(d => (
                        <span key={d} className={`w-1.5 h-1.5 rounded-full ${d <= challenge.difficulty ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                      ))}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{challenge.estimatedMinutes}m
                    </span>
                    {progress?.bestScore ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        progress.bestScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        progress.bestScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{progress.bestScore}%</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No challenges match your filters</p>
        </div>
      )}
    </div>
  );
}
