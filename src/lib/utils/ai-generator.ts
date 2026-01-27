import type { Category, ChallengeType, Difficulty, Challenge } from '../types';

export interface GeneratorOptions {
  category: Category;
  subcategory: string;
  difficulty: Difficulty;
  type: ChallengeType;
  topic: string;
}

const SYSTEM_PROMPT = `You are an expert senior software engineer creating interview preparation challenges.
Generate a challenge in JSON format matching exactly this schema:
{
  "title": "string - concise challenge title",
  "description": "string - clear challenge description and instructions",
  "starterCode": "string or null - starter code for CODE/DEBUG challenges",
  "solution": "string - comprehensive model solution",
  "solutionExplanation": "string - explanation of the solution approach",
  "hints": ["string", "string", "string"] - exactly 3 progressive hints,
  "testCases": [{"input": "string", "expectedOutput": "string", "description": "string"}] - for CODE/DEBUG only (3-5 test cases),
  "tags": ["string"] - 3-5 relevant tags,
  "estimatedMinutes": number - estimated time to complete
}

Rules:
- For CODE challenges: include starterCode with a function signature and 3-5 testCases. The input field should be a valid JavaScript expression that calls the function.
- For DEBUG challenges: include starterCode with buggy code and testCases.
- For EXPLAIN/DESIGN/SCENARIO challenges: starterCode and testCases should be null.
- Difficulty 1 = junior, 2 = mid-junior, 3 = mid, 4 = senior, 5 = principal level.
- Include exactly 3 progressive hints (easy to specific).
- Solutions should be comprehensive and educational.
- All code should be valid JavaScript (not TypeScript).
- Return ONLY valid JSON, no markdown code fences.`;

function buildUserPrompt(options: GeneratorOptions): string {
  return `Generate a ${options.type} challenge about "${options.topic}" for the ${options.category} category (subcategory: ${options.subcategory}). Difficulty level: ${options.difficulty}/5.`;
}

function generateChallengeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseAndValidate(json: string, options: GeneratorOptions): Challenge {
  const parsed = JSON.parse(json);

  const challenge: Challenge = {
    id: generateChallengeId(),
    category: options.category,
    subcategory: options.subcategory,
    difficulty: options.difficulty,
    type: options.type,
    title: parsed.title || 'Untitled Challenge',
    description: parsed.description || '',
    starterCode: parsed.starterCode || undefined,
    solution: parsed.solution || '',
    solutionExplanation: parsed.solutionExplanation || '',
    hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 3) : [],
    testCases: Array.isArray(parsed.testCases) ? parsed.testCases : undefined,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [options.category],
    estimatedMinutes: typeof parsed.estimatedMinutes === 'number' ? parsed.estimatedMinutes : 10,
  };

  // Ensure hints has at least 1 entry
  if (challenge.hints.length === 0) {
    challenge.hints = ['Think about the problem step by step.'];
  }

  return challenge;
}

export async function generateWithOpenAI(
  options: GeneratorOptions,
  apiKey: string
): Promise<{ challenge: Challenge; model: string }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(options) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in OpenAI response');

  const challenge = parseAndValidate(content, options);
  return { challenge, model: 'gpt-4o' };
}

export async function generateWithAnthropic(
  options: GeneratorOptions,
  apiKey: string
): Promise<{ challenge: Challenge; model: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: `${SYSTEM_PROMPT}\n\n${buildUserPrompt(options)}` },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error('No content in Anthropic response');

  // Strip markdown code fences if present
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const challenge = parseAndValidate(jsonStr, options);
  return { challenge, model: 'claude-sonnet-4-20250514' };
}

export async function generateChallenge(
  options: GeneratorOptions,
  provider: 'openai' | 'anthropic',
  apiKey: string
): Promise<{ challenge: Challenge; model: string }> {
  if (provider === 'openai') {
    return generateWithOpenAI(options, apiKey);
  }
  return generateWithAnthropic(options, apiKey);
}

export const SUGGESTED_TOPICS = [
  { label: 'React Server Components', category: 'frontend' },
  { label: 'Custom Hooks Patterns', category: 'frontend' },
  { label: 'CSS Grid Layout', category: 'frontend' },
  { label: 'Web Accessibility (ARIA)', category: 'frontend' },
  { label: 'React Performance Optimization', category: 'frontend' },
  { label: 'Rate Limiting Middleware', category: 'backend' },
  { label: 'Database Connection Pooling', category: 'backend' },
  { label: 'REST API Error Handling', category: 'backend' },
  { label: 'Authentication with JWT', category: 'backend' },
  { label: 'Caching Strategies (Redis)', category: 'backend' },
  { label: 'WebSocket Real-time Architecture', category: 'fullstack' },
  { label: 'CI/CD Pipeline Design', category: 'fullstack' },
  { label: 'Microservices Communication', category: 'fullstack' },
  { label: 'Event-Driven Architecture', category: 'fullstack' },
  { label: 'Binary Search Variations', category: 'algorithms' },
  { label: 'Graph Traversal (BFS/DFS)', category: 'algorithms' },
  { label: 'Dynamic Programming Patterns', category: 'algorithms' },
  { label: 'Linked List Operations', category: 'algorithms' },
  { label: 'Explaining Trade-offs to Stakeholders', category: 'behavioral' },
  { label: 'Leading a Team Through a Crisis', category: 'behavioral' },
];
