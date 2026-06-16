# Artifact: Architecture

## Metadata
- **Type**: architecture
- **Status**: complete
- **Feature**: Epic 6: Advanced Manual Progress Entry
- **Next**: design-review
- **Created**: 2026-06-16

## Overview

Epic 6 establishes comprehensive manual session entry functionality for the Zikr PWA. This architecture design extends the existing codebase with database schema v2, enhanced session services, new UI components for bulk entry, and session history with edit/delete capabilities.

**Key Components:**
- **Database Schema v2**: Extends Session interface with editability tracking and timestamps
- **Service Layer**: Enhanced SessionService with CRUD, ValidationService, ProgressiveSaveService
- **State Management**: New sessionFormStore and sessionHistoryStore with liveQuery integration
- **UI Components**: SessionEntryForm with bulk modes, SessionHistoryList with grouping
- **Integration**: Goals and streaks automatically update on session changes

**Architectural Approach:**
- Extend existing patterns (Dexie.js, Zustand, React components)
- Maintain backward compatibility where possible
- Use progressive enhancement (v1 → v2 migration)
- Offline-first architecture (local-only processing)

## Architectural Decisions

### 1. Database Schema Evolution (v1 → v2)

**Decision**: Extend Session interface rather than create new table
**Rationale**: 
- Sessions are core data entity - extending maintains existing queries
- Migration is simpler (add fields vs migrate data to new table)
- Existing sessionService methods remain compatible
- Edit window applies to all session types (app, manual, physical)

**Trade-off**: All sessions gain editability (even app counter sessions) - intentional decision for consistency

### 2. 3-Day Edit Window Implementation

**Decision**: Store `editableUntil` timestamp (calculated as session timestamp + 3 days)
**Rationale**:
- Efficient query: `editableUntil` index for time-based filtering
- Simple validation: `now < editableUntil` check
- Clear user communication: "Can edit until [date/time]"
- Timezone-aware: Uses local time like other timestamps

**Trade-off**: Sessions become non-editable after fixed window - balances flexibility with data integrity

### 3. Progressive Save Architecture

**Decision**: Always use chunking for 50+ sessions, minimal UI progress bar
**Rationale**:
- Prevents UI blocking during large operations
- Provides resume capability for interrupted saves
- Transparent to users (happens automatically)
- State preservation in IndexedDB (sessionFormState store)

**Trade-off**: Small batches (<50) also use progressive save - intentional for simplicity and consistency

### 4. Bulk Entry Modes Design

**Decision**: Two modes (Multi-Zikr, Quick Repeat) with mode toggle
**Rationale**:
- Multi-Zikr: Handles different zikrs in one session (mosque attendance)
- Quick Repeat: Optimized for same zikr, different counts/times
- Clear separation of use cases reduces complexity
- Mode toggle provides discoverability

**Trade-off**: Two bulk modes may overwhelm casual users - mitigated by progressive disclosure (review feedback)

### 5. Session History Grouping

**Decision**: Time-based grouping (Today, Yesterday, This Week, Older) with expand/collapse
**Rationale**:
- Intuitive navigation for large datasets
- Natural temporal organization (users think in days/weeks)
- Expand/collapse improves performance (render only visible groups)
- "Today" group expanded by default (review feedback incorporated)

**Trade-off**: Fixed group headers limit customization - acceptable for v1 (can enhance later)

### 6. Migration Strategy

**Decision**: Blocking migration with progress indicator and per-session error handling
**Rationale**:
- Ensures data consistency before app interaction
- Progress indicator manages user expectations (review feedback)
- Per-session try-catch preserves data integrity (skip corrupt, continue)
- Estimated time based on session count (review feedback incorporated)

**Trade-off**: Blocks app access during migration - acceptable for one-time upgrade (<5 seconds for 1000 sessions)

## Components

### Database Layer

**Enhanced Database Schema (v2)**
- **File**: `src/core/db/db.ts`
- **Responsibility**: Manage IndexedDB schema, migration v1 → v2, provide typed access
- **Changes**: Add version 2 with new Session fields, migration logic, new stores

**Data Models**
- **Session v2 Interface**: Extended with `editableUntil`, `createdAt`, `updatedAt`
- **New Interfaces**: `SessionInput`, `SessionUpdate`, `SessionRow`, `BulkResult`
- **New Stores**: `sessionFormState`, `zikrLastCount`

**Migration Handler**
- **File**: `src/core/db/migrations.ts`
- **Responsibility**: Execute v1 → v2 migration with progress tracking and error recovery
- **Changes**: Add `migrateToV2()` function with per-session error handling

### Service Layer

**SessionService (Enhanced)**
- **File**: `src/core/services/sessionService.ts`
- **Responsibility**: Full CRUD operations for sessions with validation and integration
- **Changes**: Add `updateSession()`, `deleteSession()`, `isEditable()`, `getLastCount()`, `setLastCount()`
- **Integration**: Triggers goal and streak recalculation on all operations

**SessionValidationService (New)**
- **File**: `src/core/services/sessionValidationService.ts`
- **Responsibility**: Real-time validation for session inputs
- **Methods**: `validateCount()`, `validateDateTime()`, `validateRow()`

**ProgressiveSaveService (New)**
- **File**: `src/core/services/progressiveSaveService.ts`
- **Responsibility**: Chunked save for large batches with state preservation
- **Methods**: `saveInChunks()`, `resumeInterruptedSave()`, `discardInterruptedSave()`

**GoalProgressService (Enhanced)**
- **File**: `src/core/services/goalService.ts`
- **Responsibility**: Recalculate goal progress on session changes
- **Changes**: Add `recalculateForSession()` method

