'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { Copy, Check, BookOpen } from 'lucide-react';
import type { Monaco } from '@monaco-editor/react';
import type { WalkthroughStep } from '@/lib/types';
import AnnotationPanel from './AnnotationPanel';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeWalkthroughProps {
  code: string;
  walkthrough?: WalkthroughStep[];
  solutionExplanation: string;
  language?: string;
}

export default function CodeWalkthrough({
  code,
  walkthrough,
  solutionExplanation,
  language = 'javascript',
}: CodeWalkthroughProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const hasWalkthrough = walkthrough && walkthrough.length > 0;
  const codeLines = code.split('\n');
  const editorHeight = `${Math.max(150, Math.min(codeLines.length * 20 + 24, 400))}px`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  const handleBeforeMount = useCallback((monaco: Monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });
  }, []);

  // Update line decorations when active step changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !hasWalkthrough) return;

    const newDecorations: Array<{ range: InstanceType<typeof monaco.Range>; options: Record<string, unknown> }> = [];

    if (activeStep !== null && walkthrough[activeStep]) {
      const step = walkthrough[activeStep];
      newDecorations.push({
        range: new monaco.Range(step.lines[0], 1, step.lines[1], 1),
        options: {
          isWholeLine: true,
          className: 'walkthrough-line-highlight',
          glyphMarginClassName: 'walkthrough-glyph',
        },
      });

      // Scroll to the highlighted lines
      editor.revealLineInCenter(step.lines[0]);
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [activeStep, walkthrough, hasWalkthrough]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(prev => prev === index ? null : index);
  }, []);

  const handlePrevious = useCallback(() => {
    setActiveStep(prev => (prev !== null && prev > 0) ? prev - 1 : prev);
  }, []);

  const handleNext = useCallback(() => {
    if (!walkthrough) return;
    setActiveStep(prev => (prev !== null && prev < walkthrough.length - 1) ? prev + 1 : prev);
  }, [walkthrough]);

  const handleClose = useCallback(() => {
    setActiveStep(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!hasWalkthrough || activeStep === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWalkthrough, activeStep, handlePrevious, handleNext, handleClose]);

  return (
    <div className="space-y-3">
      {/* Code Editor (read-only) */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-mono">solution.{language === 'javascript' ? 'js' : language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-xs font-medium rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <MonacoEditor
          height={editorHeight}
          language={language}
          value={code}
          theme="vs-dark"
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            padding: { top: 12 },
            renderLineHighlight: 'none',
            glyphMargin: hasWalkthrough,
            folding: false,
            contextmenu: false,
            cursorStyle: 'line-thin',
          }}
        />
      </div>

      {/* Walkthrough Step Selector */}
      {hasWalkthrough && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-400">Click a step to explore the code</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {walkthrough.map((step, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  activeStep === i
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeStep === i ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                {step.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Annotation Panel */}
      <AnimatePresence mode="wait">
        {hasWalkthrough && activeStep !== null && walkthrough[activeStep] && (
          <AnnotationPanel
            key={activeStep}
            step={walkthrough[activeStep]}
            stepIndex={activeStep}
            totalSteps={walkthrough.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Fallback / Summary Explanation */}
      {(!hasWalkthrough || activeStep === null) && solutionExplanation && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 leading-relaxed">{solutionExplanation}</p>
        </div>
      )}
    </div>
  );
}
