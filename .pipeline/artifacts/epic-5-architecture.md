# Artifact: Architecture

## Metadata
- **Type**: architecture
- **Status**: complete
- **Feature**: Epic 5: Testing & Documentation
- **Related Files**: 26 new files, 4 modified files
- **Next**: design-review
- **Created**: 2026-06-16

## Overview

Epic 5 establishes comprehensive testing infrastructure and user documentation for the Zikr PWA v1 release. The architecture addresses key challenges: mocking Dexie.js IndexedDB operations, testing reactive state management with liveQuery, and creating user-focused documentation for a multi-level practitioner audience.

**Testing Goals:** >90% coverage with fast, maintainable tests  
**Documentation Goals:** Clear, non-technical user guidance with Islamic context

## Architectural Decisions

### Decision 1: Vitest as Test Runner
**Rationale:** Native Vite integration, faster than Jest, better ES module support, compatible with existing build setup.

**Tradeoffs:**
- ✅ Faster test execution (no Babel transform overhead)
- ✅ Native ESM support matches project setup
- ❌ Smaller ecosystem than Jest (mitigated by @testing-library compatibility)

### Decision 2: fake-indexeddb for Dexie.js Mocking
**Rationale:** Dexie.js requires real IndexedDB implementation. fake-indexeddb provides in-memory IndexedDB that's faster and more reliable than jsdom's incomplete implementation.

**Tradeoffs:**
- ✅ Authentic IndexedDB behavior (transactions, indexes, constraints)
- ✅ Faster than browser IndexedDB (in-memory)
- ❌ Additional dependency (mitigated by small size: ~50KB)

### Decision 3: Test Structure Mirrors Source Code
**Rationale:** Reduces cognitive load, makes tests easy to find, maintains consistency with project organization.

**Tradeoffs:**
- ✅ Easy to locate tests for specific files
- ✅ Clear relationship between test and implementation
- ❌ Longer file paths (mitigated by IDE integration)

### Decision 4: Centralized Test Utilities
**Rationale:** Reusable setup, fixtures, and mocks reduce duplication and ensure consistency across tests.

**Tradeoffs:**
- ✅ DRY principle, consistent mocking
- ✅ Easy to update mock behavior globally
- ❌ Centralized failure point (mitigated by clear documentation)

### Decision 5: User-Focused README Structure
**Rationale:** Target users are mixed practitioner levels (casual, devoted, new converts). Non-technical language with Islamic context improves accessibility.

**Tradeoffs:**
- ✅ Low barrier to entry for non-technical users
- ✅ Reduces support burden through self-service documentation
- ❌ Longer document (mitigated by clear sections and TOC)

## Components

### Testing Infrastructure

#### Component 1: Vitest Configuration (`vitest.config.ts`)
**Responsibility:** Test runner setup with globals, coverage, and environment configuration.

**Key Features:**
- Global test utilities (describe, it, expect, vi)
- Coverage thresholds (>90% overall, 100% for critical business logic)
- React testing environment with jsdom
- Module mocking for Dexie.js and browser APIs
- Performance optimizations (parallel test execution)

#### Component 2: Test Utilities (`src/__tests__/test-utils.ts`)
**Responsibility:** Centralized test setup, fixtures, and helper functions.

**Key Features:**
- `createMockDatabase()` - Creates fake-indexeddb instance for tests
- `createTestZikr()` - Generates test zikr data with defaults
- `createTestSession()` - Generates test session data with timestamps
- `createTestGoal()` - Generates test goal data with periods
- `mockDate()` - Sets current date for deterministic testing
- `advanceTime()` - Advances time for streak testing
- `waitForStateUpdate()` - Waits for Zustand store updates

#### Component 3: Test Fixtures (`test/fixtures/`)
**Responsibility:** Reusable test data following realistic scenarios.