**StreakService (Enhanced)**
- **File**: `src/core/services/streakService.ts`
- **Responsibility**: Update streaks on session changes
- **Changes**: Add `updateForSession()` method with edit/delete handling

### State Management

**sessionFormStore (New)**
- **File**: `src/core/stores/sessionFormStore.ts`
- **Responsibility**: Manage session entry form state (single and bulk modes)
- **State**: mode, bulkMode, rows array, isSaving, saveProgress, errors
- **Actions**: setMode, setBulkMode, addRow, removeRow, updateRow, setSaving, setSaveProgress, reset
- **Persistence**: Auto-save to localStorage every 30 seconds

**sessionHistoryStore (New)**
- **File**: `src/core/stores/sessionHistoryStore.ts`
- **Responsibility**: Manage session history list with reactive updates
- **State**: sessions array, groupedByDate object, loading flag, error state
- **Actions**: loadSessions(), groupByDate(), refresh()
- **Reactive**: Uses Dexie liveQuery for automatic updates

### UI Components

**SessionEntryForm (New)**
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Responsibility**: Container component for session entry (replaces ManualEntryModal)
- **Features**: Mode toggle (single/bulk), bulk mode toggle, smart defaults, error recovery
- **Integration**: Uses sessionFormStore, SessionService, ValidationService

**SessionRow (New)**
- **File**: `src/features/sessions/components/SessionRow.tsx`
- **Responsibility**: Single session row with zikr dropdown, count input, date/time picker
- **Features**: Real-time validation, smart defaults, ARIA labels, keyboard navigation
- **Accessibility**: 44x44px touch targets, screen reader support

**SessionHistoryList (New)**
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Responsibility**: Session history list with grouping and infinite scroll
- **Features**: Pull-to-refresh, time-based grouping, expand/collapse, empty states
- **Integration**: Uses sessionHistoryStore with liveQuery

**SessionCard (New)**
- **File**: `src/features/sessions/components/SessionCard.tsx`
- **Responsibility**: Individual session display with edit/delete controls
- **Features**: Source badge, edit button (if editable), delete button (if editable), view-only mode
- **Accessibility**: ARIA labels, keyboard navigation, touch target compliance

**SessionGroup (New)**
- **File**: `src/features/sessions/components/SessionGroup.tsx`
- **Responsibility**: Collapsible group of sessions with time period header
- **Features**: Expand/collapse, session count badge, sorted by timestamp

**MigrationScreen (New)**
- **File**: `src/features/sessions/components/MigrationScreen.tsx`
- **Responsibility**: Full-screen migration progress with educational content (review feedback)
- **Features**: Progress bar, estimated time, "What's New" explanation, option to defer (if safe)

**SessionHistoryPage (Enhanced)**
- **File**: `src/pages/SessionHistory.tsx` (renamed from Progress.tsx or new file)
- **Responsibility**: Session history page container
- **Integration**: SessionHistoryList, sessionHistoryStore, navigation

## Data Model

### Database Schema v2

```typescript
// Database: zikr-db
// Version: 2 (upgraded from version 1)
// Stores: zikrs, sessions, goals, streaks, settings, sessionFormState, zikrLastCount

// Store: sessions (keyPath: id, autoIncrement: true)
// Indexes: [zikrId, date, editableUntil]
interface Session {
  id?: number;                      // Auto-increment primary key
  zikrId: number;                   // Foreign key to zikrs
  count: number;                    // Session count (1-10000)
  source: 'app' | 'manual' | 'physical';  // Entry source
  timestamp: Date;                  // Combined date + time
  date: Date;                       // Denormalized for querying (YYYY-MM-DD)
  editableUntil: Date;             // timestamp + 3 days (edit window)
  createdAt: Date;                  // Session creation timestamp
  updatedAt: Date;                  // Last edit timestamp
}

// Store: sessionFormState (keyPath: id, autoIncrement: true)
// Purpose: Progressive save state management for interrupted saves
interface SessionFormState {
  id?: number;                      // Auto-increment primary key
  sessions: SessionInput[];         // Array of sessions to save
  currentIndex: number;             // Current chunk position
  createdAt: Date;                  // State creation timestamp
  totalSessions: number;            // Total sessions to save
}

// Store: zikrLastCount (keyPath: zikrId)
// Purpose: Smart defaults - last count per zikr
interface ZikrLastCount {
  zikrId: number;                   // Zikr ID (primary key)
  count: number;                    // Last used count for this zikr
  updatedAt: Date;                  // Last update timestamp
}
```

### TypeScript Interfaces

```typescript
// Session input for create operations
interface SessionInput {
  zikrId: number;
  count: number;
  timestamp: Date;
}

// Session update for edit operations
interface SessionUpdate {
  zikrId?: number;
  count?: number;
  timestamp?: Date;
  updatedAt: Date;  // Required for updates
}

// Session row for form state management
interface SessionRow {
  zikrId: string;                   // String for form binding (converted to number on save)
  count: number;
  timestamp: Date;
  valid: boolean;                   // Validation state
  errors: Record<string, string>;   // Field-level errors
}

// Bulk save result
interface BulkResult {
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
```

### Migration Schema

**v1 → v2 Migration Strategy:**

```typescript
// Migration adds to existing Session records:
1. editableUntil = timestamp + 3 days
2. source = 'app' (default for existing sessions)
3. createdAt = timestamp (or now if timestamp unavailable)
4. updatedAt = timestamp (or now if timestamp unavailable)

// Error handling:
- Per-session try-catch (skip corrupt, continue)
- Log corrupted session IDs
- Show migration progress bar
- Block UI until complete (one-time operation)
```

## API Changes

### SessionService Methods

**Enhanced Methods:**

