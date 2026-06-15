import { db } from '../db/db';
import { Zikr } from '../db/types';

export async function addZikr(zikr: Omit<Zikr, 'id'>): Promise<number> {
  const id = await db.zikrs.add(zikr);
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function updateZikr(id: number, zikr: Partial<Zikr>): Promise<number> {
  return await db.zikrs.update(id, zikr);
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
