// Database: zikr-db
// Stores: zikrs, sessions, goals, streaks, settings, sessionFormState, zikrLastCount

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
  editableUntil: Date;     // NEW (v2): timestamp + 3 days
  createdAt: Date;         // NEW (v2): Session creation timestamp
  updatedAt: Date;         // NEW (v2): Last edit timestamp
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

// NEW (v2): Session input for create operations
export interface SessionInput {
  zikrId: number;
  count: number;
  timestamp: Date;
}

// NEW (v2): Session update for edit operations
export interface SessionUpdate {
  zikrId?: number;
  count?: number;
  timestamp?: Date;
  updatedAt: Date;
}

// NEW (v2): Session row for form state management
export interface SessionRow {
  zikrId: string;                   // String for form binding (converted to number on save)
  count: number;
  timestamp: Date;
  valid: boolean;                   // Validation state
  errors: Record<string, string>;   // Field-level errors
}

// NEW (v2): Bulk save result
export interface BulkResult {
  success: number;                  // Successfully saved sessions
  failed: number;                   // Failed sessions
  errors: Array<{                  // Error details for failed sessions
    index: number;
    session: SessionInput;
    error: string;
  }>;
  stateId?: number;                 // State ID for interrupted saves
  completed: boolean;               // Save completion status
}

// NEW (v2): Progressive save state management
export interface SessionFormState {
  id?: number;                      // Auto-increment primary key
  sessions: SessionInput[];         // Array of sessions to save
  currentIndex: number;             // Current chunk position
  createdAt: Date;                  // State creation timestamp
  totalSessions: number;            // Total sessions to save
}

// NEW (v2): Smart defaults - last count per zikr
export interface ZikrLastCount {
  zikrId: number;                   // Zikr ID (primary key)
  count: number;                    // Last used count for this zikr
  updatedAt: Date;                  // Last update timestamp
}
