# Artifact: Architecture

## Metadata
- **Type**: architecture
- **Status**: complete
- **Related Files**: See File Structure section
- **Next**: architecture-review

## Overview
Architecture for manual session entry feature that allows users to log zikr sessions performed with physical tasbeeh or when offline. The design maintains consistency with existing offline-first patterns while adding bulk entry capabilities and smart defaults.

## Architectural Decisions

### Decision 1: Dexie.js + LiveQuery for Reactive Data
**Rationale:** Consistent with existing architecture, provides reactive updates without manual state management.

### Decision 2: Service Layer Pattern
**Rationale:** Separates business logic from UI, makes testing easier, consistent with Goal/Streak service patterns.

### Decision 3: Two-Mode Bulk Entry
**Rationale:** Reduces UI complexity - Multi-Zikr for varied sessions, Quick Repeat for same-zikr entries.

### Decision 4: Progressive Chunked Save
**Rationale:** Prevents UI freeze on large entries (50+), provides user feedback, resumable if interrupted.

### Decision 5: 3-Day Edit Window with Denormalized Field
**Rationale:** Balance between flexibility and data integrity; `editableUntil` computed once for efficiency.

## Components

### UI Layer (React Components)

- **`SessionEntryForm`** - Main container for session entry
  - Handles mode switching (single/bulk, multi-zikr/quick-repeat)
  - Orchestrates form submission
  - Shows loading/progress states

- **`SessionRow`** - Single session input row
  - Zikr selector (dropdown with search)
  - Count input (number field with validation)
  - Date/time picker (presets + full picker)
  - Remove button

- **`QuickRepeatForm`** - Optimized for same-zikr bulk entry
  - Single zikr selector (top)
  - Multiple count/date rows below
  - Reduced UI chrome per row

- **`SessionHistoryList`** - Displays sessions grouped by date
  - Infinite scroll or pagination
  - Source badge rendering
  - Edit/Delete buttons (conditional on 3-day window)

### State Layer (Zustand)

- **`sessionFormStore`** - Form state management
  ```typescript
  {
    mode: 'single' | 'bulk'
    bulkMode: 'multi-zikr' | 'quick-repeat'
    rows: SessionRow[]
    isSaving: boolean
    saveProgress: { saved: number, total: number }
  }
  ```

- **`sessionHistoryStore`** - History view state
  ```typescript
  {
    sessions: Session[]
    groupedByDate: Record<string, Session[]>
    loading: boolean
  }
  ```

### Service Layer

- **`SessionService`** - Session CRUD operations
  - `addSession(session: SessionInput): Promise<Session>`
  - `addBulkSessions(sessions: SessionInput[]): Promise<BulkResult>`
  - `updateSession(id: string, updates: Partial<Session>): Promise<Session>`
  - `deleteSession(id: string): Promise<void>`
  - `getSessionsByDateRange(start: Date, end: Date): Promise<Session[]>`
  - `isEditable(sessionId: string): boolean`

- **`SessionValidationService`** - Real-time validation
  - `validateCount(value: number): ValidationResult`
  - `validateDateTime(value: Date): ValidationResult`
  - `validateRow(row: SessionRow): ValidationResult`

- **`ProgressiveSaveService`** - Handle large bulk saves
  - `saveInChunks(sessions: SessionInput[], onProgress): Promise<BulkResult>`
  - `resumeInterruptedSave(stateId: string): Promise<BulkResult>`

### Integration Services

- **`GoalProgressService`** - Recalculate on session changes
  - `recalculateForSession(session: Session): Promise<void>`

- **`StreakService`** - Update streaks on session changes
  - `updateForSession(session: Session): Promise<void>`

- **`SettingsService`** - Store last count per zikr
  - `setLastCount(zikrId: string, count: number): Promise<void>`
  - `getLastCount(zikrId: string): Promise<number>`

## Data Model

### IndexedDB Schema (Dexie.js)

```typescript
// Database: zikr-db, Version: 2 (migration from v1)

// Store: sessions (keyPath: id, autoIncrement: true)
// Indexes: zikrId, date, timestamp, editableUntil
interface Session {
  id: string // auto-generated
  zikrId: string // foreign key to zikrs store
  count: number // min: 1
  source: 'app' | 'manual' | 'physical'
  timestamp: Date // full timestamp
  date: string // denormalized YYYY-MM-DD for queries
  editableUntil: Date // timestamp + 3 days
  createdAt: Date
  updatedAt: Date
}

// Store: sessionFormState (for save resume)
interface SessionFormState {
  id: string // state ID for progressive save
  sessions: Partial<Session>[] // unsaved sessions
  currentIndex: number // progress tracker
  createdAt: Date
}

// Store: zikrLastCount (for smart defaults)
interface ZikrLastCount {
  zikrId: string // primary key
  count: number
  updatedAt: Date
}
```

### Migration (v1 → v2)

