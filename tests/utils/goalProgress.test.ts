import { describe, it, expect } from 'vitest';
import { calculateProgress } from '../../src/core/services/goalService';
import { Goal, Session } from '../../src/core/db/types';

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

function makeSession(date: Date, count: number, overrides: Partial<Session> = {}): Session {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const now = new Date();
  return {
    id: 1,
    zikrId: 1,
    count,
    source: 'app',
    timestamp: date,
    date: midnight,
    editableUntil: new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const YESTERDAY = new Date(TODAY);
YESTERDAY.setDate(TODAY.getDate() - 1);

describe('calculateProgress — daily goal', () => {
  it('counts only today\'s sessions', () => {
    const goal = makeGoal({ target: 100, period: 'daily' });
    const sessions = [
      makeSession(new Date(TODAY), 33),
      makeSession(new Date(TODAY), 67),
      makeSession(YESTERDAY, 50), // yesterday — should be excluded
    ];
    const progress = calculateProgress(goal, sessions);
    expect(progress.currentCount).toBe(100);
    expect(progress.target).toBe(100);
  });

  it('percentage reaches 100 when target met', () => {
    const goal = makeGoal({ target: 100, period: 'daily' });
    const sessions = [makeSession(new Date(TODAY), 100)];
    const progress = calculateProgress(goal, sessions);
    expect(progress.percentage).toBe(100);
  });

  it('percentage is capped at 100 when target exceeded', () => {
    const goal = makeGoal({ target: 100, period: 'daily' });
    const sessions = [makeSession(new Date(TODAY), 150)];
    const progress = calculateProgress(goal, sessions);
    expect(progress.percentage).toBe(100);
  });

  it('percentage is 0 when no sessions today', () => {
    const goal = makeGoal({ target: 100, period: 'daily' });
    const progress = calculateProgress(goal, [makeSession(YESTERDAY, 100)]);
    expect(progress.percentage).toBe(0);
    expect(progress.currentCount).toBe(0);
  });

  it('returns partial percentage for partial progress', () => {
    const goal = makeGoal({ target: 200, period: 'daily' });
    const sessions = [makeSession(new Date(TODAY), 50)];
    const progress = calculateProgress(goal, sessions);
    expect(progress.percentage).toBe(25);
  });
});

describe('calculateProgress — custom period goal', () => {
  const START = new Date(2026, 5, 1); // June 1
  const END = new Date(2026, 5, 30); // June 30

  it('counts sessions within the custom range', () => {
    const goal = makeGoal({
      period: 'custom',
      startDate: START,
      endDate: END,
      target: 1000,
    });
    const june5 = new Date(2026, 5, 5, 10, 0, 0);
    const june5midnight = new Date(2026, 5, 5, 0, 0, 0);
    const sessions = [
      makeSession(june5, 500, { date: june5midnight }),
      makeSession(new Date(2026, 6, 1, 10, 0, 0), 200, { date: new Date(2026, 6, 1) }), // July — excluded
    ];
    const progress = calculateProgress(goal, sessions);
    expect(progress.currentCount).toBe(500);
  });

  it('excludes sessions before the custom range start', () => {
    const goal = makeGoal({
      period: 'custom',
      startDate: START,
      endDate: END,
      target: 100,
    });
    const may31 = new Date(2026, 4, 31, 10, 0, 0);
    const may31midnight = new Date(2026, 4, 31, 0, 0, 0);
    const progress = calculateProgress(goal, [
      makeSession(may31, 100, { date: may31midnight }),
    ]);
    expect(progress.currentCount).toBe(0);
  });
});
