import { db } from '../db/db';
import { Zikr } from '../db/types';

export async function add(zikr: Omit<Zikr, 'id'>): Promise<number> {
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
    await db.goals.where('zikrId').equals(id).delete();
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

// Legacy exports for backward compatibility
export const addZikr = add;
export const updateZikr = update;
