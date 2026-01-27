import type { TestCase } from '../types';

export interface TestResult {
  passed: boolean;
  description: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error';
  args: string[];
  timestamp: number;
}

export interface RunResult {
  results: TestResult[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  score: number; // 0-100
  consoleOutput: ConsoleEntry[];
}

/**
 * Run user code against test cases
 * Uses Function constructor for sandboxed execution
 * Captures console output during execution
 */
export function runTests(userCode: string, testCases: TestCase[]): RunResult {
  const results: TestResult[] = [];
  const consoleOutput: ConsoleEntry[] = [];

  // Save original console methods
  const origLog = console.log;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;

  const capture = (level: ConsoleEntry['level']) =>
    (...args: unknown[]) => {
      consoleOutput.push({
        level,
        args: args.map(a => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))),
        timestamp: Date.now(),
      });
      // Still call original so browser DevTools work
      const orig = { log: origLog, info: origInfo, warn: origWarn, error: origError }[level];
      orig.apply(console, args as Parameters<typeof console.log>);
    };

  // Intercept console methods
  console.log = capture('log');
  console.info = capture('info');
  console.warn = capture('warn');
  console.error = capture('error');

  try {
    for (const tc of testCases) {
      try {
        const fullCode = `
          ${userCode}
          return (${tc.input});
        `;

        const fn = new Function(fullCode);
        const actual = JSON.stringify(fn());
        const expected = tc.expectedOutput.trim();
        const passed = actual === expected;

        results.push({
          passed,
          description: tc.description,
          expected,
          actual: actual ?? 'undefined',
        });
      } catch (error) {
        results.push({
          passed: false,
          description: tc.description,
          expected: tc.expectedOutput,
          actual: 'Error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } finally {
    // Restore original console methods
    console.log = origLog;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return {
    results,
    allPassed: passedCount === totalCount,
    passedCount,
    totalCount,
    score,
    consoleOutput,
  };

}

/**
 * Run code without test cases (for playground/preview mode)
 * Returns only console output
 */
export function runCode(userCode: string): { consoleOutput: ConsoleEntry[]; error?: string } {
  const consoleOutput: ConsoleEntry[] = [];

  const origLog = console.log;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;

  const capture = (level: ConsoleEntry['level']) =>
    (...args: unknown[]) => {
      consoleOutput.push({
        level,
        args: args.map(a => (typeof a === 'string' ? a : JSON.stringify(a, null, 2))),
        timestamp: Date.now(),
      });
      const orig = { log: origLog, info: origInfo, warn: origWarn, error: origError }[level];
      orig.apply(console, args as Parameters<typeof console.log>);
    };

  console.log = capture('log');
  console.info = capture('info');
  console.warn = capture('warn');
  console.error = capture('error');

  try {
    const fn = new Function(userCode);
    fn();
    return { consoleOutput };
  } catch (error) {
    return {
      consoleOutput,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    console.log = origLog;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
  }
}
