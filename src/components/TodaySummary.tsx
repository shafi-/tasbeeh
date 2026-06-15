interface BreakdownItem {
  zikrId: number;
  zikrName: string;
  count: number;
}

interface TodaySummaryProps {
  total: number;
  breakdown: BreakdownItem[];
}

export function TodaySummary({ total, breakdown }: TodaySummaryProps) {
  if (total === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-400">No sessions yet today</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Start practicing to see your progress
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Today's Summary
      </h2>

      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {total}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          total dhikr today
        </p>
      </div>

      {breakdown.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Breakdown by zikr:
          </h3>
          {breakdown.map((item) => (
            <div
              key={item.zikrId}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {item.zikrName}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}