**Key Features:**
- `predefinedZikrs.ts` - Test data for SubhanAllah, Alhamdulillah, etc.
- `sessions.ts` - Sample sessions with different sources (app, manual, physical)
- `goals.ts` - Sample goals covering all period types
- `streaks.ts` - Streak data for edge cases (timezone, gaps, same-day)
- `settings.ts` - Settings data including dark mode preferences

#### Component 4: Mock Implementations (`src/__tests__/mocks/`)
**Responsibility:** Controlled replacements for external dependencies.

**Key Features:**
- `mockDexie.ts` - Mocked Dexie.js implementation with fake-indexeddb
- `mockBrowserApis.ts` - Mocked navigator.vibrate, localStorage, service worker
- `mockDateUtils.ts` - Mocked date utilities for deterministic testing
- `mockLiveQuery.ts` - Mocked Dexie liveQuery for reactive testing

### Documentation Structure

#### Component 5: User Documentation (`README.md`)
**Responsibility:** Comprehensive user-facing guidance for all practitioner levels.

**Key Features:**
- App introduction with Islamic context
- First time setup (PWA installation, quick start)
- Feature guides (counter, zikrs, manual entry, goals, progress, settings)
- Visual walkthroughs (screen descriptions, UI elements)
- Key concepts (what is dhikr, physical tasbeeh, streaks, iOS limitations)
- How-to & tips (backup/restore, dark mode, troubleshooting)
- FAQ section (common questions, platform limitations)
- Accessibility section (screen reader, keyboard, touch targets)
- v1 features list (implemented vs planned)
- Privacy and data storage explanation

#### Component 6: Developer Documentation (`docs/testing.md`)
**Responsibility:** Testing guide for contributors and maintainers.

**Key Features:**
- How to run tests (npm test, npm run test:ui)
- Test structure and organization
- How to write new tests (patterns, examples)
- Mocking strategies (IndexedDB, browser APIs, date functions)
- Coverage requirements and enforcement
- Performance considerations (fast tests, parallel execution)

#### Component 7: Updated Architecture (`docs/architecture.md`)
**Responsibility:** Final architecture documentation reflecting v1 implementation.

**Key Features:**
- Remove "pending" language, mark as final
- Document final schema and migrations from Epics 1-4
- Add performance benchmarks (FCP, TTI, bundle size)
- Update data flow diagrams with implemented patterns
- Document testing infrastructure and strategies
- Add regression detection thresholds

## Data Model

### Test Data Schema

```typescript
// Test fixtures follow production schema but with simplified defaults

interface TestZikr {
  id?: number;
  name: string;
  custom: boolean;
  createdAt: Date;
  deletedAt?: Date;
}

interface TestSession {
  id?: number;
  zikrId: number;
  count: number;
  source: 'app' | 'manual' | 'physical';
  timestamp: Date;
  date: Date;
}

interface TestGoal {
  id?: number;
  zikrId: number;
  targetCount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

interface TestStreak {
  zikrId: number;
  currentStreak: number;
  longestStreak: number;
  lastProcessedDate: Date;
}
```

### Test Database Setup

```typescript
// Creates isolated fake-indexeddb instance for each test
function createMockDatabase(): Dexie {
  const db = new Dexie('test-zikr-db', {
    indexedDB: fakeIndexedDB(),
    addTeardown: (fn: () => void) => teardown.push(fn)
  });
  
  db.version(1).stores({
    zikrs: '++id, name, custom, createdAt, deletedAt',
    sessions: '++id, zikrId, date, [zikrId+date]',
    goals: '++id, zikrId, status',
    streaks: 'zikrId',
    settings: 'key'
  });
  
  return db;
}
```

## File Structure

