'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'emerald' | 'orange';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ children, variant = 'gray', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  const config: Record<number, { label: string; variant: BadgeVariant }> = {
    1: { label: 'Easy', variant: 'green' },
    2: { label: 'Medium', variant: 'blue' },
    3: { label: 'Intermediate', variant: 'yellow' },
    4: { label: 'Hard', variant: 'orange' },
    5: { label: 'Expert', variant: 'red' },
  };
  const { label, variant } = config[level];
  return <Badge variant={variant}>{label}</Badge>;
}

export function TypeBadge({ type }: { type: string }) {
  const config: Record<string, BadgeVariant> = {
    CODE: 'blue',
    EXPLAIN: 'purple',
    DEBUG: 'red',
    REVIEW: 'yellow',
    DESIGN: 'emerald',
    SCENARIO: 'orange',
  };
  return <Badge variant={config[type] ?? 'gray'}>{type}</Badge>;
}
