'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Lightbulb, Calendar, Wrench, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { WalkthroughStep } from '@/lib/types';

interface AnnotationPanelProps {
  step: WalkthroughStep;
  stepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

const sections = [
  { key: 'what' as const, label: 'What', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'why' as const, label: 'Why', icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { key: 'when' as const, label: 'When', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'how' as const, label: 'How', icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
];

export default function AnnotationPanel({
  step,
  stepIndex,
  totalSteps,
  onPrevious,
  onNext,
  onClose,
}: AnnotationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className="border border-gray-800 rounded-xl bg-gray-900/80 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
            {stepIndex + 1}
          </span>
          <h3 className="text-sm font-semibold text-white">{step.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Annotation Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {sections.map(s => (
          <div key={s.key} className={`${s.bg} border ${s.border} rounded-lg p-3`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${s.color}`}>{s.label}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{step[s.key]}</p>
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-800 bg-gray-950/50">
        <button
          onClick={onPrevious}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>
        <span className="text-xs text-gray-500">
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <button
          onClick={onNext}
          disabled={stepIndex === totalSteps - 1}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