```
zikr/
├── vitest.config.ts                    # NEW: Vitest configuration
├── package.json                        # MODIFY: Add test scripts and dependencies
├── README.md                           # NEW: User documentation
├── docs/
│   ├── architecture.md                 # MODIFY: Update to final status
│   └── testing.md                      # NEW: Testing guide for developers
├── src/
│   ├── __tests__/                      # NEW: Test directory
│   │   ├── test-utils.ts              # Centralized test utilities
│   │   ├── mocks/                     # Mock implementations
│   │   │   ├── mockDexie.ts           # Dexie.js mocks
│   │   │   ├── mockBrowserApis.ts     # Browser API mocks
│   │   │   ├── mockDateUtils.ts       # Date utility mocks
│   │   │   └── mockLiveQuery.ts       # liveQuery mocks
│   │   ├── services/                  # Service layer tests
│   │   │   ├── zikrService.test.ts
│   │   │   ├── sessionService.test.ts
│   │   │   ├── goalService.test.ts
│   │   │   ├── streakService.test.ts
│   │   │   ├── migrationService.test.ts
│   │   │   └── errorRecovery.test.ts
│   │   ├── db/                        # Database layer tests
│   │   │   ├── db.test.ts
│   │   │   ├── migrations.test.ts
│   │   │   ├── seed.test.ts
│   │   │   └── types.test.ts
│   │   ├── stores/                    # State management tests
│   │   │   ├── zikrStore.test.ts
│   │   │   ├── sessionStore.test.ts
│   │   │   ├── goalStore.test.ts
│   │   │   ├── settingsStore.test.ts
│   │   │   └── uiStore.test.ts
│   │   ├── components/                # Component tests
│   │   │   ├── ZikrList.test.tsx
│   │   │   ├── AddZikrModal.test.tsx
│   │   │   ├── EditZikrModal.test.tsx
│   │   │   ├── ManualEntryModal.test.tsx
│   │   │   ├── DeleteConfirmationModal.test.tsx
│   │   │   ├── Counter.test.tsx
│   │   │   ├── Goals.test.tsx
│   │   │   ├── Progress.test.tsx
│   │   │   └── Settings.test.tsx
│   │   └── utils/                     # Utility tests
│   │       ├── dateUtils.test.ts
│   │       └── validation.test.ts
└── test/                              # NEW: Test fixtures directory
    ├── fixtures/                      # Test data
    │   ├── predefinedZikrs.ts
    │   ├── sessions.ts
    │   ├── goals.ts
    │   ├── streaks.ts
    │   └── settings.ts
    └── setup.ts                       # Global test setup
```

## Implementation Examples

### Vitest Configuration

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/', 'src/__tests__/'],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90
        },
        // Critical business logic requires 100% coverage
        'src/core/services/streakService.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100
        },
        'src/core/services/sessionService.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100
        },
        'src/core/services/goalService.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100
        }
      }
    },
    include: ['src/**/__tests__/**/*.{test,spec}.{js,ts,tsx}'],
    testTimeout: 10000 // 10s timeout for async operations
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

### Service Test Example

