/**
 * GoalFormModal Component (V2)
 * Modal for creating and editing goals
 */

import React, { useState, useEffect } from 'react';
import MaterialIcon from './MaterialIcon';
import { goalService } from '../../core/services/goalService';
import { Goal } from '../../core/db/types';
import { useZikrStore } from '../../core/stores/zikrStore';
import { getZikrDisplayInfo } from '../utils/zikrMapping';
import { useI18n } from '../../core/i18n';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editGoal?: Goal | null;
}

interface FormErrors {
  zikrId?: string;
  target?: string;
  period?: string;
}

const PERIOD_OPTIONS = [
  { value: 'daily', labelKey: 'goalForm.periodDaily', descriptionKey: 'goalForm.periodDailyDesc' },
  { value: 'weekly', labelKey: 'goalForm.periodWeekly', descriptionKey: 'goalForm.periodWeeklyDesc' },
  { value: 'monthly', labelKey: 'goalForm.periodMonthly', descriptionKey: 'goalForm.periodMonthlyDesc' },
  { value: 'custom', labelKey: 'goalForm.periodCustom', descriptionKey: 'goalForm.periodCustomDesc' },
] as const;

const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editGoal,
}) => {
  const { lang, t } = useI18n();
  const zikrs = useZikrStore(state => state.zikrs);

  const [selectedZikrId, setSelectedZikrId] = useState<number | null>(null);
  const [target, setTarget] = useState('');
  const [period, setPeriod] = useState<Goal['period']>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens or editGoal changes
  useEffect(() => {
    if (isOpen) {
      if (editGoal) {
        setSelectedZikrId(editGoal.zikrId);
        setTarget(editGoal.target.toString());
        setPeriod(editGoal.period);
        setStartDate(editGoal.startDate ? formatDate(editGoal.startDate) : '');
        setEndDate(editGoal.endDate ? formatDate(editGoal.endDate) : '');
      } else {
        // Default to first zikr if available
        if (zikrs.length > 0) {
          setSelectedZikrId(zikrs[0].id || null);
        }
        setTarget('33');
        setPeriod('daily');
        setStartDate('');
        setEndDate('');
      }
      setErrors({});
    }
  }, [isOpen, editGoal, zikrs]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isSaving]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedZikrId) {
      newErrors.zikrId = t('zikrForm.select');
    }

    if (!target.trim()) {
      newErrors.target = t('goalForm.targetRequired');
    } else {
      const targetNum = parseInt(target, 10);
      if (isNaN(targetNum) || targetNum < 1 || targetNum > 10000) {
        newErrors.target = t('goalForm.targetRange');
      }
    }

    // Validate date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        newErrors.period = t('goalForm.dateOrder');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const targetNum = parseInt(target, 10);
      const goalData = {
        zikrId: selectedZikrId!,
        target: targetNum,
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: editGoal?.status || 'active',
        createdAt: editGoal?.createdAt || new Date(),
        completedAt: editGoal?.completedAt,
      };

      if (editGoal) {
        // Update existing goal
        await goalService.update(editGoal.id!, goalData);
      } else {
        // Create new goal
        await goalService.add(goalData);
      }

      // Close modal and refresh
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert(t('goalForm.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {editGoal ? t('goalForm.editTitle') : t('goalForm.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            aria-label="Close"
          >
            <MaterialIcon icon="close" className="text-[24px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Zikr Selection */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">
              {t('goalForm.selectZikr')}
            </label>
            <select
              value={selectedZikrId || ''}
              onChange={(e) => setSelectedZikrId(Number(e.target.value))}
              className={`w-full bg-surface-container-low border ${
                errors.zikrId ? 'border-error' : 'border-outline-variant/50'
              } rounded-xl px-4 h-touch-target-min font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors`}
              disabled={isSaving}
            >
              <option value="">{t('progress.selectZikr')}</option>
              {zikrs.map((zikr) => {
                const displayInfo = getZikrDisplayInfo(zikr.name, lang);
                return (
                  <option key={zikr.id} value={zikr.id}>
                    {zikr.name} - {displayInfo.translation}
                  </option>
                );
              })}
            </select>
            {errors.zikrId && (
              <p className="font-caption text-caption text-error mt-2">{errors.zikrId}</p>
            )}
          </div>

          {/* Target Count */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">
              {t('goalForm.targetCount')}
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={t('goalForm.targetPlaceholder')}
              min={1}
              max={10000}
              className={`w-full bg-surface-container-low border ${
                errors.target ? 'border-error' : 'border-outline-variant/50'
              } rounded-xl px-4 h-touch-target-min font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors`}
              disabled={isSaving}
            />
            {errors.target && (
              <p className="font-caption text-caption text-error mt-2">{errors.target}</p>
            )}
            <p className="font-caption text-caption text-on-surface-variant mt-2">
              {t('goalForm.targetHint')}
            </p>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">
              {t('goalForm.frequency')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    period === option.value
                      ? 'border-primary bg-primary-container/20'
                      : 'border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <p className="font-label-md text-label-md text-on-surface">
                    {t(option.labelKey)}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {t(option.descriptionKey)}
                  </p>
                </button>
              ))}
            </div>
            {errors.period && (
              <p className="font-caption text-caption text-error mt-2">{errors.period}</p>
            )}
          </div>

          {/* Optional Date Range */}
          <div className="bg-surface-container-low rounded-xl p-4">
            <p className="font-label-md text-label-md text-on-surface mb-4">
              {t('goalForm.dateRange')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-caption text-caption text-on-surface-variant mb-2">
                  {t('goalForm.startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl px-3 h-10 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block font-caption text-caption text-on-surface-variant mb-2">
                  {t('goalForm.endDate')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl px-3 h-10 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary-container/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MaterialIcon icon="info" className="text-primary text-[20px] mt-0.5" />
              <div>
                <p className="font-body-md text-body-md text-on-surface">
                  {t('goalForm.infoTitle')}
                </p>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  {t('goalForm.infoBody')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-touch-target-min rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
              disabled={isSaving}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 h-touch-target-min rounded-xl font-label-md text-label-md bg-primary-container text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              <MaterialIcon icon={editGoal ? 'save' : 'add_circle'} className="text-[18px]" />
              {isSaving ? t('progress.saving') : editGoal ? t('zikrForm.saveChanges') : t('goalForm.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalFormModal;
