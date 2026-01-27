import type { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'React, Next.js, TypeScript, and modern UI development',
    icon: 'Monitor',
    color: '#3B82F6',
    subcategories: [
      { id: 'component-architecture', label: 'Component Architecture', challengeCount: 4 },
      { id: 'react-internals', label: 'React Internals', challengeCount: 4 },
      { id: 'state-management', label: 'State Management', challengeCount: 4 },
      { id: 'performance', label: 'Performance', challengeCount: 3 },
      { id: 'accessibility', label: 'Accessibility', challengeCount: 2 },
      { id: 'testing', label: 'Testing', challengeCount: 1 },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    description: 'Node.js, Express, APIs, and server architecture',
    icon: 'Server',
    color: '#10B981',
    subcategories: [
      { id: 'api-design', label: 'API Design', challengeCount: 4 },
      { id: 'architecture-patterns', label: 'Architecture Patterns', challengeCount: 2 },
      { id: 'auth-security', label: 'Auth & Security', challengeCount: 1 },
      { id: 'data-storage', label: 'Data & Storage', challengeCount: 1 },
      { id: 'scalability', label: 'Scalability', challengeCount: 1 },
      { id: 'observability', label: 'Observability', challengeCount: 1 },
    ],
  },
  {
    id: 'fullstack',
    label: 'System Design',
    description: 'End-to-end system architecture and design',
    icon: 'Network',
    color: '#8B5CF6',
    subcategories: [
      { id: 'auth-flows', label: 'Authentication Flows', challengeCount: 1 },
      { id: 'realtime', label: 'Real-time Systems', challengeCount: 2 },
      { id: 'file-uploads', label: 'File Uploads', challengeCount: 1 },
      { id: 'notifications', label: 'Notification Systems', challengeCount: 1 },
      { id: 'system-design', label: 'System Design Exercises', challengeCount: 1 },
    ],
  },
  {
    id: 'algorithms',
    label: 'Algorithms',
    description: 'Data structures, patterns, and problem solving',
    icon: 'Binary',
    color: '#F59E0B',
    subcategories: [
      { id: 'two-pointers', label: 'Two Pointers', challengeCount: 2 },
      { id: 'sliding-window', label: 'Sliding Window', challengeCount: 2 },
      { id: 'hash-maps', label: 'Hash Maps', challengeCount: 2 },
      { id: 'stacks-queues', label: 'Stacks & Queues', challengeCount: 2 },
      { id: 'trees', label: 'Trees & Traversal', challengeCount: 1 },
      { id: 'dynamic-programming', label: 'Dynamic Programming', challengeCount: 1 },
    ],
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Communication, leadership, and interview soft skills',
    icon: 'MessageSquare',
    color: '#EF4444',
    subcategories: [
      { id: 'star-method', label: 'STAR Method', challengeCount: 3 },
      { id: 'technical-explanations', label: 'Technical Explanations', challengeCount: 3 },
      { id: 'tradeoff-discussions', label: 'Trade-off Discussions', challengeCount: 2 },
    ],
  },
];

export function getCategoryById(id: string): CategoryInfo | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getCategoryColor(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.color ?? '#6B7280';
}
