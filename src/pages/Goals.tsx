import { useState } from 'react';
import { GoalList } from '../components/GoalList';
import { AddGoalModal } from '../components/AddGoalModal';

export function Goals() {
  const [showAddGoal, setShowAddGoal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <div className="max-w-mobile-container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Goals
          </h1>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] transition-colors"
            aria-label="Add new goal"
          >
            + Add Goal
          </button>
        </div>

        <GoalList />

        {showAddGoal && (
          <AddGoalModal isOpen={showAddGoal} onClose={() => setShowAddGoal(false)} />
        )}
      </div>
    </div>
  );
}