```typescript
// Existing (unchanged signatures)
add(session: Omit<Session, 'id'>): Promise<number>
getSessionById(id: number): Promise<Session | undefined>
getAllSessions(): Promise<Session[]>
getSessionsByZikr(zikrId: number): Promise<Session[]>
getSessionsByDate(date: Date): Promise<Session[]>
getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]>

// New methods
updateSession(id: number, session: SessionUpdate): Promise<number>
deleteSession(id: number): Promise<void>
isEditable(sessionId: number | Session): Promise<boolean>
getLastCount(zikrId: number): Promise<number>
setLastCount(zikrId: number, count: number): Promise<void>
addBulkSessions(sessions: SessionInput[]): Promise<BulkResult>
```

**Method Signatures:**

```typescript
// Update session (within 3-day window)
async function updateSession(
  id: number, 
  session: SessionUpdate
): Promise<number>

// Delete session (within 3-day window)
async function deleteSession(id: number): Promise<void>

// Check editability (3-day window)
async function isEditable(sessionId: number | Session): Promise<boolean>

// Get last count for smart defaults
async function getLastCount(zikrId: number): Promise<number>

// Set last count after save
async function setLastCount(zikrId: number, count: number): Promise<void>

// Bulk save with progressive chunking
async function addBulkSessions(
  sessions: SessionInput[]
): Promise<BulkResult>
```

### SessionValidationService Methods

```typescript
// Validate count (synchronous, <50ms)
function validateCount(value: number): string | null

// Validate date/time (synchronous, <50ms)
function validateDateTime(value: Date): string | null

// Validate complete row (synchronous, <50ms)
function validateRow(row: SessionRow): Record<string, string> | null
```

### ProgressiveSaveService Methods

```typescript
// Save sessions in chunks with progress callback
async function saveInChunks(
  sessions: SessionInput[],
  onProgress?: (progress: number) => void
): Promise<BulkResult>

// Resume interrupted save from state
async function resumeInterruptedSave(
  stateId: number,
  onProgress?: (progress: number) => void
): Promise<BulkResult>

// Discard interrupted save state
async function discardInterruptedSave(stateId: number): Promise<void>

// Check for interrupted save state
async function hasInterruptedSave(): Promise<number | null>
```

### Integration Service Methods

```typescript
// GoalProgressService (enhanced)
async function recalculateForSession(
  session: Session,
  operation: 'add' | 'update' | 'delete',
  oldValue?: Session
): Promise<void>

// StreakService (enhanced)
async function updateForSession(
  session: Session,
  operation: 'add' | 'update' | 'delete',
  oldValue?: Session
): Promise<void>
```

## File Structure

```
src/
├── core/
│   ├── db/
│   │   ├── db.ts                          // ✏️ MODIFY: Add v2 schema, migration
│   │   ├── types.ts                       // ✏️ MODIFY: Add Session v2, new interfaces
│   │   └── migrations.ts                  // ✏️ MODIFY: Add migrateToV2()
│   ├── services/
│   │   ├── sessionService.ts             // ✏️ MODIFY: Add CRUD, integration
│   │   ├── sessionValidationService.ts   // ➕ NEW: Validation logic
│   │   ├── progressiveSaveService.ts      // ➕ NEW: Chunked save
│   │   ├── goalService.ts                // ✏️ MODIFY: Add recalculateForSession()
│   │   ├── streakService.ts               // ✏️ MODIFY: Add updateForSession()
│   │   └── migrationService.ts            // ✏️ MODIFY: Add migration orchestrator
│   └── stores/
│       ├── sessionFormStore.ts            // ➕ NEW: Form state management
│       └── sessionHistoryStore.ts         // ➕ NEW: History state with liveQuery
├── features/
│   └── sessions/                          // ➕ NEW: Session feature directory
│       ├── components/
│       │   ├── SessionEntryForm.tsx       // ➕ NEW: Entry form container
│       │   ├── SessionRow.tsx             // ➕ NEW: Single session row
│       │   ├── SessionHistoryList.tsx     // ➕ NEW: History list container
│       │   ├── SessionCard.tsx            // ➕ NEW: Session display card
│       │   ├── SessionGroup.tsx           // ➕ NEW: Collapsible session group
│       │   └── MigrationScreen.tsx        // ➕ NEW: Migration progress UI
│       ├── utils/
│       │   ├── sessionGrouping.ts         // ➕ NEW: Time-based grouping logic
│       │   └── sessionFormatters.ts       // ➕ NEW: Display formatters
│       └── hooks/
│           ├── useSessionForm.ts          // ➕ NEW: Form hook
│           └── useSessionHistory.ts       // ➕ NEW: History hook
├── pages/
│   ├── SessionHistory.tsx                 // ✏️ MODIFY: Enhanced with session features
│   └── Progress.tsx                       // ✏️ MODIFY: Update or integrate with SessionHistory
├── components/
│   └── ManualEntryModal.tsx               // 🗑️ REPLACE: Replaced by SessionEntryForm
└── utils/
    ├── validation.ts                      // ✏️ MODIFY: Add session validation helpers
    └── dateUtils.ts                       // ✏️ MODIFY: Add edit window helpers
```

**Legend:**
- ➕ NEW: Create new file
- ✏️ MODIFY: Update existing file
- 🗑️ REPLACE: Remove/replace existing file

## Implementation Examples

### Database Schema v2 Implementation

