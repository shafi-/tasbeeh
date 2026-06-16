import { useEffect } from 'react';
import { useSessionHistoryStore } from '../../../core/stores/sessionHistoryStore';
import { SessionGroup } from './SessionGroup';
import { sessionService } from '../../../core/services/sessionService';
import { useNavigate } from 'react-router-dom';

export function SessionHistoryList() {
  const { sessions, groupedByDate, loading, error, loadSessions, toggleGroup } = useSessionHistoryStore();
  const navigate = useNavigate();

  useEffect(() => {
    const cleanupPromise = loadSessions();
    return () => {
      cleanupPromise.then(unsubscribe => unsubscribe?.());
    };
  }, [loadSessions]);

  const handleEdit = (sessionId: number) => {
    // Navigate to session entry form with edit mode
    navigate('/sessions/edit', { state: { sessionId } });
  };

  const handleDelete = async (sessionId: number) => {
    try {
      await sessionService.deleteSession(sessionId);
      // liveQuery will automatically update the list
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Failed to Load Sessions
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={() => loadSessions()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg min-h-[44px]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📿</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Sessions Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start practicing to track your progress
        </p>
        <button
          onClick={() => navigate('/sessions/new')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
        >
          Add Your First Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pull-to-refresh indicator could go here */}

      {/* Session groups */}
      {Object.entries(groupedByDate).map(([key, group]) => (
        <SessionGroup
          key={key}
          title={group.title}
          sessions={group.sessions}
          expanded={group.expanded}
          onToggle={() => toggleGroup(key)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}