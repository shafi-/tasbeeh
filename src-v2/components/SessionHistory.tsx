/**
 * SessionHistory Component (V2)
 * Displays grouped session history with edit/delete capabilities
 */

import React, { useEffect, useState } from 'react';
import MaterialIcon from './MaterialIcon';
import { useSessionHistoryStore } from '../../src/core/stores/sessionHistoryStore';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { sessionService } from '../../src/core/services/sessionService';
import { formatDate } from '../../src/core/utils/dateUtils';
import { Session } from '../../src/core/db/types';

const EDIT_WINDOW_DAYS = 3;

interface SessionHistoryProps {
  onRefresh?: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onRefresh }) => {
  const { groupedByDate, loading, sessions, loadSessions, toggleGroup } = useSessionHistoryStore();
  const zikrs = useZikrStore(state => state.zikrs);

  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editCount, setEditCount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const canEditSession = (session: Session): boolean => {
    const now = new Date();
    const editableUntil = new Date(session.editableUntil || session.timestamp);
    return now <= editableUntil;
  };

  const handleEdit = (session: Session) => {
    if (!canEditSession(session)) return;
    setEditingSession(session);
    setEditCount(session.count.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;

    const newCount = parseInt(editCount, 10);
    if (isNaN(newCount) || newCount < 1 || newCount > 10000) {
      alert('Please enter a valid count between 1 and 10000');
      return;
    }

    setIsSaving(true);

    try {
      await sessionService.updateSession(editingSession.id!, {
        count: newCount,
        updatedAt: new Date(),
      });

      setEditingSession(null);
      setEditCount('');
      loadSessions(); // Refresh the list
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to update session:', error);
      alert('Failed to update session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditCount('');
  };

  const handleDelete = async (session: Session) => {
    if (!canEditSession(session)) {
      alert('This session can no longer be edited (outside 3-day window)');
      return;
    }

    const zikr = zikrs.find(z => z.id === session.zikrId);
    const zikrName = zikr?.name || 'Unknown zikr';

    const confirmed = confirm(
      `Delete this session?\n\n${zikrName}: ${session.count}x\n${formatDate(session.date)}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSaving(true);

    try {
      await sessionService.deleteSession(session.id!);
      loadSessions(); // Refresh the list
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSourceIcon = (source?: string): string => {
    switch (source) {
      case 'app': return 'touch_app';
      case 'manual': return 'edit_document';
      default: return 'smartphone';
    }
  };

  const getSourceLabel = (source?: string): string => {
    switch (source) {
      case 'app': return 'App';
      case 'manual': return 'Manual';
      default: return 'Physical';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-on-surface-variant">Loading sessions...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <MaterialIcon icon="history" className="text-6xl text-surface-variant mb-4 mx-auto" />
        <h3 className="font-headline-md text-headline-md text-primary mb-2">
          No Sessions Yet
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Complete a dhikr session to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedByDate).map(([groupKey, group]) => {
        if (group.sessions.length === 0) return null;

        return (
          <div key={groupKey} className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(groupKey)}
              className="w-full px-4 py-3 flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3">
                <MaterialIcon
                  icon={group.expanded ? 'expand_more' : 'chevron_right'}
                  className="text-on-surface-variant"
                />
                <span className="font-label-md text-label-md text-on-surface">
                  {group.title}
                </span>
                <span className="font-caption text-caption text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded-full">
                  {group.count}
                </span>
              </div>
            </button>

            {/* Sessions List */}
            {group.expanded && (
              <div className="divide-y divide-outline-variant/10">
                {group.sessions.map((session) => {
                  const zikr = zikrs.find(z => z.id === session.zikrId);
                  const zikrName = zikr?.name || 'Unknown zikr';
                  const editable = canEditSession(session);

                  const isEditing = editingSession?.id === session.id;

                  return (
                    <div
                      key={session.id}
                      className="px-4 py-3 hover:bg-surface-container-low/50 transition-colors"
                    >
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                              {zikrName}
                            </p>
                            <input
                              type="number"
                              value={editCount}
                              onChange={(e) => setEditCount(e.target.value)}
                              min={1}
                              max={10000}
                              className="bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 w-24 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                              autoFocus
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="text-primary p-2 hover:bg-primary-container/20 rounded-lg transition-colors disabled:opacity-50"
                              aria-label="Save"
                            >
                              <MaterialIcon icon="check" className="text-[20px]" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="text-on-surface-variant p-2 hover:bg-surface-variant/50 rounded-lg transition-colors disabled:opacity-50"
                              aria-label="Cancel"
                            >
                              <MaterialIcon icon="close" className="text-[20px]" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Zikr Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-body-md text-body-md text-on-surface truncate">
                                {zikrName}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="font-label-md text-label-md text-primary font-semibold">
                                  {session.count}x
                                </span>
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                  <MaterialIcon icon={getSourceIcon(session.source)} className="text-[14px]" />
                                  <span className="font-caption text-caption">
                                    {getSourceLabel(session.source)}
                                  </span>
                                </div>
                                <span className="font-caption text-caption text-on-surface-variant">
                                  {formatTime(session.timestamp)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            {editable && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(session)}
                                  className="text-primary p-2 hover:bg-primary-container/20 rounded-lg transition-colors"
                                  aria-label={`Edit ${zikrName} session`}
                                >
                                  <MaterialIcon icon="edit" className="text-[18px]" />
                                </button>
                                <button
                                  onClick={() => handleDelete(session)}
                                  className="text-error p-2 hover:bg-error/10 rounded-lg transition-colors"
                                  aria-label={`Delete ${zikrName} session`}
                                >
                                  <MaterialIcon icon="delete" className="text-[18px]" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Info text */}
      <p className="font-caption text-caption text-on-surface-variant text-center">
        Sessions can be edited for {EDIT_WINDOW_DAYS} days after creation
      </p>
    </div>
  );
};

export default SessionHistory;