```typescript
// src/__tests__/services/streakService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateStreak, getStreak } from '../../core/services/streakService';
import { createMockDatabase } from '../test-utils';
import { TestZikr, TestSession } from '../../../test/fixtures';

describe('streakService', () => {
  let mockDb: Dexie;
  let testZikr: TestZikr;

  beforeEach(async () => {
    mockDb = createMockDatabase();
    testZikr = await mockDb.zikrs.add({
      name: 'Test Zikr',
      custom: false,
      createdAt: new Date('2024-01-01')
    });
    
    // Mock date to ensure deterministic testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('updateStreak', () => {
    it('should increment streak when consecutive days', async () => {
      // Day 1: Create session
      await mockDb.sessions.add({
        zikrId: testZikr,
        count: 33,
        source: 'app',
        timestamp: new Date('2024-01-14T10:00:00Z'),
        date: new Date('2024-01-14')
      });
      
      let streak = await updateStreak(testZikr, new Date('2024-01-14'));
      expect(streak.currentStreak).toBe(1);
      expect(streak.longestStreak).toBe(1);

      // Day 2: Next session (consecutive day)
      streak = await updateStreak(testZikr, new Date('2024-01-15'));
      expect(streak.currentStreak).toBe(2);
      expect(streak.longestStreak).toBe(2);
    });

    it('should reset streak when gap > 1 day', async () => {
      // Day 1: Create session
      await mockDb.sessions.add({
        zikrId: testZikr,
        count: 33,
        source: 'app',
        timestamp: new Date('2024-01-13T10:00:00Z'),
        date: new Date('2024-01-13')
      });

      let streak = await updateStreak(testZikr, new Date('2024-01-13'));
      expect(streak.currentStreak).toBe(1);

      // Day 4: Gap of 2 days (should reset)
      streak = await updateStreak(testZikr, new Date('2024-01-15'));
      expect(streak.currentStreak).toBe(0); // Reset
      expect(streak.longestStreak).toBe(1); // Longest preserved
    });

    it('should not increment streak on same day', async () => {
      // Morning session
      await mockDb.sessions.add({
        zikrId: testZikr,
        count: 33,
        source: 'app',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        date: new Date('2024-01-15')
      });

      let streak = await updateStreak(testZikr, new Date('2024-01-15'));
      expect(streak.currentStreak).toBe(1);

      // Evening session (same day)
      streak = await updateStreak(testZikr, new Date('2024-01-15'));
      expect(streak.currentStreak).toBe(1); // No increment
    });

    it('should handle timezone changes correctly', async () => {
      // Session in UTC
      await mockDb.sessions.add({
        zikrId: testZikr,
        count: 33,
        source: 'app',
        timestamp: new Date('2024-01-14T23:00:00Z'),
        date: new Date('2024-01-14')
      });

      let streak = await updateStreak(testZikr, new Date('2024-01-14'));
      expect(streak.currentStreak).toBe(1);

      // Next day in different timezone
      vi.setSystemTime(new Date('2024-01-15T01:00:00Z')); // 2 hours later
      streak = await updateStreak(testZikr, new Date('2024-01-15'));
      expect(streak.currentStreak).toBe(2); // Different local day
    });
  });

  describe('getStreak', () => {
    it('should return undefined for non-existent streak', async () => {
      const streak = await getStreak(999);
      expect(streak).toBeUndefined();
    });

    it('should return existing streak', async () => {
      const testStreak = {
        zikrId: testZikr,
        currentStreak: 5,
        longestStreak: 10,
        lastProcessedDate: new Date('2024-01-15')
      };
      
      await mockDb.streaks.add(testStreak);
      const streak = await getStreak(testZikr);
      
      expect(streak).toMatchObject({
        currentStreak: 5,
        longestStreak: 10
      });
    });
  });
});
```

### Component Test Example

