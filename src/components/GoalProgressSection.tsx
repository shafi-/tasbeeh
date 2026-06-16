import { GoalProgressList } from './GoalProgressList';

export function GoalProgressSection() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Goal Progress
        </h2>
      </div>

      <GoalProgressList />
    </div>
  );
}