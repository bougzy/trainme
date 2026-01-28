'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, Loader2, Copy, Check } from 'lucide-react';
import { runTests, type RunResult } from '@/lib/utils/code-runner';
import type { TestCase } from '@/lib/types';
import type { Monaco } from '@monaco-editor/react';
import OutputTabs from './OutputTabs';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  initialCode: string;
  testCases: TestCase[];
  onChange: (code: string) => void;
  onRunResult: (result: RunResult) => void;
  language?: string;
  height?: string;
  showPreview?: boolean;
}

export default function CodeEditor({
  initialCode,
  testCases,
  onChange,
  onRunResult,
  language = 'javascript',
  height = '350px',
  showPreview = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((value: string | undefined) => {
    const newCode = value ?? '';
    setCode(newCode);
    onChange(newCode);
  }, [onChange]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const runResult = runTests(code, testCases);
      setResult(runResult);
      onRunResult(runResult);
      setIsRunning(false);
    }, 300);
  }, [code, testCases, onRunResult]);

  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    // Suppress false-positive TypeScript/syntax errors in the editor
    // Real syntax errors are caught at runtime by the test runner
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: false,
      jsx: monaco.languages.typescript.JsxEmit.React,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      strict: false,
    });

    // Declare common globals so they don't show "Cannot find name" errors
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `declare var React: any;
       declare var console: Console;
       declare function require(module: string): any;
       declare var module: { exports: any };
       declare var exports: any;`,
      'globals.d.ts'
    );

    // Also configure TypeScript defaults in case language switches
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Editor */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-mono">{language}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-xs font-medium rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run Code
            </button>
          </div>
        </div>
        <MonacoEditor
          height={height}
          language={language}
          value={code}
          onChange={handleChange}
          theme="vs-dark"
          beforeMount={handleEditorWillMount}
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

      {/* Output Panel with Tests, Console, and Preview tabs */}
      <OutputTabs
        result={result}
        code={code}
        language={language}
        showPreview={showPreview}
      />
    </div>
  );
}
