import { db } from '../db/db';
import { Streak } from '../db/types';
import { formatDate, daysBetween } from '../utils/dateUtils';

export async function getStreak(zikrId: number): Promise<Streak | undefined> {
  return await db.streaks.get(zikrId);
}

export async function getAllStreaks(): Promise<Streak[]> {
  return await db.streaks.toArray();
}

export async function updateStreak(zikrId: number, sessionDate: Date): Promise<Streak> {
  const existing = await getStreak(zikrId);
  const sessionDateFormatted = formatDate(sessionDate);

  let currentStreak = existing?.currentStreak || 0;
  let longestStreak = existing?.longestStreak || 0;
  let lastProcessedDate = existing?.lastProcessedDate || new Date(0);

  const lastProcessedFormatted = formatDate(lastProcessedDate);
  const daysSince = daysBetween(lastProcessedDate, sessionDate);

  if (sessionDateFormatted !== lastProcessedFormatted) {
    if (daysSince > 1) {
      currentStreak = 0;
    } else if (daysSince === 1) {
      currentStreak++;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    lastProcessedDate = sessionDate;
  }

  const streak: Streak = {
    zikrId,
    currentStreak,
    longestStreak,
    lastProcessedDate
  };

  await db.streaks.put(streak);
  return streak;
}

export async function resetStreak(zikrId: number): Promise<void> {
  const streak: Streak = {
    zikrId,
    currentStreak: 0,
    longestStreak: 0,
    lastProcessedDate: new Date(0)
  };

  await db.streaks.put(streak);
}
