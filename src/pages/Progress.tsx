import { useZikrStore } from '../core/stores/zikrStore';
import { useStreakStore } from '../core/stores/streakStore';
import { StreakBadge } from '../components/StreakBadge';

export function Progress() {
  const zikrs = useZikrStore(state => state.zikrs);
  const streaks = useStreakStore(state => state.streaks);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className="max-w-mobile-container mx-auto p-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Progress
        </h1>

        {/* Streak Summary Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Your Streaks
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {zikrs.filter(z => !z.deletedAt).map(zikr => {
              const streak = streaks.find(s => s.zikrId === zikr.id);
              if (!streak || streak.currentStreak === 0) return null;

              return (
                <div
                  key={zikr.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {zikr.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Current practice streak
                      </p>
                    </div>
                    <StreakBadge zikrId={zikr.id!} compact={true} />
                  </div>
                </div>
              );
            })}
          </div>

          {zikrs.filter(z => !z.deletedAt).length > 0 &&
           streaks.filter(s => s.currentStreak > 0).length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Start practicing to build your streak! 🔥
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Detailed progress visualization will be implemented in Epic 4.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
            Epic 3 adds goals and streaks functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
