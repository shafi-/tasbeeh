// Database: zikr-db
// Stores: zikrs, sessions, goals, streaks, settings

export interface Zikr {
  id?: number;
  name: string;
  custom: boolean;
  createdAt: Date;
  deletedAt?: Date;
}

export interface Session {
  id?: number;
  zikrId: number;
  count: number;
  source: 'app' | 'manual' | 'physical';
  timestamp: Date;
  date: Date;
}

export interface Goal {
  id?: number;
  zikrId: number;
  targetCount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
}

export interface Streak {
  zikrId: number;
  currentStreak: number;
  longestStreak: number;
  lastProcessedDate: Date;
}

export interface Setting {
  key: string;
  value: any;
}
