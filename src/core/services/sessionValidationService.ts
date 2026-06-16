import { SessionRow } from '../db/types';

/**
 * Session Validation Service
 * Provides synchronous validation for session inputs
 * All validation < 50ms performance target
 */

export function validateCount(value: number): string | null {
  if (isNaN(value) || value <= 0) {
    return 'Count must be greater than 0';
  }

  if (value > 10000) {
    return 'Count cannot exceed 10,000';
  }

  return null;
}

export function validateDateTime(value: Date): string | null {
  if (!value || isNaN(value.getTime())) {
    return 'Please select a valid date and time';
  }

  // Warning for future dates (not an error)
  const now = new Date();
  if (value > now) {
    return '⚠️ This session is in the future';
  }

  return null;
}

export function validateRow(row: SessionRow): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // Validate zikrId
  if (!row.zikrId || row.zikrId === '') {
    errors.zikrId = 'Please select a zikr';
  }

  // Validate count
  const countError = validateCount(row.count);
  if (countError) {
    errors.count = countError;
  }

  // Validate timestamp
  const dateTimeError = validateDateTime(row.timestamp);
  if (dateTimeError && !dateTimeError.startsWith('⚠️')) {
    errors.timestamp = dateTimeError;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export const sessionValidationService = {
  validateCount,
  validateDateTime,
  validateRow
};