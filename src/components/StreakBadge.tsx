import { useState, useEffect } from 'react';
import { useStreakStore } from '../core/stores/streakStore';

interface StreakBadgeProps {
  zikrId: number | null;
  compact?: boolean;
}

export function StreakBadge({ zikrId, compact = false }: StreakBadgeProps) {
  const streaks = useStreakStore(state => state.streaks);
  const [showLongest, setShowLongest] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const streak = zikrId ? streaks.find(s => s.zikrId === zikrId) : null;

  // Auto-hide longest streak display after 3 seconds
  useEffect(() => {
    if (showLongest && streak) {
      const newTimer = window.setTimeout(() => {
        setShowLongest(false);
      }, 3000);
      setTimer(newTimer);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showLongest, streak]);

  // Handle tap/long-press
  const handleClick = () => {
    if (compact) {
      setShowLongest(!showLongest);
    }
  };

  const handleTouchEnd = () => {
    if (compact && streak) {
      setShowLongest(true);
      // Auto-hide after 3 seconds (handled by useEffect)
    }
  };

  if (!streak || streak.currentStreak === 0) {
    return null;
  }

  return (
    <div
      className={`streak-badge inline-flex items-center gap-1 px-3 py-1 rounded-full ${
        showLongest
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
      }`}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      role="button"
      aria-label={showLongest ? "Hide longest streak" : "Show longest streak"}
      tabIndex={0}
      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
    >
      {showLongest ? (
        <>
          <span className="text-lg">🏆</span>
          <span className="font-medium">
            Best: {streak.longestStreak} {streak.longestStreak === 1 ? 'day' : 'days'}
          </span>
        </>
      ) : (
        <>
          <span className="text-xl">🔥</span>
          {!compact && (
            <span className="font-medium">
              {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
            </span>
          )}
        </>
      )}
    </div>
  );
}