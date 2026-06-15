import Dexie, { Table } from 'dexie';
import { Zikr, Session, Goal, Streak, Setting } from './types';

export class ZikrDatabase extends Dexie {
  zikrs!: Table<Zikr>;
  sessions!: Table<Session>;
  goals!: Table<Goal>;
  streaks!: Table<Streak>;
  settings!: Table<Setting>;

  constructor() {
    super('zikr-db');
    this.version(1).stores({
      zikrs: '++id, name, custom, createdAt, deletedAt',
      sessions: '++id, zikrId, date, [zikrId+date]',
      goals: '++id, zikrId, status',
      streaks: 'zikrId',
      settings: 'key'
    });
  }
}

export const db = new ZikrDatabase();
