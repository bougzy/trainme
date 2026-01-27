'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useUserStore } from '@/lib/stores/useStore';
import { useChallengeStore } from '@/lib/stores/useStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loadProfile, isLoaded: userLoaded } = useUserStore();
  const { loadChallenges, loadProgress, isLoaded: challengesLoaded } = useChallengeStore();

  useEffect(() => {
    loadProfile();
    loadChallenges();
    loadProgress();
  }, [loadProfile, loadChallenges, loadProgress]);

  if (!userLoaded || !challengesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading TrainMe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
