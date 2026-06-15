# Architecture: Epic 1 - Foundation & Infrastructure

## Metadata
- **Type**: architecture
- **Status**: complete
- **Related Files**: See file structure section
- **Next**: design-review
- **Date**: 2026-06-15

## Overview

Epic 1 establishes the foundational infrastructure for Zikr PWA. This architecture designs a greenfield React + Vite + TypeScript application with IndexedDB persistence, Zustand state management, and PWA capabilities. The design prioritizes mobile-first UX, offline-first operation, and performance optimization.

## Architectural Decisions

### 1. Project Structure: Feature-Based with Shared Core
**Rationale**: Feature-based organization enables clear boundaries, while shared core prevents duplication. Each epic will have self-contained features, but infrastructure is centralized.

```
src/
├── core/              # Shared infrastructure (Epic 1)
│   ├── db/           # IndexedDB layer
│   ├── stores/       # Zustand stores
│   ├── services/     # Business logic
│   ├── components/   # Shared UI
│   └── utils/        # Helpers
├── features/         # Feature modules (future epics)
│   ├── counter/
│   ├── goals/
│   └── progress/
└── App.tsx
```

### 2. Data Layer: Dexie.js with Versioned Schema
**Rationale**: Dexie.js provides clean IndexedDB abstraction with built-in TypeScript support and live queries. Versioned schema enables safe migrations.

### 3. State Management: Zustand with liveQuery Integration
**Rationale**: Zustand offers simpler mental model than Redux while providing same capabilities. Integration with Dexie liveQuery enables reactive updates without manual syncing.

### 4. PWA Strategy: vite-plugin-pwa with autoUpdate
**Rationale**: AutoUpdate ensures users always have latest version without manual intervention. HashRouter enables PWA compatibility (no server-side routing needed).

### 5. Error Recovery: Exponential Backoff with User Control
**Rationale**: Prevents cascading failures while giving users control through retry buttons. 3-retry limit balances resilience with UX.

## Components

### Core Components (Epic 1)

#### Database Layer (`src/core/db/`)
- **`db.ts`**: Dexie database instance, schema definition, versioning
- **`types.ts`**: TypeScript interfaces for all entities
- **`migrations.ts`**: Migration functions with transactional rollback
- **`seed.ts`**: Predefined zikr data seeding

#### State Management (`src/core/stores/`)
- **`zikrStore.ts`**: Zikr list state with liveQuery integration
- **`sessionStore.ts`**: Session history state
- **`goalStore.ts`**: Goal progress state
- **`uiStore.ts`**: UI state (dark mode, navigation, loading)
- **`settingsStore.ts`**: App settings persistence

#### Service Layer (`src/core/services/`)
- **`zikrService.ts`**: Zikr CRUD operations
- **`sessionService.ts`**: Session management with goal/streak integration
- **`goalService.ts`**: Goal calculation and progress
- **`streakService.ts`**: Streak calculation logic
- **`errorRecovery.ts`**: liveQuery retry logic with exponential backoff
- **`migrationService.ts`**: Migration orchestration with progress tracking

#### Shared Components (`src/core/components/`)
- **`Navigation.tsx`**: Bottom navigation bar (44x44px touch targets)
- **`ErrorBoundary.tsx`**: React error boundary with fallback
- **`LoadingSpinner.tsx`**: Progress indicator component
- **`FallbackBanner.tsx`**: Persistent warning for IndexedDB failures

#### Routing (`src/`)
- **`App.tsx`**: HashRouter setup, route definitions
- **`pages/`**: Screen components (Counter, Goals, Progress, Settings)

## Data Model

### IndexedDB Schema (Version 1)

```typescript
// Database: zikr-db
// Stores: zikrs, sessions, goals, streaks, settings

// Store: zikrs
interface Zikr {
  id?: number;              // Auto-increment primary key
  name: string;             // Zikr name (e.g., "SubhanAllah")
  custom: boolean;          // true = user-created, false = predefined
  createdAt: Date;          // Creation timestamp
  deletedAt?: Date;         // Soft delete support
}

// Store: sessions
interface Session {
  id?: number;              // Auto-increment primary key
  zikrId: number;           // Foreign key to zikrs
  count: number;            // Count for this session
  source: 'app' | 'manual' | 'physical';  // Session source
  timestamp: Date;          // Session timestamp
  date: Date;               // Denormalized for querying (YYYY-MM-DD)
}

// Store: goals
interface Goal {
  id?: number;              // Auto-increment primary key
  zikrId: number;           // Foreign key to zikrs
  targetCount: number;       // Target count
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;          // Goal start date
  endDate?: Date;           // Goal end date (null for ongoing)
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;          // Creation timestamp
}

// Store: streaks
interface Streak {
  zikrId: number;           // Primary key (one per zikr)
  currentStreak: number;    // Current consecutive days
  longestStreak: number;    // Longest streak achieved
  lastProcessedDate: Date;  // Last date processed (prevents same-day double-count)
}

// Store: settings
interface Setting {
  key: string;              // Primary key
  value: any;               // Setting value
}
```