```typescript
// src/core/db/db.ts
import Dexie, { Table } from 'dexie';
import { Session, Zikr, Goal, Streak, Setting, SessionFormState, ZikrLastCount } from './types';

export class ZikrDatabase extends Dexie {
  zikrs!: Table<Zikr>;
  sessions!: Table<Session>;
  goals!: Table<Goal>;
  streaks!: Table<Streak>;
  settings!: Table<Setting>;
  sessionFormState!: Table<SessionFormState>;  // NEW
  zikrLastCount!: Table<ZikrLastCount>;        // NEW

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
      const migrationService = await import('../services/migrationService');
      await migrationService.migrateToV2(tx);
    });
  }
}

export const db = new ZikrDatabase();
```

### TypeScript Interface Definitions

```typescript
// src/core/db/types.ts

// === EXISTING (unchanged) ===
export interface Zikr {
  id?: number;
  name: string;
  custom: boolean;
  createdAt: Date;
  deletedAt?: Date;
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

// === ENHANCED (v2) ===
export interface Session {
  id?: number;
  zikrId: number;
  count: number;
  source: 'app' | 'manual' | 'physical';
  timestamp: Date;
  date: Date;
  editableUntil: Date;     // NEW
  createdAt: Date;         // NEW
  updatedAt: Date;         // NEW
}

// === NEW (v2) ===
export interface SessionInput {
  zikrId: number;
  count: number;
  timestamp: Date;
}

export interface SessionUpdate {
  zikrId?: number;
  count?: number;
  timestamp?: Date;
  updatedAt: Date;
}

export interface SessionRow {
  zikrId: string;
  count: number;
  timestamp: Date;
  valid: boolean;
  errors: Record<string, string>;
}

export interface BulkResult {
  success: number;
  failed: number;
  errors: Array<{
    index: number;
    session: SessionInput;
    error: string;
  }>;
  stateId?: number;
  completed: boolean;
}

export interface SessionFormState {
  id?: number;
  sessions: SessionInput[];
  currentIndex: number;
  createdAt: Date;
  totalSessions: number;
}

export interface ZikrLastCount {
  zikrId: number;
  count: number;
  updatedAt: Date;
}
```

### Migration Implementation

```typescript
// src/core/services/migrationService.ts
import { db } from '../db/db';
import { Session } from '../db/types';
import { addDays } from '../utils/dateUtils';

interface MigrationProgress {
  current: number;
  total: number;
  phase: string;
}

export async function migrateToV2(
  transaction: Dexie.Transaction
): Promise<void> {
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
  
  console.log(`Migration complete: ${migrated} succeeded, ${errors} failed`);
}

export async function getMigrationProgress(): Promise<MigrationProgress> {
  // Check if migration is in progress or needed
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

export async function needsMigration(): Promise<boolean> {
  const version = await db.verno;
  return version < 2;
}
```

### Enhanced SessionService

```typescript
// src/core/services/sessionService.ts
import { db } from '../db/db';
import { Session, SessionInput, SessionUpdate, BulkResult } from '../db/types';
import { addDays } from '../utils/dateUtils';
import { updateStreak } from './streakService';
import { recalculateGoalForSession } from './goalService';

// === EXISTING (unchanged) ===
export async function add(session: Omit<Session, 'id'>): Promise<number> {
  const id = await db.sessions.add(session);
  await updateStreak(session.zikrId, session.date);
  await recalculateGoalForSession(session, 'add');
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}

export async function getSessionById(id: number): Promise<Session | undefined> {
  return await db.sessions.get(id);
}

export async function getAllSessions(): Promise<Session[]> {
  return await db.sessions.toArray();
}

export async function getSessionsByZikr(zikrId: number): Promise<Session[]> {
  return await db.sessions.where('zikrId').equals(zikrId).toArray();
}

export async function getSessionsByDate(date: Date): Promise<Session[]> {
  const dateStr = formatDate(date);
  return await db.sessions.where('date').equals(dateStr).toArray();
}

export async function getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  return await db.sessions.where('date').between(startDateStr, endDateStr).toArray();
}

// === NEW (v2) ===
export async function updateSession(
  id: number, 
  sessionUpdate: SessionUpdate
): Promise<number> {
  const existing = await getSessionById(id);
  if (!existing) {
    throw new Error('Session not found');
  }
  
  if (!(await isEditable(id))) {
    throw new Error('Session is no longer editable (3-day window expired)');
  }
  
  const updated = await db.sessions.update(id, {
    ...sessionUpdate,
    updatedAt: new Date(),
    date: sessionUpdate.timestamp ? sessionUpdate.timestamp : existing.date  // Update denormalized date
  });
  
  // Recalculate goals and streaks
  const updatedSession = { ...existing, ...sessionUpdate };
  await updateStreak(updatedSession.zikrId, updatedSession.date);
  await recalculateGoalForSession(updatedSession, 'update', existing);
  
  return updated;
}

export async function deleteSession(id: number): Promise<void> {
  const existing = await getSessionById(id);
  if (!existing) {
    throw new Error('Session not found');
  }
  
  if (!(await isEditable(id))) {
    throw new Error('Session is no longer editable (3-day window expired)');
  }
  
  await db.sessions.delete(id);
  
  // Recalculate goals and streaks
  await updateStreak(existing.zikrId, existing.date);
  await recalculateGoalForSession(existing, 'delete');
}

export async function isEditable(sessionId: number | Session): Promise<boolean> {
  const session = typeof sessionId === 'number' 
    ? await getSessionById(sessionId)
    : sessionId;
    
  if (!session) return false;
  
  const now = new Date();
  return now < session.editableUntil;
}

export async function getLastCount(zikrId: number): Promise<number> {
  const lastCount = await db.zikrLastCount.get(zikrId);
  return lastCount?.count || 0;
}

export async function setLastCount(zikrId: number, count: number): Promise<void> {
  await db.zikrLastCount.put({
    zikrId,
    count,
    updatedAt: new Date()
  });
}

export async function addBulkSessions(sessions: SessionInput[]): Promise<BulkResult> {
  const CHUNK_SIZE = 10;
  const results: BulkResult = {
    success: 0,
    failed: 0,
    errors: [],
    completed: false
  };
  
  // For progressive save, delegate to ProgressiveSaveService
  if (sessions.length >= 50) {
    const progressiveService = await import('./progressiveSaveService');
    return progressiveService.saveInChunks(sessions);
  }
  
  // Validate all sessions first
  const validSessions: SessionInput[] = [];
  for (let i = 0; i < sessions.length; i++) {
    try {
      validateSessionInput(sessions[i]);
      validSessions.push(sessions[i]);
    } catch (error) {
      results.errors.push({
        index: i,
        session: sessions[i],
        error: error instanceof Error ? error.message : 'Validation failed'
      });
      results.failed++;
    }
  }
  
  // Save valid sessions in transaction
  try {
    await db.transaction('rw', db.sessions, db.zikrLastCount, async () => {
      for (const session of validSessions) {
        const timestamp = session.timestamp;
        await db.sessions.add({
          ...session,
          source: 'manual',
          date: timestamp,
          editableUntil: addDays(timestamp, 3),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Update last count
        await setLastCount(session.zikrId, session.count);
        
        results.success++;
      }
    });
    
    // Batch update goals and streaks
    for (const session of validSessions) {
      await updateStreak(session.zikrId, session.timestamp);
      await recalculateGoalForSession(
        { ...session, source: 'manual' } as Session,
        'add'
      );
    }
    
    results.completed = true;
  } catch (error) {
    results.errors.push({
      index: -1,
      session: sessions[0],
      error: error instanceof Error ? error.message : 'Transaction failed'
    });
  }
  
  return results;
}

// Validation helper
function validateSessionInput(session: SessionInput): void {
  if (!session.zikrId || session.zikrId <= 0) {
    throw new Error('Invalid zikrId');
  }
  if (!session.count || session.count <= 0 || session.count > 10000) {
    throw new Error('Count must be between 1 and 10000');
  }
  if (!session.timestamp || isNaN(session.timestamp.getTime())) {
    throw new Error('Invalid timestamp');
  }
}

// Service export
export const sessionService = {
  add,
  updateSession,
  deleteSession,
  getSessionById,
  getAllSessions,
  getSessionsByZikr,
  getSessionsByDate,
  getSessionsByDateRange,
  isEditable,
  getLastCount,
  setLastCount,
  addBulkSessions
};
```