```typescript
// src/__tests__/components/ZikrList.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ZikrList } from '../../components/ZikrList';
import { createMockDatabase } from '../test-utils';
import { TestZikr } from '../../../test/fixtures';

describe('ZikrList', () => {
  let mockDb: Dexie;

  beforeEach(async () => {
    mockDb = createMockDatabase();
    
    // Seed test data
    await mockDb.zikrs.bulkAdd([
      { name: 'SubhanAllah', custom: false, createdAt: new Date() },
      { name: 'Alhamdulillah', custom: false, createdAt: new Date() },
      { name: 'My Custom Zikr', custom: true, createdAt: new Date() }
    ]);
  });

  it('should render predefined and custom zikrs', async () => {
    const { getByText } = render(<ZikrList />);
    
    await waitFor(() => {
      expect(getByText('Common Zikrs')).toBeInTheDocument();
      expect(getByText('SubhanAllah')).toBeInTheDocument();
      expect(getByText('Alhamdulillah')).toBeInTheDocument();
      expect(getByText('My Zikrs')).toBeInTheDocument();
      expect(getByText('My Custom Zikr')).toBeInTheDocument();
    });
  });

  it('should show custom badge for custom zikrs', async () => {
    const { getByText } = render(<ZikrList />);
    
    await waitFor(() => {
      const customBadge = getByText('Custom');
      expect(customBadge).toBeInTheDocument();
      expect(customBadge).toHaveClass('bg-gray-200');
    });
  });

  it('should handle empty state', async () => {
    // Clear all zikrs
    await mockDb.zikrs.clear();
    
    const { getByText } = render(<ZikrList />);
    
    await waitFor(() => {
      expect(getByText('No zikrs yet - create your first one!')).toBeInTheDocument();
      expect(getByText('Add Zikr')).toBeInTheDocument();
    });
  });

  it('should handle zikr selection', async () => {
    const handleSelect = vi.fn();
    const { getByText } = render(<ZikrList onZikrSelect={handleSelect} />);
    
    await waitFor(() => {
      const zikrButton = getByText('SubhanAllah');
      fireEvent.click(zikrButton);
    });

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'SubhanAllah' })
    );
  });

  it('should support keyboard navigation', async () => {
    const { getByText } = render(<ZikrList />);
    
    await waitFor(() => {
      const zikrButton = getByText('SubhanAllah');
      zikrButton.focus();
      
      fireEvent.keyDown(zikrButton, { key: 'Enter' });
    });
    
    // Should trigger selection
    expect(zikrButton).toHaveFocus();
  });

  it('should meet accessibility requirements', async () => {
    const { container } = render(<ZikrList />);
    
    // Check ARIA labels
    const editButtons = container.querySelectorAll('[aria-label="Edit zikr"]');
    const deleteButtons = container.querySelectorAll('[aria-label="Delete zikr"]');
    
    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
    
    // Check touch target sizes (min 44x44px)
    editButtons.forEach(button => {
      const styles = window.getComputedStyle(button);
      const height = parseInt(styles.height);
      const width = parseInt(styles.width);
      expect(height).toBeGreaterThanOrEqual(44);
      expect(width).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### Store Test Example

```typescript
// src/__tests__/stores/zikrStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useZikrStore } from '../../stores/zikrStore';
import { createMockDatabase } from '../test-utils';

