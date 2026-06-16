import { useState } from 'react';

interface DailyData {
  date: Date;
  total: number;
  isToday: boolean;
  dayLabel: string;
}

interface WeeklyChartProps {
  data: DailyData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const maxCount = Math.max(...data.map(d => d.total), 1);

  const handleBarClick = (index: number) => {
    setSelectedBar(index);
  };

  const handleBarTouchEnd = (index: number) => {
    setSelectedBar(index);
    setTimeout(() => setSelectedBar(null), 3000);
  };

  return (
    <div className="weekly-chart">
      <div className="bars-container flex gap-2 h-32 items-end">
        {data.map((day, index) => {
          const barHeight = Math.max((day.total / maxCount) * 120, 4);
          const isSelected = selectedBar === index;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`bar rounded-t cursor-pointer transition-all ${
                  day.isToday
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                } ${isSelected ? 'opacity-80' : ''}`}
                style={{ height: `${barHeight}px`, minHeight: '4px', width: '24px' }}
                onClick={() => handleBarClick(index)}
                onTouchEnd={() => handleBarTouchEnd(index)}
                aria-label={`${day.dayLabel}: ${day.total} dhikr`}
                role="button"
                tabIndex={0}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {day.dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      {selectedBar !== null && (
        <div className="tooltip mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {data[selectedBar].dayLabel}: {data[selectedBar].total} dhikr
        </div>
      )}
    </div>
  );
}