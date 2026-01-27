'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Save, Play, RefreshCw,
  ChevronDown, AlertCircle, CheckCircle
} from 'lucide-react';
import { useUserStore, useChallengeStore } from '@/lib/stores/useStore';
import { generateChallenge, SUGGESTED_TOPICS } from '@/lib/utils/ai-generator';
import type { Category, Challenge, ChallengeType, Difficulty, CustomChallenge } from '@/lib/types';
import { CATEGORIES } from '@/lib/utils/categories';

const challengeTypes: { value: ChallengeType; label: string }[] = [
  { value: 'CODE', label: 'Code' },
  { value: 'EXPLAIN', label: 'Explain' },
  { value: 'DEBUG', label: 'Debug' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'SCENARIO', label: 'Scenario' },
];

const typeColors: Record<ChallengeType, string> = {
  CODE: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  EXPLAIN: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
  DEBUG: 'text-red-400 border-red-500/40 bg-red-500/10',
  REVIEW: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  DESIGN: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  SCENARIO: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

export default function GeneratorPage() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { addCustomChallenge } = useChallengeStore();

  // Form state
  const [category, setCategory] = useState<Category>('frontend');
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [type, setType] = useState<ChallengeType>('CODE');
  const [topic, setTopic] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChallenge, setGeneratedChallenge] = useState<Challenge | null>(null);
  const [generatedModel, setGeneratedModel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.id === category) ?? CATEGORIES[0];

  const hasApiKey =
    profile?.settings.aiProvider === 'openai'
      ? !!profile.settings.openaiApiKey
      : profile?.settings.aiProvider === 'anthropic'
        ? !!profile.settings.anthropicApiKey
        : false;

  const canGenerate = topic.trim().length > 0 && hasApiKey && !isGenerating;

  const handleCategoryChange = useCallback((newCategory: Category) => {
    setCategory(newCategory);
    const cat = CATEGORIES.find(c => c.id === newCategory);
    if (cat && cat.subcategories.length > 0) {
      setSubcategory(cat.subcategories[0].id);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!profile?.settings.aiProvider) return;
    const apiKey =
      profile.settings.aiProvider === 'openai'
        ? profile.settings.openaiApiKey
        : profile.settings.anthropicApiKey;
    if (!apiKey) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedChallenge(null);
    setIsSaved(false);

    try {
      const result = await generateChallenge(
        { category, subcategory, difficulty, type, topic: topic.trim() },
        profile.settings.aiProvider,
        apiKey
      );
      setGeneratedChallenge(result.challenge);
      setGeneratedModel(result.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate challenge. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profile, category, subcategory, difficulty, type, topic]);

  const handleSave = useCallback(async () => {
    if (!generatedChallenge) return;
    const custom: CustomChallenge = {
      ...generatedChallenge,
      createdAt: new Date(),
      source: 'ai-generated',
      aiModel: generatedModel,
    };
    await addCustomChallenge(custom);
    setIsSaved(true);
  }, [generatedChallenge, generatedModel, addCustomChallenge]);

  const handleSaveAndTry = useCallback(async () => {
    if (!generatedChallenge) return;
    const custom: CustomChallenge = {
      ...generatedChallenge,
      createdAt: new Date(),
      source: 'ai-generated',
      aiModel: generatedModel,
    };
    await addCustomChallenge(custom);
    router.push(`/challenge/${generatedChallenge.id}`);
  }, [generatedChallenge, generatedModel, addCustomChallenge, router]);

  const filteredTopics = SUGGESTED_TOPICS.filter(t => t.category === category);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">AI Challenge Generator</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Generate custom challenges on any topic using AI
        </p>
      </motion.div>

      {/* No API Key Warning */}
      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-yellow-900/10 border border-yellow-900/30 rounded-xl px-5 py-4"
        >
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-300 font-medium">API key required</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure your API key in{' '}
              <Link href="/settings" className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300">
                Settings
              </Link>{' '}
              to use the generator.
            </p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6"
      >
        {/* Category */}
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value as Category)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Subcategory */}
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Subcategory</label>
          <div className="relative">
            <select
              value={subcategory}
              onChange={e => setSubcategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              {selectedCategory.subcategories.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Difficulty</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  difficulty === d
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
                }`}
              >
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(dot => (
                    <span
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full ${
                        dot <= d ? 'bg-yellow-400' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </span>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Type */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Challenge Type</label>
          <div className="grid grid-cols-3 gap-2">
            {challengeTypes.map(ct => (
              <button
                key={ct.value}
                onClick={() => setType(ct.value)}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  type === ct.value
                    ? typeColors[ct.value]
                    : 'bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-sm text-gray-400 block mb-1.5">Topic</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., React Server Components, Binary Search Trees, JWT Authentication..."
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>

        {/* Suggested Topics */}
        {filteredTopics.length > 0 && (
          <div>
            <label className="text-sm text-gray-400 block mb-2">Suggested Topics</label>
            <div className="flex flex-wrap gap-2">
              {filteredTopics.map(st => (
                <button
                  key={st.label}
                  onClick={() => setTopic(st.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    topic === st.label
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750 hover:text-gray-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Generate Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Challenge...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Challenge
            </>
          )}
        </button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 bg-red-900/10 border border-red-900/30 rounded-xl px-5 py-4"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300 font-medium">Generation failed</p>
              <p className="text-xs text-gray-400 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Challenge Preview */}
      <AnimatePresence>
        {generatedChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">{generatedChallenge.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(d => (
                        <span
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full ${
                            d <= generatedChallenge.difficulty ? 'bg-yellow-400' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[generatedChallenge.type]}`}>
                      {generatedChallenge.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      ~{generatedChallenge.estimatedMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {generatedChallenge.description}
              </p>

              {/* Tags */}
              {generatedChallenge.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {generatedChallenge.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Starter Code for CODE/DEBUG types */}
              {generatedChallenge.starterCode && (generatedChallenge.type === 'CODE' || generatedChallenge.type === 'DEBUG') && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 font-medium">Starter Code</p>
                  <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs text-gray-300 font-mono whitespace-pre">
                      {generatedChallenge.starterCode}
                    </code>
                  </pre>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-600 text-gray-200 font-medium rounded-xl transition-colors"
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Challenge
                  </>
                )}
              </button>
              <button
                onClick={handleSaveAndTry}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" />
                Save &amp; Try
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-600 text-gray-200 font-medium rounded-xl transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Regenerate
              </button>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {isSaved && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-emerald-900/10 border border-emerald-900/30 rounded-xl px-5 py-3"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm text-emerald-300">
                    Challenge saved to your library. You can find it in Practice Challenges.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