### Indexes for Query Performance

```typescript
// Sessions indexes
['zikrId']              // Get all sessions for a zikr
['date']                // Get sessions by date (for daily summaries)
['zikrId', 'date']      // Compound index for zikr + date queries

// Goals indexes
['zikrId']              // Get goals for a zikr
['status']              // Get active/completed/paused goals

// Zikrs indexes
[]                      // No indexes needed (small dataset)
```

## API Changes

No API endpoints in v1 (purely local app).

## File Structure

### Files to Create

```
src/
├── App.tsx                          # Main app component with routing
├── main.tsx                         # React entry point
├── index.css                        # Global styles + Tailwind directives
├── vite-env.d.ts                    # Vite TypeScript declarations
├── core/
│   ├── db/
│   │   ├── db.ts                   # Dexie database instance
│   │   ├── types.ts                # Entity interfaces
│   │   ├── migrations.ts           # Migration functions
│   │   └── seed.ts                 # Predefined zikr data
│   ├── stores/
│   │   ├── zikrStore.ts           # Zikr state management
│   │   ├── sessionStore.ts        # Session state
│   │   ├── goalStore.ts           # Goal state
│   │   ├── uiStore.ts             # UI state
│   │   └── settingsStore.ts       # Settings state
│   ├── services/
│   │   ├── zikrService.ts         # Zikr CRUD
│   │   ├── sessionService.ts      # Session management
│   │   ├── goalService.ts         # Goal calculation
│   │   ├── streakService.ts       # Streak logic
│   │   ├── errorRecovery.ts       # liveQuery retry logic
│   │   └── migrationService.ts    # Migration orchestration
│   ├── components/
│   │   ├── Navigation.tsx         # Bottom navigation
│   │   ├── ErrorBoundary.tsx      # Error boundary
│   │   ├── LoadingSpinner.tsx     # Loading indicator
│   │   └── FallbackBanner.tsx     # IndexedDB failure banner
│   └── utils/
│       ├── dateUtils.ts           # Date formatting helpers
│       └── constants.ts           # App constants
└── pages/
    ├── Counter.tsx                # Counter screen
    ├── Goals.tsx                  # Goals screen
    ├── Progress.tsx               # Progress screen
    └── Settings.tsx               # Settings screen

public/
├── manifest.webmanifest           # PWA manifest
├── robots.txt                     # SEO robots.txt
└── icons/                         # PWA icons (192x192, 512x512)

package.json                       # Dependencies
vite.config.ts                     # Vite + PWA configuration
tsconfig.json                      # TypeScript config
tailwind.config.js                 # Tailwind CSS config
bundlesize.config.json              # Bundle size monitoring
```

### Configuration Files to Create

#### `package.json`
```json
{
  "name": "zikr",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "size-check": "bundlesize",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0",
    "vite-plugin-pwa": "^0.20.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.4.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-plugin-react": "^7.34.0",
    "prettier": "^3.2.0",
    "bundlesize": "^0.18.1"
  }
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Zikr',
        short_name: 'Zikr',
        description: 'Islamic dhikr practice tracker',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',  // Chrome/Edge 90+, Safari 14+, Firefox 88+
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', 'dexie', 'dexie-react-hooks']
        }
      }
    }
  }
});
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',  // Manual dark mode toggle
  theme: {
    extend: {
      maxWidth: {
        'mobile-container': '640px'  // Desktop max-width container
      }
    }
  },
  plugins: []
};
```

## Implementation Examples

### 1. Database Setup (`src/core/db/db.ts`)

```typescript
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
```

### 2. State Store with liveQuery (`src/core/stores/zikrStore.ts`)

```typescript
import { create } from 'zustand';
import { liveQuery } from 'dexie';
import { db } from '../db/db';
import { Zikr } from '../db/types';
import { withErrorRecovery } from '../services/errorRecovery';

interface ZikrState {
  zikrs: Zikr[];
  loading: boolean;
  error: string | null;
  loadZikrs: () => void;
}

export const useZikrStore = create<ZikrState>((set) => ({
  zikrs: [],
  loading: true,
  error: null,

  loadZikrs: () => {
    const subscription = liveQuery(() => db.zikrs.toArray())
      .pipe(withErrorRecovery())  // Retry logic with exponential backoff
      .subscribe({
        next: (zikrs) => set({ zikrs, loading: false, error: null }),
        error: (error) => set({
          error: 'Failed to load zikrs. Please check browser storage permissions.',
          loading: false
        })
      });

    return () => subscription.unsubscribe();
  }
}));
```

