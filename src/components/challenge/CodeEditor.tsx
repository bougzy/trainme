'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { runTests, type RunResult } from '@/lib/utils/code-runner';
import type { TestCase } from '@/lib/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  initialCode: string;
  testCases: TestCase[];
  onChange: (code: string) => void;
  onRunResult: (result: RunResult) => void;
  language?: string;
  height?: string;
}

export default function CodeEditor({
  initialCode,
  testCases,
  onChange,
  onRunResult,
  language = 'javascript',
  height = '350px',
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const handleChange = useCallback((value: string | undefined) => {
    const newCode = value ?? '';
    setCode(newCode);
    onChange(newCode);
  }, [onChange]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    // Small delay to show loading state
    setTimeout(() => {
      const runResult = runTests(code, testCases);
      setResult(runResult);
      onRunResult(runResult);
      setIsRunning(false);
    }, 300);
  }, [code, testCases, onRunResult]);

  return (
    <div className="space-y-3">
      {/* Editor */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-mono">{language}</span>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Code
          </button>
        </div>
        <MonacoEditor
          height={height}
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            padding: { top: 12 },
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Test Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-800 rounded-xl overflow-hidden"
          >
            <div className={`px-4 py-2 border-b border-gray-800 flex items-center justify-between ${
              result.allPassed ? 'bg-emerald-900/20' : 'bg-red-900/20'
            }`}>
              <span className={`text-sm font-medium ${result.allPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.allPassed ? 'All Tests Passed!' : `${result.passedCount}/${result.totalCount} Tests Passed`}
              </span>
              <span className="text-xs text-gray-500">Score: {result.score}%</span>
            </div>
            <div className="bg-gray-950 divide-y divide-gray-800/50">
              {result.results.map((r, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  {r.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{r.description}</p>
                    {!r.passed && (
                      <div className="mt-1 text-xs space-y-0.5">
                        <p className="text-gray-500">Expected: <span className="text-emerald-400 font-mono">{r.expected}</span></p>
                        <p className="text-gray-500">Got: <span className="text-red-400 font-mono">{r.actual}</span></p>
                        {r.error && <p className="text-red-400 font-mono">{r.error}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
