import { useState, useEffect } from 'react';
import { useSessionFormStore } from '../../../core/stores/sessionFormStore';
import { sessionService } from '../../../core/services/sessionService';
import { progressiveSaveService } from '../../../core/services/progressiveSaveService';
import { SessionRow } from './SessionRow';
import { useZikrStore } from '../../../core/stores/zikrStore';
import { useNavigate } from 'react-router-dom';

interface SessionEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSessionId?: number;
}

export function SessionEntryForm({ isOpen, onClose, editSessionId }: SessionEntryFormProps) {
  const navigate = useNavigate();
  const { mode, bulkMode, rows, isSaving, saveProgress, errors, setMode, setBulkMode, addRow, removeRow, updateRow, setSaving, setSaveProgress, setErrors, reset, loadSessionForEdit } = useSessionFormStore();
  const zikrs = useZikrStore(state => state.zikrs);

  const [showInterruptedSavePrompt, setShowInterruptedSavePrompt] = useState(false);

  // Filter active zikrs (not deleted)
  const activeZikrs = zikrs.filter(z => !z.deletedAt);

  // Load session for editing
  useEffect(() => {
    if (editSessionId) {
      loadSessionForEdit(editSessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSessionId]); // loadSessionForEdit is stable from Zustand store

  // Check for interrupted save on mount
  useEffect(() => {
    const checkInterruptedSave = async () => {
      if (isOpen && !editSessionId) {
        const stateId = await progressiveSaveService.hasInterruptedSave();
        if (stateId) {
          setShowInterruptedSavePrompt(true);
        }
      }
    };

    checkInterruptedSave();
  }, [isOpen, editSessionId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSave = async () => {
    const isAnyRowInvalid = rows.some(row => !row.valid);
    if (isAnyRowInvalid) {
      return;
    }

    setSaving(true);

    try {
      if (mode === 'single') {
        // Single session save
        const zikrId = parseInt(rows[0].zikrId);
        if (isNaN(zikrId)) {
          setErrors({ submit: 'Invalid zikr selected' });
          return;
        }

        await sessionService.add({
          zikrId,
          count: rows[0].count,
          source: 'manual',
          timestamp: rows[0].timestamp,
          date: rows[0].timestamp,
          editableUntil: new Date(rows[0].timestamp.getTime() + 3 * 24 * 60 * 60 * 1000),  // 3-day edit window
          createdAt: rows[0].timestamp,
          updatedAt: rows[0].timestamp
        });
      } else {
        // Bulk save with NaN validation
        const sessions = rows.map(row => {
          const zikrId = parseInt(row.zikrId);
          if (isNaN(zikrId)) {
            throw new Error(`Invalid zikr ID: ${row.zikrId}`);
          }
          return {
            zikrId,
            count: row.count,
            timestamp: row.timestamp
          };
        });

        const result = await sessionService.addBulkSessions(sessions, (progress) => {
          setSaveProgress(progress);
        });

        if (result.failed > 0) {
          console.error('Some sessions failed to save:', result.errors);
          setErrors({
            submit: `${result.failed} of ${sessions.length} sessions failed to save. Please check your input and try again.`
          });
        }
      }

      // Success
      onClose();
      navigate('/sessions');
    } catch (error) {
      console.error('Save failed:', error);

      // Provide more specific error messages without exposing internals
      let errorMessage = 'Failed to save sessions. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Invalid zikr')) {
          errorMessage = 'Invalid zikr selected. Please choose a valid zikr.';
        } else if (error.message.includes('Count must be')) {
          errorMessage = 'Invalid count. Please enter a number between 1 and 10,000.';
        } else if (error.message.includes('Invalid timestamp')) {
          errorMessage = 'Invalid date or time. Please check your input.';
        } else if (error.message.includes('no longer editable')) {
          errorMessage = 'This session can no longer be edited (3-day window expired).';
        }
      }

      setErrors({ submit: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasUnsavedData = mode === 'bulk' && rows.length > 1;
    if (hasUnsavedData) {
      if (confirm('Discard unsaved sessions?')) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };

  const handleResumeSave = async () => {
    try {
      const stateId = await progressiveSaveService.hasInterruptedSave();
      if (stateId) {
        await progressiveSaveService.resumeInterruptedSave(stateId);
        setShowInterruptedSavePrompt(false);
        onClose();
        navigate('/sessions');
      }
    } catch (error) {
      console.error('Failed to resume save:', error);
    }
  };

  const handleDiscardSave = async () => {
    try {
      const stateId = await progressiveSaveService.hasInterruptedSave();
      if (stateId) {
        await progressiveSaveService.discardInterruptedSave(stateId);
      }
      setShowInterruptedSavePrompt(false);
    } catch (error) {
      console.error('Failed to discard save:', error);
    }
  };

  // Empty zikr list handling
  if (activeZikrs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-center"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="mb-4">
            <span className="text-4xl">📿</span>
          </div>
          <h2 className="text-xl font-bold mb-2">No Zikrs Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a zikr first before logging sessions
          </p>
          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
          >
            Go to Zikrs
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Interrupted save prompt
  if (showInterruptedSavePrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Resume Save?</h2>
          <p className="mb-4">You have an interrupted save. Would you like to resume?</p>
          <div className="flex gap-3">
            <button
              onClick={handleResumeSave}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]"
            >
              Resume
            </button>
            <button
              onClick={handleDiscardSave}
              className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px]"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-entry-title"
      >
        <h2 id="session-entry-title" className="text-xl font-bold mb-4">
          {editSessionId ? 'Edit Session' : (mode === 'single' ? 'Add Session' : 'Add Sessions')}
        </h2>

        {/* Mode toggle */}
        {!editSessionId && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                mode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                mode === 'bulk'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Bulk
            </button>
          </div>
        )}

        {/* Bulk mode toggle */}
        {mode === 'bulk' && !editSessionId && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setBulkMode('multi-zikr')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                bulkMode === 'multi-zikr'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Multi-Zikr
            </button>
            <button
              onClick={() => setBulkMode('quick-repeat')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                bulkMode === 'quick-repeat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Quick Repeat
            </button>
          </div>
        )}

        {/* Session rows */}
        <div className="space-y-3 mb-4">
          {rows.map((row, index) => (
            <SessionRow
              key={index}
              row={row}
              index={index}
              mode={mode}
              bulkMode={bulkMode}
              showRemove={mode === 'bulk'}
              onUpdate={(updates) => updateRow(index, updates)}
              onRemove={() => removeRow(index)}
              zikrOptions={activeZikrs}
            />
          ))}
        </div>

        {/* Add row button (bulk mode) */}
        {mode === 'bulk' && !editSessionId && (
          <button
            onClick={() => addRow()}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] mb-4"
          >
            + Add Session
          </button>
        )}

        {/* Progress bar */}
        {isSaving && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
              Saving... {saveProgress}%
            </p>
          </div>
        )}

        {/* Submit error */}
        {errors.submit && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || rows.some(row => !row.valid)}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              editSessionId ? 'Update' : 'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}