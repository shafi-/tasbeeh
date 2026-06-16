import { describe, it, expect } from 'vitest';
import { calculateTodayTotal, calculateTodayBreakdown, calculateWeeklyData } from '../../src/utils/progressUtils';
import { Session } from '../../src/core/db/types';
import { getWeekStart } from '../../src/utils/dateUtils';

function makeSession(date: Date, count: number, zikrId = 1, id = 1): Session {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const now = new Date();
  return {
    id,
    zikrId,
    count,
    source: 'app',
    timestamp: date,
    date: midnight,
    editableUntil: new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
}

const today = new Date();
today.setHours(12, 0, 0, 0);

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

describe('calculateTodayTotal', () => {
  it('returns 0 when no sessions today', () => {
    expect(calculateTodayTotal([makeSession(yesterday, 100)])).toBe(0);
  });

  it('sums all sessions for today', () => {
    const sessions = [makeSession(today, 33), makeSession(today, 67)];
    expect(calculateTodayTotal(sessions)).toBe(100);
  });

  it('ignores sessions from other days', () => {
    const sessions = [makeSession(today, 50), makeSession(yesterday, 100)];
    expect(calculateTodayTotal(sessions)).toBe(50);
  });
});

describe('calculateTodayBreakdown', () => {
  const zikrs = [
    { id: 1, name: 'SubhanAllah' },
    { id: 2, name: 'Alhamdulillah' },
  ];

  it('groups sessions by zikr for today', () => {
    const sessions = [
      makeSession(today, 33, 1, 1),
      makeSession(today, 67, 1, 2),
      makeSession(today, 100, 2, 3),
    ];
    const breakdown = calculateTodayBreakdown(sessions, zikrs);
    const zikr1 = breakdown.find(b => b.zikrId === 1);
    const zikr2 = breakdown.find(b => b.zikrId === 2);
    expect(zikr1?.count).toBe(100);
    expect(zikr2?.count).toBe(100);
  });

  it('excludes sessions from other days', () => {
    const sessions = [makeSession(yesterday, 500, 1, 1)];
    const breakdown = calculateTodayBreakdown(sessions, zikrs);
    expect(breakdown).toHaveLength(0);
  });

  it('uses fallback name for unknown zikr', () => {
    const sessions = [makeSession(today, 10, 99, 1)];
    const breakdown = calculateTodayBreakdown(sessions, zikrs);
    expect(breakdown[0].zikrName).toContain('99');
  });
});

describe('calculateWeeklyData', () => {
  it('always returns 7 entries (Mon–Sun)', () => {
    const data = calculateWeeklyData([]);
    expect(data).toHaveLength(7);
  });

  it('labels days Mon through Sun in order', () => {
    const data = calculateWeeklyData([]);
    expect(data[0].dayLabel).toBe('Mon');
    expect(data[6].dayLabel).toBe('Sun');
  });

  it('marks exactly one day as today', () => {
    const data = calculateWeeklyData([]);
    const todayEntries = data.filter(d => d.isToday);
    expect(todayEntries).toHaveLength(1);
  });

  it('accumulates session counts for the correct day', () => {
    const monday = getWeekStart(today);
    monday.setHours(10, 0, 0, 0);
    const sessions = [makeSession(monday, 33, 1, 1), makeSession(monday, 67, 1, 2)];
    const data = calculateWeeklyData(sessions);
    expect(data[0].total).toBe(100); // Monday is index 0
  });

  it('shows 0 for days with no sessions', () => {
    const data = calculateWeeklyData([]);
    expect(data.every(d => d.total === 0)).toBe(true);
  });
});
