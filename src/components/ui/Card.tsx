'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, gradient = false, onClick }: CardProps) {
  const cls = `rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm ${gradient ? 'border-gradient' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={cls}
        onClick={onClick}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: 'spring' as const, stiffness: 300 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cls} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-gray-800 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
