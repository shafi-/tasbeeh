import { Session } from '../../../core/db/types';
import { SessionCard } from './SessionCard';
import { useZikrStore } from '../../../core/stores/zikrStore';

interface SessionGroupProps {
  title: string;
  sessions: Session[];
  expanded: boolean;
  onToggle: () => void;
  onEdit: (sessionId: number) => void;
  onDelete: (sessionId: number) => void;
}

export function SessionGroup({ title, sessions, expanded, onToggle, onEdit, onDelete }: SessionGroupProps) {
  const zikrs = useZikrStore(state => state.zikrs);

  const getZikrName = (zikrId: number): string => {
    const zikr = zikrs.find(z => z.id === zikrId);
    return zikr?.name || 'Unknown Zikr';
  };

  const getZikrDeleted = (zikrId: number): boolean => {
    const zikr = zikrs.find(z => z.id === zikrId);
    return zikr?.deletedAt ? true : false;
  };

  if (sessions.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({sessions.length} {sessions.length === 1 ? 'session' : 'sessions'})
          </span>
        </div>
      </button>

      {/* Group content */}
      {expanded && (
        <div className="mt-2 space-y-2">
          {sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              zikrName={getZikrName(session.zikrId)}
              zikrDeleted={getZikrDeleted(session.zikrId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}