### ValidationService Implementation

```typescript
// src/core/services/sessionValidationService.ts
import { SessionRow } from '../db/types';

export function validateCount(value: number): string | null {
  if (isNaN(value) || value <= 0) {
    return 'Count must be greater than 0';
  }
  
  if (value > 10000) {
    return 'Count cannot exceed 10,000';
  }
  
  return null;
}

export function validateDateTime(value: Date): string | null {
  if (!value || isNaN(value.getTime())) {
    return 'Please select a valid date and time';
  }
  
  // Warning for future dates (not an error)
  const now = new Date();
  if (value > now) {
    return '⚠️ This session is in the future';
  }
  
  return null;
}

export function validateRow(row: SessionRow): Record<string, string> | null {
  const errors: Record<string, string> = {};
  
  // Validate zikrId
  if (!row.zikrId || row.zikrId === '') {
    errors.zikrId = 'Please select a zikr';
  }
  
  // Validate count
  const countError = validateCount(row.count);
  if (countError) {
    errors.count = countError;
  }
  
  // Validate timestamp
  const dateTimeError = validateDateTime(row.timestamp);
  if (dateTimeError && !dateTimeError.startsWith('⚠️')) {
    errors.timestamp = dateTimeError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

export const sessionValidationService = {
  validateCount,
  validateDateTime,
  validateRow
};
```

### ProgressiveSaveService Implementation

```typescript
// src/core/services/progressiveSaveService.ts
import { db } from '../db/db';
import { SessionInput, BulkResult, SessionFormState } from '../db/types';
import { addDays } from '../utils/dateUtils';
import { updateStreak } from './streakService';
import { recalculateGoalForSession } from './goalService';

const CHUNK_SIZE = 10;

export async function saveInChunks(
  sessions: SessionInput[],
  onProgress?: (progress: number) => void
): Promise<BulkResult> {
  const results: BulkResult = {
    success: 0,
    failed: 0,
    errors: [],
    completed: false
  };
  
  // Create state for resume capability
  const stateId = await db.sessionFormState.add({
    sessions,
    currentIndex: 0,
    createdAt: new Date(),
    totalSessions: sessions.length
  });
  results.stateId = stateId as number;
  
  try {
    for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
      const chunk = sessions.slice(i, Math.min(i + CHUNK_SIZE, sessions.length));
      
      // Save chunk in transaction
      await db.transaction('rw', db.sessions, db.sessionFormState, db.zikrLastCount, async () => {
        for (const session of chunk) {
          try {
            const timestamp = session.timestamp;
            await db.sessions.add({
              ...session,
              source: 'manual',
              date: timestamp,
              editableUntil: addDays(timestamp, 3),
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            await db.zikrLastCount.put({
              zikrId: session.zikrId,
              count: session.count,
              updatedAt: new Date()
            });
            
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: i,
              session,
              error: error instanceof Error ? error.message : 'Save failed'
            });
          }
        }
        
        // Update state
        await db.sessionFormState.update(stateId as number, {
          currentIndex: i + chunk.length
        });
      });
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Report progress
      if (onProgress) {
        const progress = Math.min(100, Math.round(((i + chunk.length) / sessions.length) * 100));
        onProgress(progress);
      }
    }
    
    // Batch update goals and streaks
    for (const session of sessions) {
      try {
        await updateStreak(session.zikrId, session.timestamp);
        await recalculateGoalForSession(
          { ...session, source: 'manual' } as any,
          'add'
        );
      } catch (error) {
        console.error('Failed to update goal/streak for session:', session);
      }
    }
    
    results.completed = true;
    
    // Clean up state
    await db.sessionFormState.delete(stateId as number);
    delete results.stateId;
    
  } catch (error) {
    console.error('Progressive save failed:', error);
    results.completed = false;
  }
  
  return results;
}

export async function resumeInterruptedSave(
  stateId: number,
  onProgress?: (progress: number) => void
): Promise<BulkResult> {
  const state = await db.sessionFormState.get(stateId);
  if (!state) {
    throw new Error('Save state not found');
  }
  
  const remainingSessions = state.sessions.slice(state.currentIndex);
  const results = await saveInChunks(remainingSessions, onProgress);
  
  // Update results with cumulative counts
  results.success += state.currentIndex;
  
  return results;
}

export async function discardInterruptedSave(stateId: number): Promise<void> {
  await db.sessionFormState.delete(stateId);
}

export async function hasInterruptedSave(): Promise<number | null> {
  const states = await db.sessionFormState.toArray();
  return states.length > 0 ? states[0].id! : null;
}

export const progressiveSaveService = {
  saveInChunks,
  resumeInterruptedSave,
  discardInterruptedSave,
  hasInterruptedSave
};
```

