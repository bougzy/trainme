'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Copy, Layers, Eye } from 'lucide-react';
import type { ConceptSection } from '@/lib/types';

interface ConceptBreakdownProps {
  solution: string;
  conceptSections?: ConceptSection[];
  solutionExplanation: string;
}

export default function ConceptBreakdown({
  solution,
  conceptSections,
  solutionExplanation,
}: ConceptBreakdownProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set([0]));
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasConceptSections = conceptSections && conceptSections.length > 0;

  const toggleSection = useCallback((index: number) => {
    setExpandedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!conceptSections) return;
    setExpandedIndices(prev => {
      if (prev.size === conceptSections.length) {
        return new Set();
      }
      return new Set(conceptSections.map((_, i) => i));
    });
  }, [conceptSections]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [solution]);

  // Fallback: no concept sections
  if (!hasConceptSections) {
    return (
      <div className="border border-emerald-800/30 bg-emerald-900/10 rounded-xl p-5 relative">
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-emerald-400">Model Answer</h3>
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400/70 hover:text-emerald-300 text-[10px] font-medium transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
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
    );
  }

  const allExpanded = expandedIndices.size === conceptSections.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Concept Breakdown</span>
          <span className="text-xs text-gray-600">({conceptSections.length} sections)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-[10px] font-medium transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={toggleAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Concept Cards */}
      {conceptSections.map((section, i) => {
        const isExpanded = expandedIndices.has(i);
        return (
          <div
            key={i}
            className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 transition-colors"
          >
            <button
              onClick={() => toggleSection(i)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-900 transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">{section.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.keyTakeaway}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 space-y-3">
                    {/* Key Takeaway */}
                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-emerald-400 mb-0.5">Key Takeaway</p>
                      <p className="text-sm text-gray-300">{section.keyTakeaway}</p>
                    </div>

                    {/* Detailed Explanation */}
                    <p className="text-sm text-gray-400 leading-relaxed">{section.explanation}</p>

                    {/* Related Patterns */}
                    {section.relatedPatterns.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-gray-600 uppercase tracking-wide mr-1 self-center">Related:</span>
                        {section.relatedPatterns.map(pattern => (
                          <span
                            key={pattern}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* View Full Answer Toggle */}
      <button
        onClick={() => setShowFullAnswer(!showFullAnswer)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        {showFullAnswer ? 'Hide Full Answer' : 'View Full Answer'}
      </button>

      <AnimatePresence>
        {showFullAnswer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-gray-800 bg-gray-950 rounded-xl p-4">
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{solution}</div>
              {solutionExplanation && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-sm text-gray-400 leading-relaxed">{solutionExplanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
