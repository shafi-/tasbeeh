/**
 * Validation utilities for user inputs
 */

/**
 * Validate zikr name
 * @param name - The zikr name to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateZikrName(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'Zikr name is required';
  }

  if (name.length > 50) {
    return 'Zikr name must be 50 characters or less';
  }

  // Only letters, spaces, and hyphens allowed
  const validPattern = /^[a-zA-Z\s\-]+$/;
  if (!validPattern.test(name)) {
    return 'Zikr name can only contain letters, spaces, and hyphens';
  }

  return '';
}

/**
 * Check if zikr name is duplicate
 * @param name - The zikr name to check
 * @param existingNames - Array of existing zikr names
 * @returns True if duplicate exists
 */
export function isDuplicateZikrName(name: string, existingNames: string[]): boolean {
  return existingNames.some(existing =>
    existing.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Validate session count
 * @param count - The count to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateCount(count: number): string {
  if (isNaN(count) || count <= 0) {
    return 'Count must be greater than 0';
  }

  if (count > 10000) {
    return 'Count cannot exceed 10,000';
  }

  return '';
}