### sessionFormStore Implementation

```typescript
// src/core/stores/sessionFormStore.ts
import { create } from 'zustand';
import { SessionRow } from '../db/types';
import { sessionValidationService } from '../services/sessionValidationService';

export type FormMode = 'single' | 'bulk';
export type BulkMode = 'multi-zikr' | 'quick-repeat';

interface SessionFormState {
  // Form state
  mode: FormMode;
  bulkMode: BulkMode;
  rows: SessionRow[];
  editingSessionId: number | null;
  
  // Save state
  isSaving: boolean;
  saveProgress: number;
  errors: Record<string, string>;
  
  // Actions
  setMode: (mode: FormMode) => void;
  setBulkMode: (mode: BulkMode) => void;
  addRow: (row?: Partial<SessionRow>) => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, updates: Partial<SessionRow>) => void;
  setSaving: (saving: boolean) => void;
  setSaveProgress: (progress: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  loadSessionForEdit: (sessionId: number) => Promise<void>;
}

export const useSessionFormStore = create<SessionFormState>((set, get) => ({
  // Initial state
  mode: 'single',
  bulkMode: 'multi-zikr',
  rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }],
  editingSessionId: null,
  isSaving: false,
  saveProgress: 0,
  errors: {},
  
  // Actions
  setMode: (mode) => {
    set({ mode });
    // Reset to single row when switching to single mode
    if (mode === 'single') {
      set({ rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }] });
    }
  },
  
  setBulkMode: (bulkMode) => set({ bulkMode }),
  
  addRow: (row) => {
    const newRow: SessionRow = row || {
      zikrId: '',
      count: 0,
      timestamp: new Date(),
      valid: false,
      errors: {}
    };
    set({ rows: [...get().rows, newRow] });
  },
  
  removeRow: (index) => {
    const rows = [...get().rows];
    rows.splice(index, 1);
    set({ rows });
  },
  
  updateRow: (index, updates) => {
    const rows = [...get().rows];
    rows[index] = { ...rows[index], ...updates };
    
    // Validate updated row
    const errors = sessionValidationService.validateRow(rows[index]);
    rows[index].valid = !errors;
    rows[index].errors = errors || {};
    
    set({ rows });
  },
  
  setSaving: (isSaving) => set({ isSaving }),
  
  setSaveProgress: (saveProgress) => set({ saveProgress }),
  
  setErrors: (errors) => set({ errors }),
  
  reset: () => {
    set({
      mode: 'single',
      bulkMode: 'multi-zikr',
      rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }],
      editingSessionId: null,
      isSaving: false,
      saveProgress: 0,
      errors: {}
    });
  },
  
  loadSessionForEdit: async (sessionId) => {
    const sessionService = await import('../services/sessionService');
    const session = await sessionService.getSessionById(sessionId);
    
    if (session) {
      set({
        mode: 'single',
        rows: [{
          zikrId: String(session.zikrId),
          count: session.count,
          timestamp: session.timestamp,
          valid: true,
          errors: {}
        }],
        editingSessionId: sessionId
      });
    }
  }
}));

// Auto-save to localStorage every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useSessionFormStore.getState();
    if (state.mode === 'bulk' && state.rows.length > 1) {
      localStorage.setItem('sessionFormState', JSON.stringify({
        mode: state.mode,
        bulkMode: state.bulkMode,
        rows: state.rows
      }));
    }
  }, 30000);
}
```

### sessionHistoryStore Implementation

