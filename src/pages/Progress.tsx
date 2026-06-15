import { useSessionStore } from '../core/stores/sessionStore';
import { useZikrStore } from '../core/stores/zikrStore';
import { calculateTodayTotal, calculateTodayBreakdown, calculateWeeklyData } from '../utils/progressUtils';
import { TodaySummary } from '../components/TodaySummary';
import { WeeklyChart } from '../components/WeeklyChart';
import { GoalProgressSection } from '../components/GoalProgressSection';

export function Progress() {
  const sessions = useSessionStore(state => state.sessions);
  const zikrs = useZikrStore(state => state.zikrs);

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

        <GoalProgressSection />
      </div>
    </div>
  );
}