import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, daysBetween, isToday, isYesterday, combineDateTime } from '../../../src/core/utils/dateUtils';

// Pin a stable reference date: Wednesday 2026-06-10 14:30:00
const REF = new Date(2026, 5, 10, 14, 30, 0); // month is 0-indexed

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDate(REF)).toBe('2026-06-10');
  });

  it('zero-pads single-digit months and days', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('formatTime', () => {
  it('formats hours and minutes with zero-padding', () => {
    expect(formatTime(new Date(2026, 5, 10, 8, 5))).toBe('08:05');
  });

  it('formats afternoon time correctly', () => {
    expect(formatTime(REF)).toBe('14:30');
  });
});

describe('daysBetween', () => {
  it('returns 0 for same day', () => {
    const d = new Date(2026, 5, 10, 0, 0, 0);
    expect(daysBetween(d, d)).toBe(0);
  });

  it('returns 1 for consecutive days', () => {
    const day1 = new Date(2026, 5, 10, 0, 0, 0);
    const day2 = new Date(2026, 5, 11, 0, 0, 0);
    expect(daysBetween(day1, day2)).toBe(1);
  });

  it('returns negative when date2 is earlier than date1', () => {
    const day1 = new Date(2026, 5, 11, 0, 0, 0);
    const day2 = new Date(2026, 5, 10, 0, 0, 0);
    expect(daysBetween(day1, day2)).toBe(-1);
  });

  it('handles multi-day gaps', () => {
    const day1 = new Date(2026, 5, 1);
    const day2 = new Date(2026, 5, 8);
    expect(daysBetween(day1, day2)).toBe(7);
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    expect(isToday(today)).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('isYesterday', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    expect(isYesterday(yesterday)).toBe(true);
  });

  it('returns false for today', () => {
    expect(isYesterday(new Date())).toBe(false);
  });
});

describe('combineDateTime', () => {
  it('merges date from date param and time from time param', () => {
    const date = new Date(2026, 5, 15, 0, 0, 0);
    const time = new Date(2026, 0, 1, 9, 30, 0);
    const result = combineDateTime(date, time);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });
});
