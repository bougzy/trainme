'use client';

import { useUserStore } from '@/lib/stores/useStore';
import { getLevelFromXP } from '@/lib/utils/xp';
import StatsRow from '@/components/dashboard/StatsRow';
import DailyChallenges from '@/components/dashboard/DailyChallenges';
import CategoryProgress from '@/components/dashboard/CategoryProgress';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { profile } = useUserStore();
  const levelInfo = profile ? getLevelFromXP(profile.xp) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {levelInfo ? `${levelInfo.title} \u00B7 Level ${levelInfo.level}` : 'Start your journey'}
        </p>
      </motion.div>

      {/* Stats Row */}
      <StatsRow />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Daily Challenges + Category Progress */}
        <div className="lg:col-span-2 space-y-8">
          <DailyChallenges />
          <CategoryProgress />
        </div>

        {/* Right column - Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
