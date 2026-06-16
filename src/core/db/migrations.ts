import { db } from './db';
import { seedZikrs } from './seed';
import { Session } from './types';
import type { Transaction } from 'dexie';

export interface MigrationProgress {
  currentVersion: number;
  targetVersion: number;
  progress: number;
  status: 'running' | 'complete' | 'failed';
}

// NEW (v2): v1 → v2 migration progress tracking
export interface V2MigrationProgress {
  current: number;
  total: number;
  phase: string;
}

export async function runMigrations(): Promise<MigrationProgress> {
  const progress: MigrationProgress = {
    currentVersion: 0,
    targetVersion: 1,
    progress: 0,
    status: 'running'
  };

  try {
    const startTime = Date.now();

    await db.transaction('rw', db.zikrs, db.sessions, db.goals, db.streaks, db.settings, async () => {
      progress.currentVersion = 1;
      progress.progress = 50;

      const count = await db.zikrs.count();
      if (count === 0) {
        await seedZikrs(db);
        progress.progress = 75;
      }

      progress.progress = 100;
      progress.status = 'complete';
    });

    const elapsed = Date.now() - startTime;
    if (elapsed > 100) {
      console.log(`Migration completed in ${elapsed}ms`);
    }

  } catch (error) {
    progress.status = 'failed';
    console.error('Migration failed, rolled back to previous version:', error);
    throw new Error('Migration failed. Please refresh the app to try again.');
  }

  return progress;
}

// NEW (v2): Migrate database from v1 to v2
export async function migrateToV2(
  transaction: Transaction
): Promise<void> {
  // Use the provided transaction (design review feedback)
  const sessions = transaction.table<Session>('sessions');
  const allSessions = await sessions.toArray();
  const total = allSessions.length;

  // Per-session error handling
  let migrated = 0;
  let errors = 0;

  for (const session of allSessions) {
    try {
      const timestamp = session.timestamp || session.date || new Date();

      await sessions.update(session.id!, {
        editableUntil: addDays(timestamp, 3),  // 3-day edit window
        source: session.source || 'app',       // Default to 'app'
        createdAt: timestamp,
        updatedAt: timestamp
      });

      migrated++;
    } catch (error) {
      console.error(`Failed to migrate session ${session.id}:`, error);
      errors++;
    }
  }

  // NEW (design review feedback): Verification step
  try {
    const unmigrated = await sessions.where('editableUntil').equals(undefined as any).count();
    if (unmigrated > 0) {
      console.warn(`Migration incomplete: ${unmigrated} sessions missing editableUntil field`);
    } else {
      console.log(`Migration verification complete: All ${total} sessions migrated successfully`);
    }
  } catch (error) {
    console.error('Migration verification failed:', error);
  }

  console.log(`Migration v1→v2 complete: ${migrated} succeeded, ${errors} failed`);
}

// NEW (v2): Check if migration is needed
export async function needsMigration(): Promise<boolean> {
  const version = await db.verno;
  return version < 2;
}

// NEW (v2): Get migration progress for UI display
export async function getMigrationProgress(): Promise<V2MigrationProgress> {
  const version = await db.verno;
  if (version >= 2) {
    return { current: 0, total: 0, phase: 'complete' };
  }

  const sessions = await db.sessions.toArray();
  return {
    current: 0,
    total: sessions.length,
    phase: 'pending'
  };
}

// Helper function for date arithmetic (reuse existing pattern)
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
