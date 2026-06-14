# Zikr PWA - Architecture Plan

**Status:** Approved | **Updated:** 2026-06-15

## Technology Stack (Final)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React + Vite | Largest ecosystem, good PWA support via vite-plugin-pwa |
| State | Zustand + Dexie.js | Simple state + clean IndexedDB wrapper |
| CSS | Tailwind CSS | Fast dev, dark mode, tree-shakeable |
| PWA | vite-plugin-pwa | Service worker + manifest generation |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        PWA Client                            │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React)              │  State Layer      │  Data   │
│  ────────────────────          │  ────────────     │  ───────│
│  - Counter screen             │  - Zustand stores │  - IndexedDB│
│  - Goals screen                │  - ZikrStore      │  - Sessions│
│  - Progress screen             │  - SessionStore   │  - Zikrs  │
│  - Settings screen             │  - GoalStore      │  - Goals  │
│  - Manual entry modal          │  - UISettingStore │  - Streaks│
├─────────────────────────────────────────────────────────────┤
│  Services (Dexie.js)                                            │
│  ─────────────────                                             │
│  - zikrDB (database instance)                                   │
│  - zikrService (CRUD operations)                                │
│  - sessionService (with date queries)                          │
│  - goalService (progress calculation)                          │
│  - streakService (consecutive day tracking)                    │
│  - exportService (JSON backup/restore)                        │
├─────────────────────────────────────────────────────────────┤
│  PWA Layer (vite-plugin-pwa)                                   │
│  ─────────────────────────                                     │
│  - Service Worker (offline, caching)                         │
│  - Manifest (installability)                                  │
│  - Push API (Android notifications)                          │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Counter/          # Main counter screen
│   ├── Goals/            # Goal management
│   ├── Progress/         # Progress visualization
│   ├── ManualEntry/      # Manual progress entry modal
│   └── Settings/         # App settings
├── stores/               # Zustand stores
│   ├── zikrStore.ts
│   ├── sessionStore.ts
│   ├── goalStore.ts
│   ├── uiStore.ts
│   └── settingsStore.ts
├── services/             # Dexie.js services
│   ├── db.ts             # Database schema
│   ├── zikrService.ts
│   ├── sessionService.ts
│   ├── goalService.ts
│   ├── streakService.ts
│   └── exportService.ts
├── hooks/                # Custom React hooks
│   ├── useHaptic.ts
│   ├── useStreak.ts
│   └── useNotification.ts
├── utils/                # Helper functions
│   ├── date.ts
│   └── streak.ts
├── App.tsx
└── main.tsx
```

## Data Schema (IndexedDB via Dexie.js)

```typescript
// Database: zikr-db, Version: 1
const db = new Dexie('zikr-db');

db.version(1).stores({
  zikrs: '++id, name, custom, createdAt, deletedAt',
  sessions: '++id, zikrId, date, timestamp, source',
  goals: '++id, zikrId, status, period, startDate',
  streaks: 'zikrId, currentStreak, lastSessionDate',
  settings: 'key, value'
});

// TypeScript interfaces
interface Zikr {
  id?: number;
  name: string;
  custom: boolean;
  createdAt: Date;
  deletedAt?: Date;
}

interface Session {
  id?: number;
  zikrId: number;
  count: number;
  source: 'app' | 'manual' | 'physical';
  timestamp: Date;
  date: string; // YYYY-MM-DD for querying
}

interface Goal {
  id?: number;
  zikrId: number;
  targetCount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

interface Streak {
  zikrId: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: Date;
}

interface Setting {
  key: string;
  value: any;
}
```

## Key Service Patterns

### sessionService.ts
```typescript
export const sessionService = {
  async addSession(session: Omit<Session, 'id'>) {
    await db.sessions.add(session);
    await streakService.updateStreak(session.zikrId, session.date);
  },

  async getSessionsByZikr(zikrId: number, startDate: Date, endDate: Date) {
    return await db.sessions
      .where('zikrId').equals(zikrId)
      .and(s => s.date >= format(startDate) && s.date <= format(endDate))
      .toArray();
  },

  async getTodaySessions(zikrId: number) {
    const today = format(new Date());
    return await db.sessions
      .where({ zikrId, date: today })
      .toArray();
  }
};
```

### streakService.ts
```typescript
export const streakService = {
  async updateStreak(zikrId: number, sessionDate: string) {
    const streak = await db.streaks.get(zikrId) || {
      zikrId,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: sessionDate
    };

    const daysSince = daysBetween(streak.lastSessionDate, sessionDate);

    if (daysSince > 1) {
      streak.currentStreak = 0; // Broken streak
    }

    if (daysSince <= 1) {
      streak.currentStreak++;
      streak.longestStreak = Math.max(streak.currentStreak, streak.longestStreak);
    }

    streak.lastSessionDate = sessionDate;
    await db.streaks.put(streak);
  }
};
```

## Notification Strategy

### Android (Web Push API)
```typescript
// Service worker registers push subscription
// Push server (future v2) sends scheduled notifications
```

### iOS (In-App Fallback)
```typescript
// In-app notification center shows pending reminders
// "Remind me later" uses browser Alarm API if available
// Transparent: "iOS limits background reminders"
```

## Offline-First Strategy

1. **All data in IndexedDB** - No network calls in v1
2. **Service worker caching** - App shell cached for offline
3. **Export/Import** - JSON backup for data portability

## Performance Considerations

- **Code splitting:** Lazy route loading
- **Tree shaking:** Purge unused Tailwind classes
- **IndexedDB indexes:** Efficient queries for date ranges
- **React.memo:** Prevent unnecessary re-renders on counter