```typescript
// src/core/stores/sessionHistoryStore.ts
import { create } from 'zustand';
import { db } from '../db/db';
import { Session } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface SessionGroup {
  title: string;
  sessions: Session[];
  count: number;
  expanded: boolean;
}

interface SessionHistoryState {
  sessions: Session[];
  groupedByDate: Record<string, SessionGroup>;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSessions: () => Promise<void>;
  groupByDate: () => void;
  refresh: () => Promise<void>;
  toggleGroup: (groupKey: string) => void;
}

export const useSessionHistoryStore = create<SessionHistoryState>((set, get) => ({
  sessions: [],
  groupedByDate: {},
  loading: true,
  error: null,
  
  loadSessions: async () => {
    const unsubscribe = createRetryableSubscription(
      () => db.sessions
        .orderBy('timestamp')
        .reverse()
        .toArray(),
      (sessions) => {
        set({ sessions, loading: false, error: null });
        get().groupByDate();
      },
      (error) => set({
        error: 'Failed to load sessions. Please check browser storage permissions.',
        loading: false
      })
    );
    
    return unsubscribe;
  },
  
  groupByDate: () => {
    const sessions = get().sessions;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const groups: Record<string, SessionGroup> = {
      today: { title: 'Today', sessions: [], count: 0, expanded: true },  // Default expanded (review feedback)
      yesterday: { title: 'Yesterday', sessions: [], count: 0, expanded: false },
      thisWeek: { title: 'This Week', sessions: [], count: 0, expanded: false },
      older: { title: 'Older', sessions: [], count: 0, expanded: false }
    };
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      
      if (sessionDate >= today) {
        groups.today.sessions.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.sessions.push(session);
      } else if (sessionDate >= thisWeek) {
        groups.thisWeek.sessions.push(session);
      } else {
        groups.older.sessions.push(session);
      }
    });
    
    // Update counts
    Object.keys(groups).forEach(key => {
      groups[key].count = groups[key].sessions.length;
    });
    
    set({ groupedByDate: groups });
  },
  
  refresh: async () => {
    await get().loadSessions();
  },
  
  toggleGroup: (groupKey: string) => {
    const groups = { ...get().groupedByDate };
    if (groups[groupKey]) {
      groups[groupKey].expanded = !groups[groupKey].expanded;
      set({ groupedByDate: groups });
    }
  }
}));
```

### SessionEntryForm Component Structure

```typescript
// src/features/sessions/components/SessionEntryForm.tsx
import { useState, useEffect } from 'react';
import { useSessionFormStore } from '../../../core/stores/sessionFormStore';
import { sessionService } from '../../../core/services/sessionService';
import { SessionRow } from './SessionRow';
import { useNavigate } from 'react-router-dom';

interface SessionEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSessionId?: number;
}

export function SessionEntryForm({ isOpen, onClose, editSessionId }: SessionEntryFormProps) {
  const navigate = useNavigate();
  const { mode, bulkMode, rows, isSaving, saveProgress, errors, setMode, setBulkMode, addRow, removeRow, updateRow, reset, loadSessionForEdit } = useSessionFormStore();
  
  const [showInterruptedSavePrompt, setShowInterruptedSavePrompt] = useState(false);
  
  // Load session for editing
  useEffect(() => {
    if (editSessionId) {
      loadSessionForEdit(editSessionId);
    }
  }, [editSessionId, loadSessionForEdit]);
  
  // Check for interrupted save on mount
  useEffect(() => {
    const checkInterruptedSave = async () => {
      const progressiveSaveService = await import('../../../core/services/progressiveSaveService');
      const stateId = await progressiveSaveService.hasInterruptedSave();
      if (stateId) {
        setShowInterruptedSavePrompt(true);
      }
    };
    
    if (isOpen && !editSessionId) {
      checkInterruptedSave();
    }
  }, [isOpen, editSessionId]);
  
  const handleSave = async () => {
    const isAnyRowInvalid = rows.some(row => !row.valid);
    if (isAnyRowInvalid) {
      return;
    }
    
    setSaving(true);
    
    try {
      if (mode === 'single') {
        // Single session save
        await sessionService.add({
          zikrId: parseInt(rows[0].zikrId),
          count: rows[0].count,
          source: 'manual',
          timestamp: rows[0].timestamp,
          date: rows[0].timestamp
        });
      } else {
        // Bulk save
        const sessions = rows.map(row => ({
          zikrId: parseInt(row.zikrId),
          count: row.count,
          timestamp: row.timestamp
        }));
        
        await sessionService.addBulkSessions(sessions);
      }
      
      // Success
      onClose();
      navigate('/sessions');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    const hasUnsavedData = mode === 'bulk' && rows.length > 1;
    if (hasUnsavedData) {
      if (confirm('Discard unsaved sessions?')) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };
  
  // Interrupted save prompt
  if (showInterruptedSavePrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Resume Save?</h2>
          <p className="mb-4">You have an interrupted save. Would you like to resume?</p>
          <div className="flex gap-3">
            <button onClick={async () => {
              const progressiveSaveService = await import('../../../core/services/progressiveSaveService');
              const stateId = await progressiveSaveService.hasInterruptedSave();
              if (stateId) {
                await progressiveSaveService.resumeInterruptedSave(stateId);
              }
              setShowInterruptedSavePrompt(false);
            }} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px]">
              Resume
            </button>
            <button onClick={async () => {
              const progressiveSaveService = await import('../../../core/services/progressiveSaveService');
              const stateId = await progressiveSaveService.hasInterruptedSave();
              if (stateId) {
                await progressiveSaveService.discardInterruptedSave(stateId);
              }
              setShowInterruptedSavePrompt(false);
            }} className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px]">
              Discard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editSessionId ? 'Edit Session' : (mode === 'single' ? 'Add Session' : 'Add Sessions')}
        </h2>
        
        {/* Mode toggle */}
        {!editSessionId && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                mode === 'single' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                mode === 'bulk' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Bulk
            </button>
          </div>
        )}
        
        {/* Bulk mode toggle */}
        {mode === 'bulk' && !editSessionId && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setBulkMode('multi-zikr')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                bulkMode === 'multi-zikr' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Multi-Zikr
            </button>
            <button
              onClick={() => setBulkMode('quick-repeat')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium min-h-[44px] ${
                bulkMode === 'quick-repeat' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Quick Repeat
            </button>
          </div>
        )}
        
        {/* Session rows */}
        <div className="space-y-3 mb-4">
          {rows.map((row, index) => (
            <SessionRow
              key={index}
              row={row}
              index={index}
              mode={mode}
              bulkMode={bulkMode}
              onUpdate={(updates) => updateRow(index, updates)}
              onRemove={() => removeRow(index)}
              showRemove={mode === 'bulk'}
            />
          ))}
        </div>
        
        {/* Add row button (bulk mode) */}
        {mode === 'bulk' && !editSessionId && (
          <button
            onClick={() => addRow()}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] mb-4"
          >
            + Add Session
          </button>
        )}
        
        {/* Progress bar */}
        {isSaving && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
              Saving... {saveProgress}%
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || rows.some(row => !row.valid)}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium min-h-[44px] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (editSessionId ? 'Update' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Integration Points

### Goal Integration

**Trigger Points:**
- SessionService.add() → GoalProgressService.recalculateForSession(operation: 'add')
- SessionService.updateSession() → GoalProgressService.recalculateForSession(operation: 'update')
- SessionService.deleteSession() → GoalProgressService.recalculateForSession(operation: 'delete')

**Implementation:**
```typescript
// In SessionService methods
await recalculateGoalForSession(session, 'add');
await recalculateGoalForSession(updatedSession, 'update', oldSession);
await recalculateGoalForSession(deletedSession, 'delete');
```

### Streak Integration

**Trigger Points:**
- SessionService.add() → StreakService.updateForSession(operation: 'add')
- SessionService.updateSession() → StreakService.updateForSession(operation: 'update')
- SessionService.deleteSession() → StreakService.updateForSession(operation: 'delete')

**Implementation:**
```typescript
// In SessionService methods
await updateStreak(session.zikrId, session.date);
```

### Form State Persistence

**Integration:**
- sessionFormStore auto-saves to localStorage every 30 seconds
- ProgressiveSaveService saves to sessionFormState IndexedDB store
- MigrationService shows migration progress with estimated time

**Implementation:**
```typescript
// In sessionFormStore
setInterval(() => {
  localStorage.setItem('sessionFormState', JSON.stringify(state));
}, 30000);

