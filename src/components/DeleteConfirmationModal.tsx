import { useState } from 'react';
import { zikrService } from '../core/services/zikrService';
import { Zikr } from '../core/db/types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  zikr: Zikr;
}

type DeleteOption = 'keep' | 'delete-all';

export function DeleteConfirmationModal({ isOpen, onClose, zikr }: DeleteConfirmationModalProps) {
  const [option, setOption] = useState<DeleteOption>('keep');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      if (option === 'keep') {
        // Soft delete - set deletedAt timestamp
        await zikrService.softDelete(zikr.id!);
      } else {
        // Hard delete - cascade delete
        await zikrService.hardDelete(zikr.id!);
      }

      // Success - close modal
      onClose();
    } catch (err) {
      setError('Failed to delete zikr. Please try again.');
      console.error('Error deleting zikr:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-zikr-title"
      >
        <h2 id="delete-zikr-title" className="text-xl font-bold mb-4">Delete Zikr?</h2>

        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            What should we do with your sessions for <strong>{zikr.name}</strong>?
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="delete-option"
                value="keep"
                checked={option === 'keep'}
                onChange={() => setOption('keep')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Keep sessions (recommended)</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your sessions will be preserved, but the zikr will be hidden
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
              <input
                type="radio"
                name="delete-option"
                value="delete-all"
                checked={option === 'delete-all'}
                onChange={() => setOption('delete-all')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Delete all data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete the zikr and all related sessions, goals, and streaks
                </div>
              </div>
            </label>
          </div>

          {option === 'delete-all' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3">
              <div className="flex gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This will permanently delete all data associated with this zikr. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium min-h-[44px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}