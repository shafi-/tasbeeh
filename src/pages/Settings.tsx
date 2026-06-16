import { useState } from 'react';
import { useSettingsStore } from '../core/stores/settingsStore';
import { exportService } from '../core/services/exportService';
import { PlatformLimitationsInfo } from '../components/PlatformLimitationsInfo';

export function Settings() {
  const settingsStore = useSettingsStore();
  const darkModeSetting = settingsStore.getSetting('darkMode');
  const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const darkMode = darkModeSetting ?? systemPref;

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleDarkModeToggle = async () => {
    const newMode = !darkMode;
    try {
      await settingsStore.saveSetting('darkMode', newMode);
      applyDarkMode(newMode);
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setImportError(null);
    try {
      await exportService.exportData();
    } catch (error) {
      setImportError('Failed to export data. Please try again.');
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    if (!file) return;

    setImporting(true);
    setImportError(null);
    try {
      await exportService.importData(file);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Failed to import data. Please check the file format.'
      );
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      // Import empty data to clear all stores
      const emptyFile = new File(
        [JSON.stringify({ version: '1.0', exportDate: new Date().toISOString(), data: { zikrs: [], sessions: [], goals: [], streaks: [], settings: [] } })],
        'clear.json',
        { type: 'application/json' }
      );
      await exportService.importData(emptyFile);
      setShowClearConfirm(false);
    } catch (error) {
      setImportError('Failed to clear data. Please try again.');
      console.error('Clear failed:', error);
    }
  };

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className="max-w-mobile-container mx-auto p-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Settings
        </h1>

        {/* Appearance Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Appearance
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {darkMode ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className={`min-h-[44px] px-6 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
              >
                {darkMode ? '🌙 On' : '☀️ Off'}
              </button>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Data Management
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full min-h-[44px] py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
                disabled={importing}
                className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4"
              />
              {importError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{importError}</p>
              )}
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full min-h-[44px] py-2 px-4 border-2 border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </section>

        {/* App Info Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            App Info
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Version:</strong> 1.0.0
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              <strong>Type:</strong> Progressive Web App
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              <strong>Data Storage:</strong> Local (IndexedDB)
            </p>
          </div>
        </section>

        {/* Platform Limitations Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Platform Limitations
          </h2>

          <PlatformLimitationsInfo />
        </section>

        {/* Clear Data Confirmation Modal */}
        {showClearConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Clear All Data?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This will permanently delete all your zikrs, sessions, goals, and settings. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium min-h-[44px]"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