### 3. Error Recovery Service (`src/core/services/errorRecovery.ts`)

```typescript
import { Observable } from 'rxjs';
import { retry, delay, take } from 'rxjs/operators';

interface RetryConfig {
  maxRetries: number;
  backoffMs: number[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: [1000, 2000, 4000]  // Exponential backoff: 1s, 2s, 4s
};

export function withErrorRecovery<T>(config: RetryConfig = DEFAULT_CONFIG) {
  return (source: Observable<T>) => {
    return source.pipe(
      retry({
        count: config.maxRetries,
        delay: (error, retryIndex) => {
          console.warn(`liveQuery failed (attempt ${retryIndex + 1}/${config.maxRetries}):`, error);
          if (retryIndex < config.backoffMs.length) {
            return delay(config.backoffMs[retryIndex]);
          }
          throw error;  // Max retries exceeded
        }
      })
    );
  };
}
```

### 4. Migration Service with Rollback (`src/core/services/migrationService.ts`)

```typescript
import { db } from '../db/db';
import { seedZikrs } from './seed';

interface MigrationProgress {
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
    // Show progress bar if migration takes >100ms
    const startTime = Date.now();

    await db.transaction('rw', db.zikrs, db.sessions, db.goals, db.streaks, db.settings, async () => {
      progress.currentVersion = 1;
      progress.progress = 50;

      // Seed predefined zikrs if empty
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
    // Transactional rollback: Dexie automatically rolls back on error
    progress.status = 'failed';
    console.error('Migration failed, rolled back to previous version:', error);
    throw new Error('Migration failed. Please refresh the app to try again.');
  }

  return progress;
}
```

### 5. Navigation Component (`src/core/components/Navigation.tsx`)

```typescript
import { NavLink } from 'react-router-dom';

export function Navigation() {
  const navItems = [
    { path: '/', label: 'Counter', icon: '🔢' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/progress', label: 'Progress', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white">
      <div className="max-w-mobile-container mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center
              min-h-[44px] min-w-[44px]  // 44x44px touch targets
              ${isActive ? 'text-emerald-400' : 'text-slate-400'}
              hover:text-slate-200
              transition-colors duration-200
            `}
          >
            <span className="text-2xl" role="img" aria-label={item.label}>
              {item.icon}
            </span>
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

### 6. Fallback Banner (`src/core/components/FallbackBanner.tsx`)

```typescript
import { AlertTriangle, X } from 'lucide-react';  // Or any icon library

export function FallbackBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-4 z-50">
      <div className="max-w-mobile-container mx-auto">
        <div className="flex items-start justify-between gap-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Browser storage is not available
            </h3>
            <p className="text-sm mb-2">
              Your progress will be lost if you close the app. All your data is temporary and will be deleted when you close this browser.
            </p>
            <p className="text-sm font-medium mb-2">
              Try:
            </p>
            <ol className="text-sm list-decimal list-inside space-y-1 mb-2">
              <li>Use a different browser (Chrome/Firefox)</li>
              <li>Clear browser storage</li>
              <li>Check browser permissions</li>
            </ol>
            <a href="/docs/Idea.md" className="text-xs underline">
              See platform strategy for browser recommendations
            </a>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-amber-600 rounded"
            aria-label="Dismiss warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Data Flow

### Initialization Flow

```
App startup
  └─▶ main.tsx: Check IndexedDB availability
  └─▶ migrationService.runMigrations()
  │     ├─▶ Show progress bar if >100ms
  │     ├─▶ Run transactional migration
  │     └─▶ On error: Rollback, show refresh prompt
  └─▶ App.tsx: Initialize stores
  │     └─▶ Each store subscribes to liveQuery
  │           └─▶ errorRecovery wraps liveQuery
  │                 ├─▶ Retry up to 3 times with backoff
  │                 └─▶ On failure: Show error state with retry button
  └─▶ Render UI with loading states
```

### Data Update Flow

```
User action (e.g., add zikr)
  └─▶ Component calls zikrService.add()
  └─▶ Service updates IndexedDB
  └─▶ liveQuery detects change
  └─▶ Store updates automatically
  └─▶ All subscribed components re-render
```

### Error Recovery Flow

```
liveQuery failure
  └─▶ errorRecovery intercepts error
  └─▶ Retry 1: Wait 1s, retry
  └─▶ Retry 2: Wait 2s, retry
  └─▶ Retry 3: Wait 4s, retry
  └─▶ All retries failed
  └─▶ Show error state to user
  └─▶ User clicks retry button
  └─▶ Re-subscribe to liveQuery
