/**
 * Date utility functions for consistent date handling
 */

/**
 * Get today's date with time set to midnight
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Format a date as YYYY-MM-DD for consistent string representation
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(getToday());
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = (day + 6) % 7; // Days since last Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