// In ProgressiveSaveService
await db.sessionFormState.add({ sessions, currentIndex, createdAt });
```

### liveQuery Integration

**Integration:**
- sessionHistoryStore uses Dexie liveQuery for reactive updates
- SessionHistoryList auto-updates when sessions change
- Grouping recalculates automatically on data changes

**Implementation:**
```typescript
// In sessionHistoryStore
const unsubscribe = db.liveQuery(
  () => db.sessions.orderBy('timestamp').reverse().toArray()
).subscribe({
  next: (sessions) => {
    set({ sessions });
    groupByDate();
  }
});
```

## Considerations

### Security

**Input Validation:**
- All user inputs validated before database operations
- Count range limited (1-10000) to prevent abuse
- Date/time validated to prevent invalid timestamps
- ZikrId validated to prevent foreign key issues

**Data Privacy:**
- All data stored locally (IndexedDB)
- No network calls for session operations
- Export files contain only user's own data
- No external API dependencies

**Error Handling:**
- Per-session error handling during migration
- Graceful degradation for corrupted data
- Clear error messages without exposing internals
- Transaction rollback on partial failures

### Performance

**Database Performance:**
- Indexed queries on zikrId, date, editableUntil
- Transaction-based bulk operations
- liveQuery for reactive updates (no polling)
- Progressive chunking for large operations

**UI Performance:**
- Form state updates < 50ms (real-time validation)
- Progressive save maintains UI responsiveness
- Session grouping algorithm O(n) efficient
- Infinite scroll for large datasets

**Migration Performance:**
- Estimated < 5 seconds for 1000 sessions
- Progress indicator manages expectations
- Per-session error handling prevents blocking
- One-time operation impact acceptable

### Infrastructure

**Browser Compatibility:**
- Modern browsers with IndexedDB support
- Dexie.js handles cross-browser differences
- Progressive enhancement approach
- Fallback for missing features

**Storage Requirements:**
- IndexedDB quota typically 50-100MB per origin
- Sessions are small (~200 bytes each)
- 1000 sessions ≈ 200KB storage
- Export/import for data portability

**PWA Integration:**
- All operations work offline
- Service worker caches application assets
- No background sync required (local-only)
- Manifest for installability

## Migration Impact

**Existing Users:**
- v1 → v2 migration runs on app open
- Existing sessions gain editability (3-day window expired for old sessions)
- No data loss (migration is additive)
- Progress indicator communicates upgrade process

**New Users:**
- v2 schema created on first app open
- No migration needed
- All features available immediately

**Rollback Plan:**
- Migration is additive (can downgrade to v1 if needed)
- v2 fields ignored by v1 code
- Data preservation guaranteed
- Export/import for backup before upgrade

## Testing Considerations

**Unit Tests:**
- SessionService CRUD operations
- ValidationService validation logic
- ProgressiveSaveService chunking behavior
- MigrationService migration logic

**Integration Tests:**
- Goal and streak recalculation triggers
- liveQuery reactive updates
- Form state persistence
- Error recovery scenarios

**UI Tests:**
- SessionEntryForm single/bulk modes
- SessionHistoryList grouping
- SessionCard edit/delete controls
- MigrationScreen progress display

---

**Architecture Complete**

*Extends existing patterns for consistency*  
*Maintains $0/month operational cost (local-only)*  
*Offline-first architecture preserved*  
*Progressive enhancement approach (v1 → v2)*  
*User experience prioritized (3-day edit window, bulk modes)*  
*Data integrity maintained (transactions, validation, error recovery)*

**Next Phase:** Design review to validate technical approach and identify potential issues before implementation.
