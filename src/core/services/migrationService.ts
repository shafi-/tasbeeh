import { db } from '../db/db';
import { seedZikrs } from '../db/seed';

export interface MigrationProgress {
  currentVersion: number;
  targetVersion: number;
  progress: number;
  status: 'running' | 'complete' | 'failed';
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
