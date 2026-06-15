import { useGoalStore } from '../core/stores/goalStore';
import { useSessionStore } from '../core/stores/sessionStore';
import { useZikrStore } from '../core/stores/zikrStore';
import { db } from '../core/db/db';
import { formatDate, getToday } from '../utils/dateUtils';

export function GoalList() {
  const goals = useGoalStore(state => state.goals);
  const sessions = useSessionStore(state => state.sessions);
  const zikrs = useZikrStore(state => state.zikrs);

  const activeGoals = goals.filter(goal => goal.status === 'active');

  if (activeGoals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No active goals</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Create goals to track your daily targets
        </p>
      </div>
    );
  }

  const calculateProgress = (zikrId: number) => {
    const todayStr = formatDate(getToday());
    const todaySessions = sessions.filter(
      session => formatDate(session.date) === todayStr && session.zikrId === zikrId
    );
    return todaySessions.reduce((sum, session) => sum + session.count, 0);
  };

  const getZikrName = (zikrId: number) => {
    const zikr = zikrs.find(z => z.id === zikrId);
    return zikr ? zikr.name : `Zikr #${zikrId}`;
  };

  const handleComplete = async (goalId: number) => {
    try {
      await db.goals.update(goalId, { status: 'completed' });
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDelete = async (goalId: number) => {
    try {
      await db.goals.delete(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  return (
    <div className="space-y-3">
      {activeGoals.map(goal => {
        if (!goal.id) return null;

        const progress = calculateProgress(goal.zikrId);
        const percentage = Math.min((progress / goal.targetCount) * 100, 100);
        const isCompleted = progress >= goal.targetCount;
        const zikrName = getZikrName(goal.zikrId);

        return (
          <div
            key={goal.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              isCompleted
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {zikrName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Target: {goal.targetCount} per day
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {progress}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  / {goal.targetCount}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {isCompleted ? (
                <button
                  onClick={() => goal.id && handleComplete(goal.id)}
                  className="flex-1 min-h-[44px] py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  ✓ Completed
                </button>
              ) : (
                <button
                  onClick={() => window.location.hash = '#/'}
                  className="flex-1 min-h-[44px] py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Continue
                </button>
              )}
              <button
                onClick={() => goal.id && handleDelete(goal.id)}
                className="min-h-[44px] py-2 px-4 border-2 border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
