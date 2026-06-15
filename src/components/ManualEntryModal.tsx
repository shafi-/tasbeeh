import { useState, useEffect } from 'react';
import { useZikrStore } from '../core/stores/zikrStore';
import { sessionService } from '../core/services/sessionService';
import { validateCount } from '../utils/validation';
import { combineDateTime } from '../core/utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  zikrId: string;
  count: number;
  date: Date;
  time: Date;
}

export function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    zikrId: '',
    count: 0,
    date: new Date(),
    time: new Date()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Check for empty zikr list
  useEffect(() => {
    const activeZikrs = zikrs.filter(z => !z.deletedAt);
    if (activeZikrs.length === 0) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
      // Auto-select first zikr if available
      if (activeZikrs.length > 0 && !formData.zikrId) {
        setFormData(prev => ({ ...prev, zikrId: String(activeZikrs[0].id!) }));
      }
    }
  }, [zikrs, formData.zikrId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        zikrId: '',
        count: 0,
        date: new Date(),
        time: new Date()
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.zikrId) {
      newErrors.zikrId = 'Please select a zikr';
    }

    const countError = validateCount(formData.count);
    if (countError) {
      newErrors.count = countError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const timestamp = combineDateTime(formData.date, formData.time);

      await sessionService.add({
        zikrId: parseInt(formData.zikrId),
        count: formData.count,
        source: 'manual',
        timestamp,
        date: formData.date
      });

      // Streak automatically updated by sessionService

      // Success - close modal and navigate to progress
      onClose();
      // Optionally navigate to progress screen
      // navigate('/progress');
    } catch (err) {
      setErrors({ submit: 'Failed to save session. Please try again.' });
      console.error('Error saving session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (showEmptyState) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
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
            className="w-full mt-3 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const activeZikrs = zikrs.filter(z => !z.deletedAt);

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
        aria-labelledby="manual-entry-title"
      >
        <h2 id="manual-entry-title" className="text-xl font-bold mb-4">Log Session</h2>

        <div className="space-y-4">
          {/* Zikr Selection */}
          <div>
            <label htmlFor="zikr-select" className="block text-sm font-medium mb-2">
              Zikr
            </label>
            <select
              id="zikr-select"
              value={formData.zikrId}
              onChange={(e) => {
                setFormData({ ...formData, zikrId: e.target.value });
                setErrors({ ...errors, zikrId: '' });
              }}
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                errors.zikrId
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              disabled={loading}
            >
              <option value="">Select a zikr</option>
              {activeZikrs.map(zikr => (
                <option key={zikr.id} value={zikr.id}>
                  {zikr.name}
                </option>
              ))}
            </select>
            {errors.zikrId && (
              <p className="text-red-500 text-sm mt-1">{errors.zikrId}</p>
            )}
          </div>

          {/* Count Input */}
          <div>
            <label htmlFor="count-input" className="block text-sm font-medium mb-2">
              Count
            </label>
            <input
              id="count-input"
              type="number"
              value={formData.count || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData({ ...formData, count: value });
                setErrors({ ...errors, count: '' });
              }}
              min="1"
              max="10000"
              placeholder="Enter count"
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                errors.count
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              disabled={loading}
            />
            {errors.count && (
              <p className="text-red-500 text-sm mt-1">{errors.count}</p>
            )}
          </div>

          {/* Date Input */}
          <div>
            <label htmlFor="date-input" className="block text-sm font-medium mb-2">
              Date
            </label>
            <input
              id="date-input"
              type="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  date: new Date(e.target.value)
                });
              }}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={loading}
            />
          </div>

          {/* Time Input */}
          <div>
            <label htmlFor="time-input" className="block text-sm font-medium mb-2">
              Time
            </label>
            <input
              id="time-input"
              type="time"
              value={formData.time.toTimeString().substring(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours));
                newTime.setMinutes(parseInt(minutes));
                setFormData({ ...formData, time: newTime });
              }}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={loading}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
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
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Session'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}