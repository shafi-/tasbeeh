/**
 * Progress calculation utilities
 */

import { Session } from '../core/db/types';
import { formatDate, getToday, getWeekStart } from './dateUtils';

export interface Breakdown {
  zikrId: number;
  zikrName: string;
  count: number;
}

export interface DailyData {
  date: Date;
  total: number;
  isToday: boolean;
  dayLabel: string;
}

/**
 * Calculate total dhikr count for today
 */
export function calculateTodayTotal(sessions: Session[]): number {
  const todayStr = formatDate(getToday());

  return sessions
    .filter(session => formatDate(session.date) === todayStr)
    .reduce((sum, session) => sum + session.count, 0);
}

/**
 * Get today's sessions (helper function for efficiency)
 */
function getTodaySessions(sessions: Session[]): Session[] {
  const todayStr = formatDate(getToday());
  return sessions.filter(session => formatDate(session.date) === todayStr);
}

/**
 * Calculate breakdown by zikr for today
 */
export function calculateTodayBreakdown(sessions: Session[], zikrs: any[]): Breakdown[] {
  const todaySessions = getTodaySessions(sessions);

  const breakdownMap = new Map<number, number>();

  todaySessions.forEach(session => {
    const current = breakdownMap.get(session.zikrId) || 0;
    breakdownMap.set(session.zikrId, current + session.count);
  });

  return Array.from(breakdownMap.entries()).map(([zikrId, count]) => {
    const zikr = zikrs.find(z => z.id === zikrId);
    return {
      zikrId,
      zikrName: zikr ? zikr.name : `Zikr #${zikrId}`,
      count
    };
  });
}

/**
 * Calculate weekly data for chart rendering
 */
export function calculateWeeklyData(sessions: Session[]): DailyData[] {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData: DailyData[] = [];

  // Get Monday of current week using centralized utility
  const monday = getWeekStart(getToday());
  const todayStr = formatDate(getToday());

  // Generate 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);

    const dayStr = formatDate(currentDay);
    const isToday = dayStr === todayStr;

    const daySessions = sessions.filter(session => formatDate(session.date) === dayStr);
    const total = daySessions.reduce((sum, session) => sum + session.count, 0);

    weeklyData.push({
      date: currentDay,
      total,
      isToday,
      dayLabel: dayLabels[i]
    });
  }

  return weeklyData;
}