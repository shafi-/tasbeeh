import { useState } from 'react';
import { useGoalStore } from '../core/stores/goalStore';
import { useSessionStore } from '../core/stores/sessionStore';
import { goalService } from '../core/services/goalService';
import { AddGoalModal } from './AddGoalModal';
import { Goal } from '../core/db/types';

interface GoalListProps {
  onGoalSelect?: (goal: Goal) => void;
}

export function GoalList({ onGoalSelect }: GoalListProps) {
  const goals = useGoalStore(state => state.goals);
  const sessions = useSessionStore(state => state.sessions);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const calculateProgress = (goal: Goal) => {
    return goalService.calculateProgress(goal, sessions);
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const handlePauseResume = async (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    try {
      await goalService.updateStatus(goal.id!, newStatus);
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const handleDelete = async (goal: Goal) => {
    if (confirm(`Delete goal for "${goal.zikrId}"?`)) {
      try {
        await goalService.delete(goal.id!);
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No goals yet - set your first target!</p>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px]"
        >
          Set Your First Goal
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(['all', 'active', 'paused', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 font-medium min-h-[44px] border-b-2 transition-colors ${
                filter === filterType
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const isPaused = goal.status === 'paused';
            const isCompleted = goal.status === 'completed';

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isPaused
                    ? 'border-gray-300 dark:border-gray-600 opacity-60'
                    : isCompleted
                    ? 'border-yellow-500 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {/* Zikr name would go here - need to join with zikr data */}
                        Goal #{goal.zikrId}
                      </span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                        {goal.period}
                      </span>
                      {isCompleted && (
                        <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          ✅ Complete
                        </span>
                      )}
                      {isPaused && (
                        <span className="text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          ⏸ Paused
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Target: {goal.target} dhikr
                    </div>
                  </div>

                  {!isPaused && !isCompleted && (
                    <button
                      onClick={() => handlePauseResume(goal)}
                      className="text-sm px-3 py-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg min-h-[44px] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      aria-label={goal.status === 'active' ? 'Pause goal' : 'Resume goal'}
                    >
                      {goal.status === 'active' ? '⏸ Pause' : '▶️ Resume'}
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>{progress.currentCount} dhikr</span>
                    <span>{Math.round(progress.percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-yellow-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {goal.status === 'active' && (
                    <>
                      <button
                        onClick={() => onGoalSelect && onGoalSelect(goal)}
                        className="text-xs px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(goal)}
                        className="text-xs px-3 py-2 border-2 border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg min-h-[44px] hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {goal.status === 'completed' && (
                    <button
                      onClick={() => handleDelete(goal)}
                      className="text-xs px-3 py-2 border-2 border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg min-h-[44px] hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg min-h-[44px] flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Set New Goal
        </button>
      </div>

      <AddGoalModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
}