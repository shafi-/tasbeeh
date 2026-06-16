import { db } from '../db/db';
import { Goal, Session } from '../db/types';
import { getPeriodStart, getPeriodEnd } from '../../utils/goalUtils';

export interface Progress {
  currentCount: number;
  target: number;
  percentage: number;
}

export async function add(goal: Omit<Goal, 'id'>): Promise<number> {
  const id = await db.goals.add(goal);
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function update(id: number, goal: Partial<Goal>): Promise<number> {
  return await db.goals.update(id, goal);
}

export async function updateStatus(goalId: number, status: 'active' | 'paused' | 'completed'): Promise<void> {
  await db.goals.update(goalId, { status });
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

export function getGoalsByZikr(zikrId: number): Promise<Goal[]> {
  return db.goals.where('zikrId').equals(zikrId).toArray();
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

export function calculateProgress(goal: Goal, sessions: Session[]): Progress {
  const startDate = goal.period === 'custom' && goal.startDate
    ? new Date(goal.startDate)
    : getPeriodStart(goal.period as any);

  const endDate = goal.period === 'custom' && goal.endDate
    ? new Date(goal.endDate)
    : getPeriodEnd(goal.period as any);

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  const currentCount = filteredSessions.reduce((sum, session) => sum + session.count, 0);
  const percentage = Math.min((currentCount / goal.target) * 100, 100);

  return {
    currentCount,
    target: goal.target,
    percentage
  };
}

export async function checkCompletion(zikrId: number): Promise<void> {
  const goals = await getGoalsByZikr(zikrId);

  for (const goal of goals) {
    if (goal.status !== 'active') continue;

    const allSessions = await db.sessions
      .where('zikrId')
      .equals(zikrId)
      .toArray();

    const progress = calculateProgress(goal, allSessions);

    if (progress.currentCount >= goal.target) {
      await update(goal.id!, {
        status: 'completed',
        completedAt: new Date()
      });

      // Could trigger celebration here
      console.log(`🎉 Goal reached for zikr ${zikrId}!`);
    }
  }
}

// Service export
export const goalService = {
  add,
  update,
  updateStatus,
  delete: deleteGoal,
  getGoalById,
  getAllGoals,
  getGoalsByZikr,
  getActiveGoals,
  getCompletedGoals,
  getPausedGoals,
  calculateProgress,
  checkCompletion
};

// Legacy exports for backward compatibility
export const addGoal = add;
export const updateGoal = update;