```typescript
// Add new fields to existing sessions
db.version(2).stores({
  sessions: 'id, zikrId, date, timestamp, editableUntil',
  sessionFormState: 'id, createdAt',
  zikrLastCount: 'zikrId'
})

// Migrate existing sessions
db.on('populate', () => {
  return db.transaction('rw', db.sessions, async () => {
    const sessions = await db.sessions.toArray()
    for (const session of sessions) {
      await db.sessions.update(session.id, {
        editableUntil: new Date(session.timestamp.getTime() + 3 * 24 * 60 * 60 * 1000)
      })
    }
  })
})
```

## API (Service Layer Interface)

```typescript
// SessionService
interface SessionService {
  addSession(session: SessionInput): Promise<Session>
  addBulkSessions(sessions: SessionInput[]): Promise<BulkResult>
  updateSession(id: string, updates: SessionUpdate): Promise<Session>
  deleteSession(id: string): Promise<void>
  getSessionsByDateRange(start: Date, end: Date): Promise<Session[]>
  isEditable(session: string | Session): boolean
}

interface BulkResult {
  success: number
  failed: number
  errors: Array<{ index: number, error: string }>
  stateId?: string // for resume if interrupted
}

// SessionValidationService
interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

// ProgressiveSaveService
interface SaveProgress {
  saved: number
  total: number
  currentBatch: number
}
```

## File Structure

```
src/
├── features/
│   └── sessions/
│       ├── components/
│       │   ├── SessionEntryForm.tsx          # Main container
│       │   ├── SessionRow.tsx                # Single input row
│       │   ├── QuickRepeatForm.tsx           # Same-zikr bulk mode
│       │   ├── SessionHistoryList.tsx        # History view
│       │   └── SessionCard.tsx               # Single session display
│       ├── stores/
│       │   ├── sessionFormStore.ts           # Form state (Zustand)
│       │   └── sessionHistoryStore.ts        # History state
│       ├── services/
│       │   ├── SessionService.ts             # CRUD operations
│       │   ├── SessionValidationService.ts  # Validation logic
│       │   └── ProgressiveSaveService.ts    # Chunked save logic
│       ├── types/
│       │   ├── session.ts                    # TypeScript interfaces
│       │   └── validation.ts                 # Validation types
│       └── utils/
│           ├── dateUtils.ts                  # Date formatting
│           └── sessionUtils.ts               # Helper functions
├── services/
│   ├── GoalProgressService.ts                # Integration: goals
│   ├── StreakService.ts                      # Integration: streaks
│   └── SettingsService.ts                    # Integration: settings
└── db/
    ├── schema.ts                             # Dexie schema definition
    └── migrations.ts                         # DB version migrations
```

## Implementation Examples

### Service Layer Pattern

```typescript
// SessionService.ts
import { db } from '@/db/schema'
import { goalProgressService } from '@/services/GoalProgressService'
import { streakService } from '@/services/StreakService'

export const sessionService = {
  async addSession(session: SessionInput): Promise<Session> {
    const editableUntil = new Date(session.timestamp.getTime() + 3 * 24 * 60 * 60 * 1000)

    return await db.transaction('rw', db.sessions, async () => {
      const id = await db.sessions.add({
        ...session,
        date: formatDate(session.timestamp),
        editableUntil,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const newSession = await db.sessions.get(id)

      // Trigger updates
      await goalProgressService.recalculateForSession(newSession)
      await streakService.updateForSession(newSession)

      // Update smart default
      await db.zikrLastCount.put({ zikrId: session.zikrId, count: session.count, updatedAt: new Date() })

      return newSession
    })
  },

  isEditable(session: string | Session): boolean {
    const editableUntil = typeof session === 'string'
      ? (async () => (await db.sessions.get(session))?.editableUntil)()
      : session.editableUntil

    return editableUntil ? new Date() < editableUntil : false
  }
}
```

### Progressive Chunked Save

```typescript
// ProgressiveSaveService.ts
const CHUNK_SIZE = 10

export const progressiveSaveService = {
  async saveInChunks(
    sessions: SessionInput[],
    onProgress: (progress: SaveProgress) => void
  ): Promise<BulkResult> {
    const result: BulkResult = { success: 0, failed: 0, errors: [] }

    // Save state for resume capability
    const stateId = await db.sessionFormState.add({
      sessions,
      currentIndex: 0,
      createdAt: new Date()
    })

    for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
      const chunk = sessions.slice(i, i + CHUNK_SIZE)

      try {
        await sessionService.addBulkSessions(chunk)
        result.success += chunk.length
      } catch (error) {
        result.failed += chunk.length
        result.errors.push({ index: i, error: error.message })

        // Update state for resume
        await db.sessionFormState.update(stateId, { currentIndex: i })
      }

      onProgress({
        saved: result.success,
        total: sessions.length,
        currentBatch: Math.floor(i / CHUNK_SIZE)
      })

      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    // Clean up state
    await db.sessionFormState.delete(stateId)

    return result
  }
}
```

