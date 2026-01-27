'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Briefcase,
  BarChart3,
  Trophy,
  Settings,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useUserStore } from '@/lib/stores/useStore';
import { getLevelFromXP, getXPProgress } from '@/lib/utils/xp';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/challenge', label: 'Practice', icon: Code },
  { href: '/interview', label: 'Mock Interview', icon: Briefcase },
  { href: '/generator', label: 'AI Generator', icon: Sparkles },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useUserStore();

  const levelInfo = profile ? getLevelFromXP(profile.xp) : null;
  const xpProgress = profile ? getXPProgress(profile.xp) : null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TrainMe
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Senior Engineer Prep</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* XP Bar at bottom */}
      {profile && levelInfo && xpProgress && (
        <div className="px-4 py-4 border-t border-gray-800/50">
          <div className="bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300">{levelInfo.title}</span>
              <span className="text-[10px] text-gray-500">Lv.{levelInfo.level}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-500">{profile.xp} XP</span>
              <span className="text-[10px] text-gray-500">{xpProgress.current}/{xpProgress.needed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-950 border-r border-gray-800/50">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800/50 lg:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
