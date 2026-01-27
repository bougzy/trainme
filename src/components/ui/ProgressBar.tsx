'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'bg-blue-500',
  showLabel = false,
  size = 'md',
  className = '',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function XPBar({ current, max, level }: { current: number; max: number; level: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-400">Level {level}</span>
        <span className="text-xs text-gray-500">{current} / {max} XP</span>
      </div>
      <ProgressBar value={current} max={max} color="bg-gradient-to-r from-blue-500 to-purple-500" size="sm" />
    </div>
  );
}