### Form State Management

```typescript
// sessionFormStore.ts
import { create } from 'zustand'

interface SessionFormState {
  mode: 'single' | 'bulk'
  bulkMode: 'multi-zikr' | 'quick-repeat'
  rows: SessionRow[]
  isSaving: boolean
  saveProgress: { saved: number; total: number } | null

  setMode: (mode: 'single' | 'bulk') => void
  setBulkMode: (mode: 'multi-zikr' | 'quick-repeat') => void
  addRow: () => void
  removeRow: (index: number) => void
  updateRow: (index: number, updates: Partial<SessionRow>) => void
  setSaving: (isSaving: boolean) => void
  setSaveProgress: (progress: { saved: number; total: number }) => void
  reset: () => void
}

export const useSessionFormStore = create<SessionFormState>((set) => ({
  mode: 'single',
  bulkMode: 'multi-zikr',
  rows: [{ zikrId: '', count: '', timestamp: new Date() }],
  isSaving: false,
  saveProgress: null,

  setMode: (mode) => set({ mode, rows: [{ zikrId: '', count: '', timestamp: new Date() }] }),
  setBulkMode: (bulkMode) => set({ bulkMode }),
  addRow: () => set((state) => ({
    rows: [...state.rows, { zikrId: '', count: '', timestamp: new Date() }]
  })),
  removeRow: (index) => set((state) => ({
    rows: state.rows.filter((_, i) => i !== index)
  })),
  updateRow: (index, updates) => set((state) => ({
    rows: state.rows.map((row, i) => (i === index ? { ...row, ...updates } : row))
  })),
  setSaving: (isSaving) => set({ isSaving }),
  setSaveProgress: (saveProgress) => set({ saveProgress }),
  reset: () => set({
    mode: 'single',
    bulkMode: 'multi-zikr',
    rows: [{ zikrId: '', count: '', timestamp: new Date() }],
    isSaving: false,
    saveProgress: null
  })
}))
```

## Integration Points

### Goal Progress Service
```typescript
// Called after session add/update/delete
await goalProgressService.recalculateForSession(session)
```

### Streak Service
```typescript
// Called after session add/update/delete
await streakService.updateForSession(session)
```

### Settings Service
```typescript
// Store/retrieve last count per zikr
await settingsService.setLastCount(zikrId, count)
const lastCount = await settingsService.getLastCount(zikrId)
```

### Zikr Service
```typescript
// Fetch user's zikr list for dropdown
const zikrs = await zikrService.getAll()
```

## Data Flow

### Happy Path: Single Session Entry
```
User fills form → Validates input → Clicks Save
  └─▶ SessionService.addSession()
      └─▶ IndexedDB: sessions.add()
      └─▶ GoalProgressService.recalculate()
      └─▶ StreakService.update()
      └─▶ SettingsService.setLastCount()
      └─▶ UI: Success toast, navigate to history
```

### Happy Path: Bulk Session Entry
```
User fills multiple rows → Validates per row → Clicks Save
  └─▶ If < 50 sessions:
      └─▶ SessionService.addBulkSessions() (single transaction)
  └─▶ If >= 50 sessions:
      └─▶ ProgressiveSaveService.saveInChunks()
          └─▶ Chunks of 10 with progress updates
          └─▶ Resume state saved to IndexedDB
```

### Edit Session Flow
```
User clicks Edit → Check editableUntil → If within 3 days:
  └─▶ Load session data into form
  └─▶ User modifies → Validates → Clicks Save
  └─▶ SessionService.updateSession()
      └─▶ GoalProgressService.recalculate()
      └─▶ StreakService.update()
```

## Considerations

### Security
- All data local (IndexedDB) - no network calls
- No auth in v1 - full user control
- Input validation prevents invalid counts

### Performance
- IndexedDB indexes on date, zikrId for fast queries
- LiveQuery for reactive updates without polling
- Progressive chunking prevents UI freeze
- Virtual scrolling for large history lists

### Infrastructure
- No backend required ($0/month)
- PWA service worker for offline capability
- Bundle size impact: ~15KB (services) + ~10KB (components)

### Error Handling
- Bulk save partial failure: save what we can, report errors
- Progressive save interruption: state saved, resume on return
- Deleted zikr reference: show zikr name from session history

### Accessibility
- Form inputs properly labeled
- Error messages announced to screen readers
- Keyboard navigation support
- Touch targets 44x44px minimum

## Next Steps

1. **Implement Dexie schema migration** (v1 → v2)
2. **Build service layer** (SessionService, ValidationService, ProgressiveSaveService)
3. **Create UI components** (SessionEntryForm, SessionHistoryList)
4. **Integrate with Goal/Streak services**
5. **Add E2E tests** for bulk entry edge cases
