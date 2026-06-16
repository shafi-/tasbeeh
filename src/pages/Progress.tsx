import { useSessionStore } from '../core/stores/sessionStore';
import { useZikrStore } from '../core/stores/zikrStore';
import { useStreakStore } from '../core/stores/streakStore';
import { calculateTodayTotal, calculateTodayBreakdown, calculateWeeklyData } from '../utils/progressUtils';
import { TodaySummary } from '../components/TodaySummary';
import { WeeklyChart } from '../components/WeeklyChart';
import { GoalProgressSection } from '../components/GoalProgressSection';
import { StreakBadge } from '../components/StreakBadge';

export function Progress() {
  const sessions = useSessionStore(state => state.sessions);
  const zikrs = useZikrStore(state => state.zikrs);
  const streaks = useStreakStore(state => state.streaks);

  // Calculate progress data
  const todayTotal = calculateTodayTotal(sessions);
  const todayBreakdown = calculateTodayBreakdown(sessions, zikrs);
  const weeklyData = calculateWeeklyData(sessions);

  // Handle empty state
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
        <div className="max-w-mobile-container mx-auto p-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Progress
          </h1>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Start practicing to see your progress
            </p>
            <button
              onClick={() => window.location.hash = '#/'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg min-h-[44px] transition-colors"
            >
              Go to Counter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className="max-w-mobile-container mx-auto p-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Progress
        </h1>

        <TodaySummary total={todayTotal} breakdown={todayBreakdown} />

        <WeeklyChart data={weeklyData} />

        {/* Streak Summary Section */}
        <div className="my-8">
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

        <GoalProgressSection />
      </div>
    </div>
  );
}
