'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, Lock } from 'lucide-react';

interface HintPanelProps {
  hints: string[];
  onHintUsed: (count: number) => void;
}

export default function HintPanel({ hints, onHintUsed }: HintPanelProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const revealNext = () => {
    const next = revealedCount + 1;
    setRevealedCount(next);
    onHintUsed(next);
  };

  if (hints.length === 0) return null;

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-300">
            Hints ({revealedCount}/{hints.length})
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-950 space-y-2">
              {hints.map((hint, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm ${i < revealedCount ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className="text-xs font-mono text-gray-500 mt-0.5">{i + 1}.</span>
                  {i < revealedCount ? (
                    <span>{hint}</span>
                  ) : (
                    <span className="flex items-center gap-1 italic">
                      <Lock className="w-3 h-3" /> Hidden (-15% XP)
                    </span>
                  )}
                </div>
              ))}

              {revealedCount < hints.length && (
                <button
                  onClick={revealNext}
                  className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Reveal next hint
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
