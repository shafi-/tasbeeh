# ADR 002: Offline-First Architecture with IndexedDB

**Status:** Accepted
**Date:** 2026-06-15
**Deciders:** Project Lead

## Context

Zikr has a **$0/month operational cost** constraint. This means:
- No backend infrastructure in v1
- No cloud sync or authentication
- All data must be stored locally
- User data must be preserved across sessions

The app needs to store:
- Custom zikr lists
- Session history (count, date, source)
- Goal definitions and progress
- Streak information
- User settings

## Decision

**Chosen approach: IndexedDB via Dexie.js**

- **Primary data store:** IndexedDB (browser-native, >1GB capacity)
- **Wrapper library:** Dexie.js for clean API and TypeScript support
- **Schema versioning:** Dexie's built-in versioning for migrations
- **Reactivity:** Dexie's `liveQuery()` for Zustand store integration

## Consequences

### Positive
- **Zero infrastructure cost** - No database hosting, no server costs
- **True offline** - App works completely without network
- **Large capacity** - IndexedDB supports >1GB (more than enough for text data)
- **Fast queries** - IndexedDB has indexes for efficient date-based queries
- **Privacy** - User data never leaves their device

### Negative
- **No cross-device sync** - Users can't access data on multiple devices
- **Data loss risk** - If user clears browser data, all data is lost
- **Migration complexity** - Schema changes require IndexedDB versioning
- **Testing complexity** - Need to mock IndexedDB for tests

### Risks
- **User clears browser data** - No recovery mechanism (mitigated by export/import)
- **Browser compatibility** - Some browsers have IndexedDB quirks (tested on major browsers)
- **Storage quota** - Unlikely to hit limit with text-only data

## Alternatives Considered

### 1. localStorage
**Pros:**
- Simpler API
- Synchronous (easier to work with)

**Cons:**
- 5-10MB limit (too small for session history)
- No indexing (slow queries)
- String-only storage (needs JSON serialization)
- No schema versioning

**Why not chosen:** Storage limit and lack of indexing make it unsuitable

### 2. SQLite in browser (sql.js)
**Pros:**
- Full SQL support
- Familiar to many developers

**Cons:**
- Large bundle size (~1MB Wasm)
- Overkill for simple key-value and range queries
- Slower than IndexedDB for simple operations

**Why not chosen:** Bundle size and complexity not justified for this use case

### 3. Remote backend (Supabase free tier)
**Pros:**
- Cross-device sync
- Data backup
- Future scalability

**Cons:**
- Adds dependency on external service
- Free tier has limits (500MB DB, 1GB bandwidth)
- Requires auth infrastructure
- Not truly offline-first

**Why not chosen:** Violates $0/month constraint and offline-first requirement

### 4. File System Access API
**Pros:**
- User-controlled file location
- Easy backup/restore

**Cons:**
- Poor browser support
- Requires user permission each time
- Not suitable for mobile PWAs

**Why not chosen:** Browser support and mobile PWA limitations

## Related Decisions

- ADR 001: Tech Stack Selection (includes Dexie.js decision)
- ADR 003: PWA Strategy with iOS Limitations

## Implementation Notes

### Schema Design
```typescript
db.version(1).stores({
  zikrs: '++id, name, custom, createdAt, deletedAt',
  sessions: '++id, zikrId, date, timestamp, source',
  goals: '++id, zikrId, status, period, startDate',
  streaks: 'zikrId, currentStreak, lastSessionDate',
  settings: 'key, value'
});
```

### Data Portability
- Export: Serialize all stores to JSON blob
- Import: Parse JSON and bulk insert to IndexedDB
- User-triggered export/import for backup/transfer

### Error Handling
- Handle `quotaExceededError` gracefully
- Provide user guidance if IndexedDB is disabled
- Fallback to memory-only mode if needed (with warning)

### Migration Strategy
```typescript
db.version(1).stores({ ... });
db.version(2).stores({
  // Add new indexes or stores
}).upgrade(tx => {
  // Migrate data if needed
});
```
