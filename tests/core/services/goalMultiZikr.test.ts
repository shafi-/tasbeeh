import { describe, it, expect } from 'vitest';
import { calculateProgress, getGoalZikrIds } from '../../../src/core/services/goalService';
import { Goal, Session } from '../../../src/core/db/types';

// Helpers to build minimal fixture objects without touching the DB
function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    zikrIds: [1],
    target: 100,
    period: 'daily',
    status: 'active',
    createdAt: new Date(),
    ...overrides,
  };
}

function makeSession(zikrId: number, date: Date, count: number): Session {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return {
    id: zikrId * 1000 + count,
    zikrId,
    count,
    source: 'app',
    timestamp: date,
    date: midnight,
    editableUntil: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('getGoalZikrIds', () => {
  it('returns the zikrIds array', () => {
    expect(getGoalZikrIds(makeGoal({ zikrIds: [3, 7] }))).toEqual([3, 7]);
  });

  it('is defensive against rows missing the field', () => {
    expect(getGoalZikrIds({ ...makeGoal(), zikrIds: undefined as any })).toEqual([]);
  });
});

describe('calculateProgress — multi-zikr goals', () => {
  const today = new Date();

  it('combines counts across every zikr the goal covers', () => {
    const goal = makeGoal({ zikrIds: [1, 2], target: 100 });
    const sessions = [
      makeSession(1, today, 30),
      makeSession(2, today, 45),
    ];
    expect(calculateProgress(goal, sessions).currentCount).toBe(75);
  });

  it('ignores sessions of zikrs outside the goal', () => {
    const goal = makeGoal({ zikrIds: [1, 2], target: 100 });
    const sessions = [
      makeSession(1, today, 30),
      makeSession(2, today, 45),
      makeSession(9, today, 500), // unrelated zikr
    ];
    expect(calculateProgress(goal, sessions).currentCount).toBe(75);
  });

  it('caps the percentage at 100 across combined zikrs', () => {
    const goal = makeGoal({ zikrIds: [1, 2], target: 100 });
    const sessions = [
      makeSession(1, today, 80),
      makeSession(2, today, 80),
    ];
    expect(calculateProgress(goal, sessions).percentage).toBe(100);
  });

  it('counts only the current daily period', () => {
    const goal = makeGoal({ zikrIds: [1, 2], target: 100 });
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sessions = [
      makeSession(1, today, 30),
      makeSession(2, yesterday, 70), // yesterday — outside today's period
    ];
    expect(calculateProgress(goal, sessions).currentCount).toBe(30);
  });

  it('respects the custom date range across zikrs', () => {
    const start = new Date(2026, 8, 1);
    const end = new Date(2026, 8, 10);
    const goal = makeGoal({
      zikrIds: [1, 2],
      target: 100,
      period: 'custom',
      startDate: start,
      endDate: end,
    });
    const within = new Date(2026, 8, 5);
    const before = new Date(2026, 7, 31);
    const sessions = [
      makeSession(1, within, 40),
      makeSession(2, within, 20),
      makeSession(1, before, 90), // before the window
    ];
    expect(calculateProgress(goal, sessions).currentCount).toBe(60);
  });
});
