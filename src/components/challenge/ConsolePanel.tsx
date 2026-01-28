'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Info, AlertTriangle, XCircle, Copy, Check } from 'lucide-react';
import type { ConsoleEntry } from '@/lib/utils/code-runner';

interface ConsolePanelProps {
  entries: ConsoleEntry[];
}

const levelConfig = {
  log: { icon: Terminal, color: 'text-gray-300', bg: '' },
  info: { icon: Info, color: 'text-blue-400', bg: '' },
  warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-900/10' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/10' },
};

export default function ConsolePanel({ entries }: ConsolePanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleCopy = useCallback(() => {
    const text = entries.map(e => `[${e.level.toUpperCase()}] ${e.args.join(' ')}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-600">
        <Terminal className="w-8 h-8 mb-2" />
        <p className="text-sm">Run your code to see console output</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-[10px] font-medium transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <div className="max-h-64 overflow-y-auto font-mono text-xs">
        {entries.map((entry, i) => {
          const config = levelConfig[entry.level];
          const Icon = config.icon;
          return (
            <div key={i} className={`flex items-start gap-2 px-3 py-1.5 border-b border-gray-800/50 ${config.bg}`}>
              <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${config.color}`} />
              <div className={`flex-1 whitespace-pre-wrap break-all ${config.color}`}>
                {entry.args.join(' ')}
              </div>
              <span className="text-gray-700 text-[10px] flex-shrink-0 mt-0.5">
                {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
