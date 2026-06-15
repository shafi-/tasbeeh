import { db } from '../db/db';
import { Goal } from '../db/types';

export async function addGoal(goal: Omit<Goal, 'id'>): Promise<number> {
  const id = await db.goals.add(goal);
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function updateGoal(id: number, goal: Partial<Goal>): Promise<number> {
  return await db.goals.update(id, goal);
}

export async function deleteGoal(id: number): Promise<void> {
  await db.goals.delete(id);
}

export async function getGoalById(id: number): Promise<Goal | undefined> {
  return await db.goals.get(id);
}

export async function getAllGoals(): Promise<Goal[]> {
  return await db.goals.toArray();
}

export async function getGoalsByZikr(zikrId: number): Promise<Goal[]> {
  return await db.goals.where('zikrId').equals(zikrId).toArray();
}

export async function getActiveGoals(): Promise<Goal[]> {
  return await db.goals.where('status').equals('active').toArray();
}

export async function getCompletedGoals(): Promise<Goal[]> {
  return await db.goals.where('status').equals('completed').toArray();
}

export async function getPausedGoals(): Promise<Goal[]> {
  return await db.goals.where('status').equals('paused').toArray();
}

export async function calculateGoalProgress(goalId: number): Promise<{
  current: number;
  target: number;
  percentage: number;
}> {
  const goal = await getGoalById(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }

  const sessions = await db.sessions
    .where('zikrId')
    .equals(goal.zikrId)
    .toArray();

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const startDate = new Date(goal.startDate);
    const endDate = goal.endDate ? new Date(goal.endDate) : new Date();

    return sessionDate >= startDate && sessionDate <= endDate;
  });

  const current = filteredSessions.reduce((sum, session) => sum + session.count, 0);
  const percentage = Math.round((current / goal.targetCount) * 100);

  return {
    current,
    target: goal.targetCount,
    percentage
  };
}
