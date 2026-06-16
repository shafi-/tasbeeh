import { useEffect, useState } from 'react';
import { getMigrationProgress, V2MigrationProgress } from '../../../core/db/migrations';

interface MigrationScreenProps {
  onComplete: () => void;
}

export function MigrationScreen({ onComplete }: MigrationScreenProps) {
  const [progress, setProgress] = useState<V2MigrationProgress>({
    current: 0,
    total: 0,
    phase: 'pending'
  });

  useEffect(() => {
    const runMigration = async () => {
      try {
        // Get initial progress
        const initialProgress = await getMigrationProgress();
        setProgress(initialProgress);

        // Simulate migration progress (in real implementation, this would be called by the actual migration)
        if (initialProgress.phase === 'pending') {
          setProgress({ current: 0, total: initialProgress.total, phase: 'running' });

          // Simulate migration progress
          for (let i = 0; i <= initialProgress.total; i += Math.max(1, Math.floor(initialProgress.total / 10))) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setProgress({
              current: Math.min(i, initialProgress.total),
              total: initialProgress.total,
              phase: 'running'
            });
          }

          setProgress({
            current: initialProgress.total,
            total: initialProgress.total,
            phase: 'complete'
          });

          // Wait a moment to show completion
          await new Promise(resolve => setTimeout(resolve, 1000));
          onComplete();
        } else {
          onComplete();
        }
      } catch (error) {
        console.error('Migration failed:', error);
        setProgress({ current: 0, total: 0, phase: 'failed' });
      }
    };

    runMigration();
  }, []);

  const getPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  };

  const getEstimatedTime = () => {
    const sessionsPerSecond = 200; // Estimate based on architecture
    const remaining = progress.total - progress.current;
    const seconds = Math.ceil(remaining / sessionsPerSecond);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} minutes`;
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full">
        {/* Migration progress screen */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Updating Zikr
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your enhanced session features
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${getPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{progress.current} / {progress.total}</span>
            <span>{getPercentage()}%</span>
          </div>
        </div>

        {/* Estimated time */}
        {progress.phase === 'running' && progress.total > 0 && (
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Estimated time: {getEstimatedTime()}
            </p>
          </div>
        )}

        {/* What's New section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ✨ What's New
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Edit sessions for 3 days after creation</li>
            <li>• Bulk entry modes for efficient logging</li>
            <li>• Session history with progress insights</li>
            <li>• Smart defaults for faster data entry</li>
          </ul>
        </div>

        {/* Educational content */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <p>This is a one-time update to enhance your experience.</p>
          <p>All your data is safe and will be preserved.</p>
        </div>

        {/* Complete message */}
        {progress.phase === 'complete' && (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
              ✓ Update Complete!
            </p>
            <p className="text-gray-600 dark:text-gray-400">Loading your enhanced experience...</p>
          </div>
        )}

        {/* Error state */}
        {progress.phase === 'failed' && (
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              ✗ Update Failed
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg min-h-[44px]"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}