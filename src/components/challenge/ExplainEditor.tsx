'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';

interface ExplainEditorProps {
  initialAnswer: string;
  solution: string;
  solutionExplanation: string;
  onChange: (answer: string) => void;
  onSelfRate: (rating: number) => void;
}

export default function ExplainEditor({
  initialAnswer,
  solution,
  solutionExplanation,
  onChange,
  onSelfRate,
}: ExplainEditorProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [showSolution, setShowSolution] = useState(false);
  const [selfRating, setSelfRating] = useState<number | null>(null);

  const handleChange = (value: string) => {
    setAnswer(value);
    onChange(value);
  };

  const handleRate = (rating: number) => {
    setSelfRating(rating);
    onSelfRate(rating);
  };

  return (
    <div className="space-y-4">
      {/* Answer Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Your Answer</label>
          <span className="text-xs text-gray-500">{answer.length} characters</span>
        </div>
        <textarea
          value={answer}
          onChange={e => handleChange(e.target.value)}
          placeholder="Type your explanation here. Be thorough and precise - explain the 'why' not just the 'what'..."
          className="w-full h-48 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-y"
        />
      </div>

      {/* Reveal Solution Button */}
      {!showSolution && (
        <button
          onClick={() => setShowSolution(true)}
          disabled={answer.length < 20}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Reveal Model Answer
          {answer.length < 20 && <span className="text-xs text-gray-500">(write at least 20 characters first)</span>}
        </button>
      )}

      {/* Solution Comparison */}
      <AnimatePresence>
        {showSolution && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="border border-emerald-800/30 bg-emerald-900/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-400">Model Answer</h3>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {solution}
              </div>
              {solutionExplanation && (
                <div className="mt-4 pt-4 border-t border-emerald-800/20">
                  <p className="text-xs font-medium text-gray-500 mb-2">EXPLANATION</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{solutionExplanation}</p>
                </div>
              )}
            </div>

            {/* Self Rating */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-sm font-medium text-gray-300 mb-3">How well did you answer? Rate yourself:</p>
              <div className="flex gap-2">
                {[
                  { value: 1, label: 'Poor', color: 'bg-red-600 hover:bg-red-700' },
                  { value: 2, label: 'Fair', color: 'bg-orange-600 hover:bg-orange-700' },
                  { value: 3, label: 'Good', color: 'bg-yellow-600 hover:bg-yellow-700' },
                  { value: 4, label: 'Great', color: 'bg-emerald-600 hover:bg-emerald-700' },
                  { value: 5, label: 'Perfect', color: 'bg-blue-600 hover:bg-blue-700' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleRate(opt.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-white transition-all ${
                      selfRating === opt.value ? `${opt.color} ring-2 ring-white/30 scale-105` : `${opt.color} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {selfRating !== null && (
                <p className="text-xs text-gray-500 mt-2">
                  Your rating will be used to schedule future reviews via spaced repetition.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
