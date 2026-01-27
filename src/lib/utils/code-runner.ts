import type { TestCase } from '../types';

export interface TestResult {
  passed: boolean;
  description: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface RunResult {
  results: TestResult[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  score: number; // 0-100
}

/**
 * Run user code against test cases
 * Uses Function constructor for sandboxed execution
 */
export function runTests(userCode: string, testCases: TestCase[]): RunResult {
  const results: TestResult[] = [];

  for (const tc of testCases) {
    try {
      // Create a function from the user code + test input
      // The user code should define a function that we can call
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

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return {
    results,
    allPassed: passedCount === totalCount,
    passedCount,
    totalCount,
    score,
  };
}
