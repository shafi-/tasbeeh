import { useState, useEffect } from 'react';
import { useZikrStore } from '../core/stores/zikrStore';
import { goalService } from '../core/services/goalService';
import { validateCount } from '../utils/validation';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  zikrId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number;
  startDate?: Date;
  endDate?: Date;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const [formData, setFormData] = useState<FormData>({
    zikrId: '',
    period: 'daily',
    target: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Don't render if not open
  if (!isOpen) return null;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        zikrId: '',
        period: 'daily',
        target: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.zikrId) {
      newErrors.zikrId = 'Please select a zikr';
    }

    const targetError = validateCount(formData.target);
    if (targetError) {
      newErrors.target = targetError;
    }

    if (formData.period === 'custom') {
      if (!formData.startDate || isNaN(formData.startDate.getTime())) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate || isNaN(formData.endDate.getTime())) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await goalService.add({
        zikrId: parseInt(formData.zikrId),
        period: formData.period,
        target: formData.target,
        startDate: formData.period === 'custom' ? formData.startDate : undefined,
        endDate: formData.period === 'custom' ? formData.endDate : undefined,
        status: 'active',
        createdAt: new Date()
      });

      // Success - close modal
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to create goal. Please try again.' });
      console.error('Error creating goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && formData.zikrId && formData.target > 0) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const activeZikrs = zikrs.filter(z => !z.deletedAt);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-goal-title"
      >
        <h2 id="add-goal-title" className="text-xl font-bold mb-4">Set Goal</h2>

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

          {/* Period Selection */}
          <div>
            <label htmlFor="period-select" className="block text-sm font-medium mb-2">
              Period
            </label>
            <select
              id="period-select"
              value={formData.period}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  period: e.target.value as 'daily' | 'weekly' | 'monthly' | 'custom'
                });
              }}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={loading}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Target Input */}
          <div>
            <label htmlFor="target-input" className="block text-sm font-medium mb-2">
              Target (dhikr)
            </label>
            <input
              id="target-input"
              type="number"
              value={formData.target || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData({ ...formData, target: value });
                setErrors({ ...errors, target: '' });
              }}
              min="1"
              max="10000"
              placeholder="Enter target"
              className={`w-full p-3 border-2 rounded-lg min-h-[44px] ${
                errors.target
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              disabled={loading}
            />
            {errors.target && (
              <p className="text-red-500 text-sm mt-1">{errors.target}</p>
            )}
          </div>

          {/* Date Range (Custom only) */}
          {formData.period === 'custom' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      startDate: new Date(e.target.value)
                    });
                    setErrors({ ...errors, startDate: '' });
                  }}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="end-date" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      endDate: new Date(e.target.value)
                    });
                    setErrors({ ...errors, endDate: '' });
                  }}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[44px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          )}

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
                  Creating...
                </>
              ) : (
                'Set Goal'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}