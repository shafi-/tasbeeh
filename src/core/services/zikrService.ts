import { db } from '../db/db';
import { Zikr } from '../db/types';

export async function add(zikr: Omit<Zikr, 'id'>): Promise<number> {
  // Reject names that already exist on a live (non-deleted) zikr — duplicate
  // rows would later be collapsed by the seed dedupe, orphaning child data.
  const nameKey = zikr.name.trim().toLowerCase();
  const all = await db.zikrs.toArray();
  const isDuplicate = all.some(
    z => !z.deletedAt && z.name.trim().toLowerCase() === nameKey
  );
  if (isDuplicate) {
    throw new Error('DUPLICATE_ZIKR');
  }
  const id = await db.zikrs.add(zikr);
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function update(id: number, zikr: Partial<Zikr>): Promise<number> {
  return await db.zikrs.update(id, zikr);
}

export async function softDelete(id: number): Promise<void> {
  await db.zikrs.update(id, { deletedAt: new Date() });
}

export async function hardDelete(id: number): Promise<void> {
  await db.transaction('rw', db.zikrs, db.sessions, db.goals, db.streaks, async () => {
    await db.zikrs.delete(id);
    await db.sessions.where('zikrId').equals(id).delete();
    // Goals reference zikrs via the zikrIds array — only remove goals that
    // are solely about this zikr; multi-zikr goals just lose one entry.
    const goals = await db.goals.toArray();
    const soleZikrGoalIds: number[] = [];
    for (const goal of goals) {
      const ids = goal.zikrIds ?? [];
      if (!ids.includes(id)) continue;
      if (ids.length === 1) {
        if (goal.id != null) soleZikrGoalIds.push(goal.id);
      } else {
        await db.goals.update(goal.id!, {
          zikrIds: ids.filter(z => z !== id),
        });
      }
    }
    await db.goals.bulkDelete(soleZikrGoalIds);
    await db.streaks.delete(id);
  });
}

export async function deleteZikr(id: number): Promise<void> {
  await db.zikrs.delete(id);
}

export async function getZikrById(id: number): Promise<Zikr | undefined> {
  return await db.zikrs.get(id);
}

export async function getAllZikrs(): Promise<Zikr[]> {
  return await db.zikrs.toArray();
}

export async function getCustomZikrs(): Promise<Zikr[]> {
  return await db.zikrs.filter(zikr => zikr.custom === true).toArray();
}

export async function getPredefinedZikrs(): Promise<Zikr[]> {
  return await db.zikrs.filter(zikr => zikr.custom === false).toArray();
}

// Service export
export const zikrService = {
  add,
  update,
  softDelete,
  hardDelete,
  deleteZikr,
  getZikrById,
  getAllZikrs,
  getCustomZikrs,
  getPredefinedZikrs
};
