import { useState, useEffect } from 'react';
import { SessionRow as SessionRowType } from '../../../core/db/types';
import { sessionService } from '../../../core/services/sessionService';
import { formatDate, formatTime } from '../../../core/utils/dateUtils';

interface SessionRowProps {
  row: SessionRowType;
  index: number;
  mode: 'single' | 'bulk';
  bulkMode: 'multi-zikr' | 'quick-repeat';
  showRemove: boolean;
  onUpdate: (updates: Partial<SessionRowType>) => void;
  onRemove: () => void;
  zikrOptions: Array<{ id?: number; name: string }>;
}

export function SessionRow({ row, index, mode, bulkMode, showRemove, onUpdate, onRemove, zikrOptions }: SessionRowProps) {
  const [lastCount, setLastCount] = useState(0);

  // Load smart defaults when zikr changes
  useEffect(() => {
    if (row.zikrId) {
      const loadLastCount = async () => {
        try {
          const count = await sessionService.getLastCount(parseInt(row.zikrId));
          setLastCount(count);
          // Auto-fill count if empty and last count exists
          if (row.count === 0 && count > 0) {
            onUpdate({ count });
          }
        } catch (error) {
          console.error('Failed to load last count:', error);
        }
      };
      loadLastCount();
    }
  }, [row.zikrId]);

  const handleZikrChange = (zikrId: string) => {
    onUpdate({ zikrId });
  };

  const handleCountChange = (count: number) => {
    onUpdate({ count });
  };

  const handleDateChange = (date: Date) => {
    onUpdate({ timestamp: date });
  };

  const handleTimeChange = (time: Date) => {
    const newTimestamp = new Date(row.timestamp);
    newTimestamp.setHours(time.getHours());
    newTimestamp.setMinutes(time.getMinutes());
    newTimestamp.setSeconds(0);
    onUpdate({ timestamp: newTimestamp });
  };

  // Quick Repeat mode: single zikr selector at top
  if (bulkMode === 'quick-repeat' && index === 0 && mode === 'bulk') {
    return (
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Zikr</label>
            <select
              value={row.zikrId}
              onChange={(e) => handleZikrChange(e.target.value)}
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                row.errors.zikrId
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
              aria-label="Select zikr"
            >
              <option value="">Select a zikr</option>
              {zikrOptions.map(zikr => (
                <option key={zikr.id || zikr.name} value={zikr.id || ''}>
                  {zikr.name}
                </option>
              ))}
            </select>
            {row.errors.zikrId && (
              <p className="text-red-500 text-sm mt-1" role="alert">{row.errors.zikrId}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multi-Zikr mode or single mode: full row
  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {/* Zikr dropdown (hide in Quick Repeat mode after first row) */}
        {!(bulkMode === 'quick-repeat' && index > 0 && mode === 'bulk') && (
          <div className="flex-1 min-w-0">
            <label htmlFor={`zikr-${index}`} className="block text-sm font-medium mb-2">
              Zikr
            </label>
            <select
              id={`zikr-${index}`}
              value={row.zikrId}
              onChange={(e) => handleZikrChange(e.target.value)}
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                row.errors.zikrId
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              disabled={row.valid === false}
              aria-label="Select zikr"
            >
              <option value="">Select a zikr</option>
              {zikrOptions.map(zikr => (
                <option key={zikr.id || zikr.name} value={zikr.id || ''}>
                  {zikr.name}
                </option>
              ))}
            </select>
            {lastCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last: {lastCount}
              </p>
            )}
            {row.errors.zikrId && (
              <p className="text-red-500 text-sm mt-1" role="alert">{row.errors.zikrId}</p>
            )}
          </div>
        )}

        {/* Count input */}
        <div className="w-32">
          <label htmlFor={`count-${index}`} className="block text-sm font-medium mb-2">
            Count
          </label>
          <input
            id={`count-${index}`}
            type="number"
            value={row.count || ''}
            onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
            min="1"
            max="10000"
            placeholder="Count"
            className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
              row.errors.count
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            disabled={row.valid === false}
            aria-label="Session count"
          />
          {row.errors.count && (
            <p className="text-red-500 text-sm mt-1" role="alert">{row.errors.count}</p>
          )}
        </div>

        {/* Date/Time picker */}
        <div className="flex-1">
          <label htmlFor={`date-${index}`} className="block text-sm font-medium mb-2">
            Date & Time
          </label>
          <div className="flex gap-2">
            <input
              id={`date-${index}`}
              type="date"
              value={formatDate(row.timestamp)}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="flex-1 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={row.valid === false}
              aria-label="Session date"
            />
            <input
              type="time"
              value={formatTime(row.timestamp)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours));
                newTime.setMinutes(parseInt(minutes));
                handleTimeChange(newTime);
              }}
              className="w-28 p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={row.valid === false}
              aria-label="Session time"
            />
          </div>
          {row.errors.timestamp && (
            <p className="text-red-500 text-sm mt-1" role="alert">{row.errors.timestamp}</p>
          )}
        </div>

        {/* Remove button (bulk mode only) */}
        {showRemove && (
          <div className="flex items-end">
            <button
              onClick={onRemove}
              className="p-3 text-red-600 hover:text-red-700 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Remove session row"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Validation errors */}
      {Object.values(row.errors).length > 0 && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded" role="alert">
          <p className="text-sm text-red-700 dark:text-red-300">
            Please fix the errors above
          </p>
        </div>
      )}
    </div>
  );
}