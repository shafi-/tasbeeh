import { db } from '../db/db';
import { Session } from '../db/types';
import { formatDate } from '../utils/dateUtils';

export async function addSession(session: Omit<Session, 'id'>): Promise<number> {
  const id = await db.sessions.add(session);
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function updateSession(id: number, session: Partial<Session>): Promise<number> {
  return await db.sessions.update(id, session);
}

export async function deleteSession(id: number): Promise<void> {
  await db.sessions.delete(id);
}

export async function getSessionById(id: number): Promise<Session | undefined> {
  return await db.sessions.get(id);
}

export async function getAllSessions(): Promise<Session[]> {
  return await db.sessions.toArray();
}

export async function getSessionsByZikr(zikrId: number): Promise<Session[]> {
  return await db.sessions.where('zikrId').equals(zikrId).toArray();
}

export async function getSessionsByDate(date: Date): Promise<Session[]> {
  const dateStr = formatDate(date);
  return await db.sessions.where('date').equals(dateStr).toArray();
}

export async function getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  return await db.sessions.where('date').between(startDateStr, endDateStr).toArray();
}
