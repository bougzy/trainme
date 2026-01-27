'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Terminal, Globe, FlaskConical } from 'lucide-react';
import ConsolePanel from './ConsolePanel';
import PreviewPanel from './PreviewPanel';
import type { RunResult } from '@/lib/utils/code-runner';

interface OutputTabsProps {
  result: RunResult | null;
  code: string;
  language: string;
  showPreview?: boolean;
}

type TabId = 'tests' | 'console' | 'preview';

export default function OutputTabs({ result, code, language, showPreview = false }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('tests');

  if (!result) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'tests',
      label: 'Tests',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      badge: `${result.passedCount}/${result.totalCount}`,
    },
    {
      id: 'console',
      label: 'Console',
      icon: <Terminal className="w-3.5 h-3.5" />,
      badge: result.consoleOutput.length > 0 ? `${result.consoleOutput.length}` : undefined,
    },
  ];

  if (showPreview) {
    tabs.push({
      id: 'preview',
      label: 'Preview',
      icon: <Globe className="w-3.5 h-3.5" />,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="border border-gray-800 rounded-xl overflow-hidden"
    >
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 border-b border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.id ? 'text-white bg-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                activeTab === tab.id ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}

        {/* Score indicator on the right */}
        <div className="ml-auto flex items-center gap-2 pr-2">
          <span className={`text-xs font-medium ${result.allPassed ? 'text-emerald-400' : 'text-red-400'}`}>
            {result.allPassed ? 'All Passed' : `${result.passedCount}/${result.totalCount} Passed`}
          </span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500">Score: {result.score}%</span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-950">
        {activeTab === 'tests' && (
          <div className="divide-y divide-gray-800/50">
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
        )}

        {activeTab === 'console' && (
          <ConsolePanel entries={result.consoleOutput} />
        )}

        {activeTab === 'preview' && (
          <PreviewPanel code={code} language={language} />
        )}
      </div>
    </motion.div>
  );
}
