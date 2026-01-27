'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Monitor, Server, Layers, Binary, MessageSquare, Shuffle, Clock, Zap, ArrowRight } from 'lucide-react';
import { useChallengeStore, useSessionStore } from '@/lib/stores/useStore';
import type { Category } from '@/lib/types';

const interviewTypes = [
  {
    id: 'frontend',
    title: 'Frontend Interview',
    description: 'React, TypeScript, component design, state management, and performance',
    icon: Monitor,
    color: '#3B82F6',
    category: 'frontend' as Category,
    count: 5,
    timeLimit: 30,
  },
  {
    id: 'backend',
    title: 'Backend Interview',
    description: 'Node.js, Express, API design, architecture, auth, and scalability',
    icon: Server,
    color: '#10B981',
    category: 'backend' as Category,
    count: 5,
    timeLimit: 30,
  },
  {
    id: 'fullstack',
    title: 'Fullstack Interview',
    description: 'End-to-end system design, frontend + backend integration',
    icon: Layers,
    color: '#8B5CF6',
    category: 'mixed' as unknown as Category,
    count: 7,
    timeLimit: 45,
  },
  {
    id: 'algorithms',
    title: 'Algorithm Sprint',
    description: 'Data structures, patterns, and problem solving under pressure',
    icon: Binary,
    color: '#F59E0B',
    category: 'algorithms' as Category,
    count: 4,
    timeLimit: 25,
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    description: 'STAR method, technical communication, and trade-off discussions',
    icon: MessageSquare,
    color: '#EF4444',
    category: 'behavioral' as Category,
    count: 4,
    timeLimit: 20,
  },
];

export default function InterviewPage() {
  const router = useRouter();
  const { challenges } = useChallengeStore();
  const { startSession } = useSessionStore();

  const handleStart = (type: typeof interviewTypes[number]) => {
    let pool = type.category === ('mixed' as unknown as Category)
      ? [...challenges]
      : challenges.filter(c => c.category === type.category);

    // Shuffle and pick
    pool = pool.sort(() => Math.random() - 0.5).slice(0, type.count);

    startSession(pool, 'mixed', type.category, type.timeLimit);
    router.push('/interview/session');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
        <p className="text-gray-400 text-sm mt-1">Simulate real interview conditions with timed sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviewTypes.map((type, i) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${type.color}15` }}>
                <Icon className="w-6 h-6" style={{ color: type.color }} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">{type.title}</h2>
              <p className="text-sm text-gray-400 mb-4">{type.description}</p>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {type.timeLimit} min
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {type.count} challenges
                </span>
              </div>
              <button
                onClick={() => handleStart(type)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: `${type.color}15`,
                  color: type.color,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = `${type.color}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = `${type.color}15`;
                }}
              >
                Start Interview <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
