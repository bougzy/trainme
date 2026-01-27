'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield } from 'lucide-react';
import type { ReviewIssue } from '@/lib/types';

interface ReviewEditorProps {
  code: string;
  issues: ReviewIssue[];
  onComplete: (score: number, foundIssues: string[]) => void;
}

const severityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  major: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  minor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  suggestion: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

const severityLabels: Record<string, string> = {
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  suggestion: 'Suggestion',
};

export default function ReviewEditor({ code, issues, onComplete }: ReviewEditorProps) {
  const [foundIssues, setFoundIssues] = useState<Set<string>>(new Set());
  const [userNotes, setUserNotes] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleIssue = (id: string) => {
    const next = new Set(foundIssues);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setFoundIssues(next);
  };

  const handleSubmit = () => {
    const score = Math.round((foundIssues.size / issues.length) * 100);
    onComplete(score, Array.from(foundIssues));
    setIsSubmitted(true);
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="space-y-4">
      {/* Code Display */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-400 font-medium">Review this code - find the issues</span>
        </div>
        <pre className="p-4 bg-gray-950 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      {/* User Notes */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Your observations:</label>
        <textarea
          value={userNotes}
          onChange={e => setUserNotes(e.target.value)}
          placeholder="Write down the issues you found before revealing the answer..."
          className="w-full h-24 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
        />
      </div>

      {/* Issues checklist - shown after submit */}
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={userNotes.length < 10}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Submit Review
        </button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Score */}
          <div className={`p-4 rounded-xl border ${
            foundIssues.size === issues.length ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-gray-900 border-gray-800'
          }`}>
            <p className="text-sm font-medium text-gray-300">
              Review Score: <span className={foundIssues.size >= issues.length * 0.7 ? 'text-emerald-400' : 'text-yellow-400'}>
                {Math.round((foundIssues.size / issues.length) * 100)}%
              </span>
            </p>
          </div>

          {/* Issue checklist */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Issues to identify:</p>
            <div className="space-y-2">
              {issues.map(issue => {
                const found = foundIssues.has(issue.id);
                return (
                  <div
                    key={issue.id}
                    onClick={() => !isRevealed && toggleIssue(issue.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      found ? 'border-emerald-800/30 bg-emerald-900/10' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-900'
                    }`}
                  >
                    {found ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColors[issue.severity]}`}>
                          {severityLabels[issue.severity]}
                        </span>
                        {issue.line && <span className="text-xs text-gray-500">Line {issue.line}</span>}
                      </div>
                      {(isRevealed || found) && (
                        <p className="text-sm text-gray-300">{issue.description}</p>
                      )}
                      {!isRevealed && !found && (
                        <p className="text-sm text-gray-500 italic">Click to mark as found</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {!isRevealed && (
            <button
              onClick={handleReveal}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Reveal All Issues
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