```

## Integration Points

### Story 1.1 → Story 1.2 Integration
- **Project setup provides**: TypeScript, build tools, bundling
- **Data layer consumes**: Types for interfaces, build system for compilation

### Story 1.2 → Story 1.3 Integration
- **Data layer provides**: Database instance, liveQuery observable
- **State layer consumes**: Database in stores, wraps liveQuery with error recovery

### Story 1.3 → Story 1.4 Integration
- **State layer provides**: React hooks with live data
- **UI layer consumes**: Store hooks in components, displays data

## Considerations

### Security
- All data is local (no server communication)
- No authentication in v1
- Export/Import files are plain JSON (user responsibility)
- Future v2: If adding cloud sync, implement encryption

### Performance
- **Code splitting**: React-vendor and state-vendor chunks lazy-loaded
- **Tree shaking**: Tailwind purges unused styles
- **Bundle size**: <200KB gzipped target
- **FCP target**: <1.5s via code splitting (verified in Epic 4)
- **liveQuery**: Efficient change detection (only updates changed data)

### Infrastructure
- **Browser compatibility**: Chrome/Edge 90+, Safari 14+, Firefox 88+ (ES2020 target)
- **Mobile-first**: 640px max-width container for desktop
- **Offline-first**: PWA service worker caches all assets
- **iOS limitations**: No scheduled notifications (transparent communication)
- **Accessibility foundation**: Semantic HTML, ARIA labels added in Epic 4

### Browser Quota Handling
- Detect quotaExceededError during IndexedDB operations
- Show user-friendly error: "Storage full - clear browser data or use different browser"
- Link to settings page for data export before clearing

### Migration Strategy
- Migrations run on app open before UI renders
- Transactional: Failure rolls back to previous version
- Progress indicator for migrations >100ms
- User notified to refresh on failure

### Testing Strategy

#### Unit Tests (Vitest)
- **Database layer**: Test migrations, seeding, CRUD operations
- **Service layer**: Test business logic (streak calculation, goal progress)
- **Utils**: Test date formatting, constants

#### Integration Tests
- **liveQuery integration**: Test store updates when database changes
- **Error recovery**: Test retry logic with mocked failures
- **Migration rollback**: Test transaction behavior on error

#### E2E Tests (Playwright - optional for Epic 1)
- **Critical path**: App initialization, data persistence, navigation
- **Error states**: IndexedDB failure, migration failure

#### Manual Testing Checklist
- [ ] App loads in Chrome, Safari, Firefox
- [ ] IndexedDB persists data across page reloads
- [ ] Migration progress bar shows for slow migrations
- [ ] liveQuery retry logic works on connection loss
- [ ] Fallback banner appears when IndexedDB unavailable
- [ ] Navigation works on mobile (44x44px touch targets)
- [ ] Dark mode toggle persists across sessions
- [ ] PWA installs on mobile

## Implementation Sequence

### Story 1.1: Project Setup (Dependencies: None)
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS with dark mode
3. Configure PWA with vite-plugin-pwa
4. Configure bundle size monitoring
5. Set up ESLint + Prettier

### Story 1.2: Data Layer (Dependencies: Story 1.1)
1. Create database instance with schema
2. Define TypeScript interfaces
3. Implement migration service with rollback
4. Implement error handling for quota exceeded
5. Seed predefined zikrs

### Story 1.3: State Management (Dependencies: Story 1.2)
1. Create Zustand stores for all entities
2. Implement service layer for CRUD operations
3. Connect stores to Dexie liveQuery
4. Implement error recovery wrapper

### Story 1.4: Routing & Layout (Dependencies: Story 1.3)
1. Set up React Router (HashRouter)
2. Create page components with loading states
3. Implement bottom navigation component
4. Add error boundary and fallback banner

## Success Criteria

Epic 1 complete when:
- [x] Development server runs on localhost:5173
- [ ] All stores defined in IndexedDB (verify in DevTools)
- [ ] Zustand stores react to IndexedDB changes (test with DevTools)
- [ ] Navigation works between 4 screens
- [ ] PWA installable on mobile (test install flow)
- [ ] Build passes (`npm run build`)
- [ ] Bundle <200KB gzipped (`npm run size-check`)
- [ ] All ADR requirements satisfied
- [ ] Migration progress indicator works (add artificial delay)
- [ ] liveQuery retry logic works (simulate failure)
- [ ] Fallback banner appears (disable IndexedDB in DevTools)

---

**Architecture Status**: Complete and ready for design review
**Next Phase**: Design Review (Phase 2.1)
**Implementation Follows**: Story 1.1 → 1.2 → 1.3 → 1.4