describe('zikrStore', () => {
  let mockDb: Dexie;

  beforeEach(async () => {
    mockDb = createMockDatabase();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useZikrStore());
    
    expect(result.current.zikrs).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load zikrs from database', async () => {
    await mockDb.zikrs.bulkAdd([
      { name: 'Test Zikr 1', custom: true, createdAt: new Date() },
      { name: 'Test Zikr 2', custom: true, createdAt: new Date() }
    ]);

    const { result, waitForNextUpdate } = renderHook(() => useZikrStore());
    
    await act(async () => {
      result.current.initialize();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.zikrs.length).toBe(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle database errors gracefully', async () => {
    // Mock database to throw error
    vi.spyOn(mockDb.zikrs, 'toArray').mockRejectedValue(
      new Error('IndexedDB blocked')
    );

    const { result, waitForNextUpdate } = renderHook(() => useZikrStore());
    
    await act(async () => {
      result.current.initialize();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.error).toBe(
      'Failed to load zikrs. Please check browser storage permissions.'
    );
    expect(result.current.loading).toBe(false);
  });

  it('should update reactively when database changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useZikrStore());
    
    await act(async () => {
      result.current.initialize();
    });
    
    // Add zikr to database
    await act(async () => {
      await mockDb.zikrs.add({
        name: 'New Zikr',
        custom: true,
        createdAt: new Date()
      });
    });
    
    await waitForNextUpdate();
    
    expect(result.current.zikrs.length).toBe(1);
    expect(result.current.zikrs[0].name).toBe('New Zikr');
  });
});
```

### Package.json Updates

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "size-check": "bundlesize",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "@vitest/ui": "^1.6.0",
    "@testing-library/react": "^14.3.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "fake-indexeddb": "^5.0.0",
    "vitest": "^1.6.0",
    "jsdom": "^24.0.0"
  }
}
```

## Integration Points

### Vite Configuration Compatibility
- Vitest uses same Vite config (no conflicts)
- Test environment uses jsdom (matches browser behavior)
- Module resolution identical to production
- React plugin works with Vitest

### Database Layer Integration
- fake-indexeddb mimics real IndexedDB behavior
- Tests use same schema definition as production
- Migrations tested in isolation
- Seed data tested for idempotency

### Service Layer Integration
- Services use mocked db instead of real db
- Same function signatures and error handling
- Integration points verified (session → streak update)
- Transaction behavior tested with fake-indexeddb

### State Management Integration
- Zustand stores tested with mocked liveQuery
- Reactive updates verified with test utilities
- Error recovery patterns tested
- Store persistence tested with mock localStorage

### PWA Testing Integration
- Service worker registration mocked
- Offline functionality tested with network emulation
- Cache strategies tested
- PWA installability verified

## Considerations

### Performance

**Test Execution Speed:**
- Target <2 minutes for full suite (<100ms per test)
- Parallel test execution (Vitest default)
- In-memory fake-indexeddb (faster than real IndexedDB)
- Selective test running with `vitest run <pattern>`

**Coverage Performance:**
- Coverage collection disabled by default (use `npm run test:coverage`)
- v8 provider faster than Istanbul (default)
- Excludes test files from coverage calculation

**Documentation Performance:**
- README loads instantly (plain markdown)
- No external dependencies or build steps
- Optimized for mobile readability (responsive text)

### Security

**Test Data Isolation:**
- Each test gets fresh fake-indexeddb instance
- No test data leaks between tests
- Mock browser APIs isolated per test
- Date mocking properly reset after each test

**Mock Security:**
- No real network calls in tests
- No IndexedDB persistence (in-memory only)
- No localStorage persistence (mocked)
- No service worker registration (mocked)

**Documentation Security:**
- Local-only storage clearly communicated
- Export/import security considerations documented
- Privacy policy included in README
- Data ownership explained (user controls their data)

### Maintainability

**Test Maintainability:**
- Centralized utilities reduce duplication
- Fixtures separate from test logic
- Clear test organization mirrors source structure
- Comprehensive testing guide for developers

**Documentation Maintainability:**
- Version-stamped (v1) to avoid confusion
- Section-based for easy updates
- Link to architecture docs for technical details
- FAQ section accumulates common questions

### Infrastructure

**Local Testing Only:**
- No CI/CD setup required
- No external dependencies or services
- Runs on developer machine
- Minimal setup (npm install + npm test)

**Monitoring & Debugging:**
- Vitest UI mode for test visualization
- Coverage HTML report for coverage gaps
- Clear error messages with context
- Test organization supports targeted debugging

## Mocking Strategy

### Dexie.js Mocking

```typescript
// src/__tests__/mocks/mockDexie.ts
import Dexie from 'dexie';
import fakeIndexedDB from 'fake-indexeddb';

export function createMockDexie(): Dexie {
  const db = new Dexie('test-zikr-db', {
    indexedDB: fakeIndexedDB(),
    addTeardown: (fn: () => void) => teardown.push(fn)
  });

  db.version(1).stores({
    zikrs: '++id, name, custom, createdAt, deletedAt',
    sessions: '++id, zikrId, date, [zikrId+date]',
    goals: '++id, zikrId, status',
    streaks: 'zikrId',
    settings: 'key'
  });

  return db;
}
```

### Browser API Mocking

```typescript
// src/__tests__/mocks/mockBrowserApis.ts
export function mockBrowserApis() {
  // Mock navigator.vibrate
  global.navigator.vibrate = vi.fn().mockReturnValue(true);

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };
  global.localStorage = localStorageMock;

  // Mock service worker registration
  global.navigator.serviceWorker = {
    register: vi.fn().mockResolvedValue({
      then: vi.fn(),
      catch: vi.fn()
    })
  };
}
```

### Date/Time Mocking

```typescript
// src/__tests__/mocks/mockDateUtils.ts
export function mockDate(date: Date) {
  vi.useFakeTimers();
  vi.setSystemTime(date);
}

export function advanceTime(days: number) {
  const current = vi.getMockedSystemTime();
  const newDate = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
  vi.setSystemTime(newDate);
}
```

### LiveQuery Mocking

```typescript
// src/__tests__/mocks/mockLiveQuery.ts
export function createMockLiveQuery<T>(
  query: () => Promise<T>,
  onUpdate: (data: T) => void,
  onError: (error: Error) => void
) {
  let cancelled = false;

  (async () => {
    if (!cancelled) {
      try {
        const data = await query();
        onUpdate(data);
      } catch (error) {
        onError(error as Error);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}
```

## Documentation Structure

### README.md Outline

```markdown
# Zikr - Islamic Dhikr Practice App

## Welcome to Zikr 🤲
- What is dhikr? (Islamic context)
- Why Zikr? (differentiators)

## First Time Setup
- Install as PWA (iOS + Android)
- Quick start workflow
- Immediate value demonstration

## Feature Guides
- Using the Counter
- Managing Zikrs
- Manual Progress Entry
- Setting Goals
- Viewing Progress
- Settings & Configuration

## Key Concepts
- What is dhikr?
- Physical Tasbeeh vs Digital Counter
- How Streaks Work
- Manual Progress Entry Purpose
- Platform Limitations

## How-to & Tips
- Data Backup and Restore
- Dark Mode Usage
- Troubleshooting Common Issues
- Offline Usage Guide

## Accessibility
- Screen Reader Support
- Keyboard Navigation
- Touch Targets

## FAQ
- iOS reminder limitations
- Offline functionality
- Data privacy
- Cross-device transfer

## v1 Features
- Implemented features
- Planned v1.1/v2 features

## Privacy & Data Storage
- Local-only storage
- No cloud sync
- Your data, your control
```

### docs/testing.md Outline

```markdown
# Testing Guide

## Running Tests
- npm test (basic test run)
- npm run test:ui (UI mode)
- npm run test:coverage (coverage report)

## Test Structure
- Directory organization
- Naming conventions
- Test file patterns

## Writing Tests
- Service layer tests
- Component tests
- Store tests
- Utility tests

## Mocking Strategies
- IndexedDB mocking (fake-indexeddb)
- Browser API mocking
- Date/time mocking
- liveQuery mocking

## Coverage Requirements
- >90% overall target
- 100% for critical business logic
- Enforcement and reporting

## Performance Considerations
- Fast test execution
- Parallel testing
- Selective test running
```

## Success Criteria

**Testing:**
- ✅ All tests pass consistently (100% pass rate)
- ✅ Code coverage >90% across all modules
- ✅ Critical business logic has 100% coverage (streaks, goals, sessions)
- ✅ Test suite executes in <2 minutes
- ✅ Tests are maintainable and clear
- ✅ Local testing works with `npm test`

**Documentation:**
- ✅ README.md provides comprehensive user guide
- ✅ All features documented with step-by-step instructions
- ✅ Key concepts explained (dhikr, streaks, manual entry)
- ✅ Platform limitations clearly communicated
- ✅ Troubleshooting section included
- ✅ docs/architecture.md updated to final status
- ✅ docs/testing.md created with test guide
- ✅ Documentation is clear and non-technical

**Quality Gates:**
- ✅ All tests pass before Epic 5 completion
- ✅ Coverage thresholds met
- ✅ Documentation reviewed for clarity
- ✅ Epic 5 marks v1 release completion

---

**Architecture Design Complete**

*Testing infrastructure ensures code quality and reliability*  
*Mocking strategies address IndexedDB, browser APIs, and time dependencies*  
*Test organization mirrors source structure for maintainability*  
*User documentation supports mixed practitioner audience*  
*Developer documentation enables future contributions*

**Next Phase:** Design review to validate technical approach and architectural decisions
