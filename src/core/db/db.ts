import Dexie, { Table } from 'dexie';
import { Zikr, Session, Goal, Streak, Setting, SessionFormState, ZikrLastCount } from './types';

export class ZikrDatabase extends Dexie {
  zikrs!: Table<Zikr>;
  sessions!: Table<Session>;
  goals!: Table<Goal>;
  streaks!: Table<Streak>;
  settings!: Table<Setting>;
  sessionFormState!: Table<SessionFormState>;  // NEW (v2)
  zikrLastCount!: Table<ZikrLastCount>;        // NEW (v2)

  constructor() {
    super('zikr-db');

    // Version 1 (existing)
    this.version(1).stores({
      zikrs: '++id, name, custom, createdAt, deletedAt',
      sessions: '++id, zikrId, date, [zikrId+date]',
      goals: '++id, zikrId, status',
      streaks: 'zikrId',
      settings: 'key'
    });

    // Version 2 (NEW - Epic 6)
    this.version(2).stores({
      zikrs: '++id, name, custom, createdAt, deletedAt',
      sessions: '++id, zikrId, date, editableUntil, [zikrId+date]',  // ADDED editableUntil
      goals: '++id, zikrId, status',
      streaks: 'zikrId',
      settings: 'key',
      sessionFormState: '++id, createdAt',           // NEW
      zikrLastCount: 'zikrId, updatedAt'            // NEW
    }).upgrade(async (tx) => {
      // Migration logic handled by migrationService
      const { migrateToV2 } = await import('../services/migrationService');
      await migrateToV2(tx);
    });
  }
}

export const db = new ZikrDatabase();
