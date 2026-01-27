'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Download, Upload, Trash2, Save,
  AlertTriangle, CheckCircle, Database
} from 'lucide-react';
import { useUserStore, useChallengeStore } from '@/lib/stores/useStore';
import { db } from '@/lib/db';
import type { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const { profile, updateProfile } = useUserStore();
  const { loadProgress } = useChallengeStore();
  const [name, setName] = useState(profile?.name ?? 'Engineer');
  const [settings, setSettings] = useState<UserSettings>(
    profile?.settings ?? {
      theme: 'dark',
      dailyChallengeCount: 3,
      showHints: true,
      timerEnabled: true,
      soundEnabled: false,
    }
  );
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = async () => {
    await updateProfile({ name, settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = useCallback(async () => {
    const progress = await db.progress.toArray();
    const achievements = await db.achievements.toArray();
    const sessions = await db.sessions.toArray();
    const notes = await db.notes.toArray();
    const userProfile = await db.userProfile.toArray();

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userProfile,
      progress,
      achievements,
      sessions,
      notes,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainme-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.version !== 1) {
          alert('Unsupported backup version');
          return;
        }

        // Clear existing data
        await db.progress.clear();
        await db.achievements.clear();
        await db.sessions.clear();
        await db.notes.clear();
        await db.userProfile.clear();

        // Import data
        if (data.userProfile?.length) await db.userProfile.bulkAdd(data.userProfile);
        if (data.progress?.length) await db.progress.bulkAdd(data.progress);
        if (data.achievements?.length) await db.achievements.bulkAdd(data.achievements);
        if (data.sessions?.length) await db.sessions.bulkAdd(data.sessions);
        if (data.notes?.length) await db.notes.bulkAdd(data.notes);

        // Reload stores
        await useUserStore.getState().loadProfile();
        await loadProgress();

        alert('Data imported successfully! Refreshing...');
        window.location.reload();
      } catch {
        alert('Failed to import data. Please check the file format.');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  }, [loadProgress]);

  const handleReset = useCallback(async () => {
    await db.progress.clear();
    await db.achievements.clear();
    await db.sessions.clear();
    await db.notes.clear();
    await db.userProfile.clear();
    setShowResetConfirm(false);
    window.location.reload();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your training experience</p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Training Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Training Preferences</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 block mb-1.5">Daily Challenge Count</label>
            <select
              value={settings.dailyChallengeCount}
              onChange={e => setSettings({ ...settings, dailyChallengeCount: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value={1}>1 challenge</option>
              <option value={3}>3 challenges</option>
              <option value={5}>5 challenges</option>
              <option value={7}>7 challenges</option>
              <option value={10}>10 challenges</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Show Hints</p>
              <p className="text-xs text-gray-500">Display hint panel on challenges</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, showHints: !settings.showHints })}
              className={`w-11 h-6 rounded-full transition-colors ${settings.showHints ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.showHints ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Timer</p>
              <p className="text-xs text-gray-500">Show elapsed time on challenges</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, timerEnabled: !settings.timerEnabled })}
              className={`w-11 h-6 rounded-full transition-colors ${settings.timerEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${settings.timerEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Settings
            </>
          )}
        </button>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Data Management</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          All data is stored locally in your browser using IndexedDB. Export your data regularly to avoid loss.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-200">Export Data</p>
              <p className="text-xs text-gray-500">Download a JSON backup of all your progress</p>
            </div>
          </button>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-200">
                {importing ? 'Importing...' : 'Import Data'}
              </p>
              <p className="text-xs text-gray-500">Restore from a previously exported backup</p>
            </div>
          </button>

          <div className="pt-3 border-t border-gray-800">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-900/10 hover:bg-red-900/20 border border-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-400">Reset All Data</p>
                  <p className="text-xs text-gray-500">Permanently delete all progress and settings</p>
                </div>
              </button>
            ) : (
              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-medium text-red-400">This cannot be undone!</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  All progress, achievements, and settings will be permanently deleted.
                  Consider exporting your data first.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Yes, Delete Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
