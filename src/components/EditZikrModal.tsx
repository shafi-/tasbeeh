import { useState, useEffect } from 'react';
import { useZikrStore } from '../core/stores/zikrStore';
import { zikrService } from '../core/services/zikrService';
import { Zikr } from '../core/db/types';
import { validateZikrName, isDuplicateZikrName } from '../utils/validation';

interface EditZikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  zikr: Zikr;
}

export function EditZikrModal({ isOpen, onClose, zikr }: EditZikrModalProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with current zikr name
  useEffect(() => {
    if (isOpen) {
      setName(zikr.name);
      setError('');
    }
  }, [isOpen, zikr]);

  const validate = () => {
    // Check required
    const validationError = validateZikrName(name);
    if (validationError) {
      setError(validationError);
      return false;
    }

    // Check duplicates (exclude current zikr)
    const existingNames = zikrs
      .filter(z => z.id !== zikr.id)
      .map(z => z.name);

    if (isDuplicateZikrName(name, existingNames)) {
      setError('A zikr with this name already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await zikrService.update(zikr.id!, {
        name: name.trim()
      });

      // Success - close modal
      onClose();
    } catch (err) {
      setError('Failed to update zikr. Please try again.');
      console.error('Error updating zikr:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && name.trim() && name !== zikr.name) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasChanges = name.trim() !== zikr.name;

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
        aria-labelledby="edit-zikr-title"
      >
        <h2 id="edit-zikr-title" className="text-xl font-bold mb-4">Edit Zikr</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="zikr-name" className="block text-sm font-medium mb-2">
              Zikr Name
            </label>
            <input
              id="zikr-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder={zikr.name}
              maxLength={50}
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              disabled={loading}
              autoFocus
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-sm ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {error || 'Letters, spaces, and hyphens only'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {name.length}/50
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !hasChanges || !name.trim()}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}