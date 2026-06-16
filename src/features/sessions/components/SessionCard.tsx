import { Session } from '../../../core/db/types';
import { sessionService } from '../../../core/services/sessionService';
import { formatDate, formatTime, isToday, isYesterday } from '../../../core/utils/dateUtils';
import { useState } from 'react';

interface SessionCardProps {
  session: Session;
  zikrName: string;
  zikrDeleted?: boolean;
  onEdit: (sessionId: number) => void;
  onDelete: (sessionId: number) => void;
}

export function SessionCard({ session, zikrName, zikrDeleted, onEdit, onDelete }: SessionCardProps) {
  const [isEditable, setIsEditable] = useState(false);

  // Check editability on mount
  useState(() => {
    sessionService.isEditable(session.id!).then(editable => {
      setIsEditable(editable);
    });
  });

  const getSourceBadge = () => {
    switch (session.source) {
      case 'app':
        return '📱 App';
      case 'manual':
        return '✏️ Manual';
      case 'physical':
        return '📿 Physical';
      default:
        return '';
    }
  };

  const getRelativeTime = () => {
    if (isToday(session.timestamp)) return 'Today';
    if (isYesterday(session.timestamp)) return 'Yesterday';
    return formatDate(session.timestamp);
  };

  const handleEdit = () => {
    onEdit(session.id!);
  };

  const handleDelete = () => {
    if (confirm('Delete this session?')) {
      onDelete(session.id!);
    }
  };

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border ${
      zikrDeleted ? 'border-gray-300 dark:border-gray-600 opacity-60' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Zikr name with deleted indicator */}
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
              zikrDeleted ? 'text-gray-500 dark:text-gray-400' : ''
            }`}>
              {zikrName}
              {zikrDeleted && <span className="text-xs">(deleted)</span>}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              {getSourceBadge()}
            </span>
          </div>

          {/* Count and time */}
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{session.count} dhikr</span>
            <span>•</span>
            <span>{getRelativeTime()}</span>
            <span>•</span>
            <span>{formatTime(session.timestamp)}</span>
          </div>
        </div>

        {/* Action buttons (if editable) */}
        {isEditable && !zikrDeleted ? (
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:text-blue-700 min-h-[44px] min-w-[44px] rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label="Edit session"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 min-h-[44px] min-w-[44px] rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Delete session"
            >
              🗑️
            </button>
          </div>
        ) : (
          <div className="ml-4 text-xs text-gray-400 dark:text-gray-500 text-center min-w-[44px]">
            <span className="block">View only</span>
          </div>
        )}
      </div>
    </div>
  );
}