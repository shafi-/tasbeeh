// DB-backed tests for the goal business rules that touch IndexedDB.
// fake-indexeddb provides an in-memory IndexedDB implementation, so these
// run the real Dexie schema (created directly at the latest version).
import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';

import { db } from '../../../src/core/db/db';
import { goalService } from '../../../src/core/services/goalService';
import { zikrService } from '../../../src/core/services/zikrService';
import { Goal, Session } from '../../../src/core/db/types';

async function seedSession(zikrId: number, count: number, date = new Date()): Promise<Session> {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  const id = await db.sessions.add({
    zikrId,
    count,
    source: 'app',
    timestamp: date,
    date: midnight,
    editableUntil: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return (await db.sessions.get(id))!;
}

function makeGoal(overrides: Partial<Goal> = {}): Omit<Goal, 'id'> {
  return {
    zikrIds: [1],
    target: 10,
    period: 'daily',
    status: 'active',
    createdAt: new Date(),
    ...overrides,
  };
}

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('zikrService.add — duplicate guard', () => {
  it('rejects an exact duplicate name', async () => {
    await zikrService.add({ name: 'SubhanAllah', custom: false, createdAt: new Date() });
    await expect(
      zikrService.add({ name: 'SubhanAllah', custom: false, createdAt: new Date() })
    ).rejects.toThrow('DUPLICATE_ZIKR');
  });

  it('rejects case/whitespace variants of an existing name', async () => {
    await zikrService.add({ name: 'My Zikr', custom: true, createdAt: new Date() });
    await expect(
      zikrService.add({ name: '  my zikr ', custom: true, createdAt: new Date() })
    ).rejects.toThrow('DUPLICATE_ZIKR');
  });

  it('allows reusing the name of a soft-deleted zikr', async () => {
    const zikr = await zikrService.add({ name: 'Old Name', custom: true, createdAt: new Date() });
    await zikrService.softDelete(zikr);
    const id = await zikrService.add({ name: 'Old Name', custom: true, createdAt: new Date() });
    expect(id).toBeGreaterThan(0);
  });
});

describe('goalService — multi-zikr goals', () => {
  it('finds goals by any zikr they cover', async () => {
    await db.goals.add(makeGoal({ zikrIds: [1, 2] }));
    await db.goals.add(makeGoal({ zikrIds: [3] }));

    const forOne = await goalService.getGoalsByZikr(1);
    const forThree = await goalService.getGoalsByZikr(3);
    const forFour = await goalService.getGoalsByZikr(4);

    expect(forOne).toHaveLength(1);
    expect(forOne[0].zikrIds).toEqual([1, 2]);
    expect(forThree).toHaveLength(1);
    expect(forFour).toHaveLength(0);
  });

  it('completes a multi-zikr goal when combined counts reach the target', async () => {
    await db.goals.add(makeGoal({ zikrIds: [1, 2], target: 10 }));
    await seedSession(1, 6);
    await seedSession(2, 4);

    // A session on either covered zikr triggers the recalculation
    const latest = await seedSession(2, 1);
    await goalService.recalculateGoalForSession(latest, 'add');

    const goal = (await db.goals.toArray())[0];
    expect(goal.status).toBe('completed');
    expect(goal.completedAt).toBeTruthy();
  });

  it('reactivates a completed goal when progress falls back below target', async () => {
    await db.goals.add(makeGoal({ zikrIds: [1, 2], target: 10 }));
    await seedSession(1, 6);
    const second = await seedSession(2, 5);
    const goalId = (await db.goals.toArray())[0].id!;
    await db.goals.update(goalId, { status: 'completed', completedAt: new Date() });

    // An edit/deletion drops progress to 6/10 — goal must reactivate
    await db.sessions.delete(second.id!);
    await goalService.recalculateGoalForSession(second, 'delete');

    const goal = await db.goals.get(goalId);
    expect(goal!.status).toBe('active');
    expect(goal!.completedAt).toBeUndefined();
  });
});

describe('zikrService.hardDelete — multi-zikr goal handling', () => {
  it('removes the zikr from a multi-zikr goal without deleting the goal', async () => {
    const goalId = await db.goals.add(makeGoal({ zikrIds: [1, 2] }));
    await db.zikrs.add({ id: 1, name: 'A', custom: false, createdAt: new Date() });
    await db.zikrs.add({ id: 2, name: 'B', custom: false, createdAt: new Date() });

    await zikrService.hardDelete(1);

    const goal = await db.goals.get(goalId);
    expect(goal).toBeTruthy();
    expect(goal!.zikrIds).toEqual([2]);
  });

  it('deletes a goal that only covered the removed zikr', async () => {
    const goalId = await db.goals.add(makeGoal({ zikrIds: [1] }));
    await db.zikrs.add({ id: 1, name: 'A', custom: false, createdAt: new Date() });

    await zikrService.hardDelete(1);

    expect(await db.goals.get(goalId)).toBeUndefined();
    expect(await db.zikrs.get(1)).toBeUndefined();
  });

  it('removes the deleted zikr sessions', async () => {
    await db.zikrs.add({ id: 1, name: 'A', custom: false, createdAt: new Date() });
    await seedSession(1, 5);

    await zikrService.hardDelete(1);

    expect(await db.sessions.where('zikrId').equals(1).count()).toBe(0);
  });
});
