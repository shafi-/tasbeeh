# Architecture: Epic 4 - Progress, Settings & Polish

**Epic**: Epic 4: Progress, Settings & Polish
**Date**: 2026-06-15
**Status**: Draft
**Based on**: `.pipeline/artifacts/epic-4-requirements.md`
**Builds on**: Epic 1 (Foundation) + Epic 2 (Core Features) + Epic 3 (Goals & Streaks)

---

## Architecture Overview

This epic extends Epics 1-3 with visualization, configuration, and polish features. The architecture maintains consistency with established patterns:
- **Feature-based structure**: Components grouped by story
- **Shared infrastructure**: Reuses Epic 1-3 services/stores
- **State management**: Zustand stores with liveQuery
- **Data layer**: Dexie.js with existing schema
- **No new dependencies**: Zero new libraries added

---

## Component Architecture

### High-Level Structure

```
src/
├── components/
│   ├── WeeklyChart.tsx         # Story 4.1: Weekly bar chart
│   ├── TodaySummary.tsx         # Story 4.1: Today's summary display
│   ├── PlatformLimitationsInfo.tsx # Story 4.2: Platform docs
│   └── (reuses GoalList, StreakBadge from Epic 3)
├── services/
│   └── exportService.ts         # Story 4.2: Data export/import
├── utils/
│   └── progressUtils.ts         # Story 4.1: Progress calculations
├── pages/
│   ├── Progress.tsx             # Story 4.1: Main progress screen
│   └── Settings.tsx             # Story 4.2: Settings screen
└── App.tsx                      # Story 4.2: Dark mode initialization
```

### Component Hierarchy

```
App.tsx (with dark mode)
└── HashRouter
    ├── Navigation (existing)
    └── Routes
        ├── / → Counter.tsx (existing)
        ├── /goals → Goals.tsx (existing)
        ├── /progress → Progress.tsx (update: full implementation)
        │   ├── TodaySummary (new)
        │   ├── WeeklyChart (new)
        │   └── GoalProgressSection (reuses GoalList)
        └── /settings → Settings.tsx (update: full implementation)
            ├── Appearance Section (dark mode)
            ├── Data Management Section (export/import)
            ├── App Info Section
            └── Platform Limitations Section
```

---

## Data Flow Architecture

### Story 4.1: Progress Visualization Flow

```
User opens /progress
  └─▶ Component mounts
  └─▶ Store subscriptions (via liveQuery):
      ├─▶ sessionStore.sessions
      ├─▶ goalStore.goals
      └─▶ zikrStore.zikrs
  └─▶ Calculations (progressUtils):
      ├─▶ calculateTodayTotal(sessions)
      ├─▶ calculateTodayBreakdown(sessions, zikrs)
      └─▶ calculateWeeklyData(sessions)
  └─▶ UI renders three sections
```

**State Sources**:
- Primary: sessionStore, goalStore, zikrStore (reactive via liveQuery)
- Utilities: progressService (new, for calculations)
- Dependencies: Epic 1-3 stores

---

### Story 4.2: Settings & Configuration Flow

```
User opens /settings
  └─▶ Settings screen loads
  └─▶ Dark mode from settingsStore or system preference

User toggles dark mode:
  └─▶ settingsStore.saveSetting('darkMode', value)
  └─▶ applyDarkMode(value)
  └─▶ document.documentElement.classList toggle 'dark'

User exports data:
  └─▶ exportService.exportData()
  └─▶ Promise.all() queries all 5 stores
  └─▶ JSON structure created
  └─▶ Blob + URL.createObjectURL()
  └─▶ Download triggered

User imports data:
  └─▶ File input → exportService.importData(file)
  └─▶ JSON validation
  └─▶ Backup existing data
  └─▶ Clear all stores (transaction)
  └─▶ Bulk import all entities
  └─▶ liveQuery updates all stores
```

**State Sources**:
- Primary: settingsStore (dark mode preference)
- Services: exportService (new, for data management)
- Browser: matchMedia API (system preference)

---

## File Structure & Implementation

### Story 4.1: Progress Visualization (5 files)

#### 1. `src/utils/progressUtils.ts`
**Purpose**: Progress calculation utilities

**Functions**:
```typescript
export function calculateTodayTotal(sessions: Session[]): number;
export function calculateTodayBreakdown(sessions: Session[], zikrs: Zikr[]): Breakdown[];
export function calculateWeeklyData(sessions: Session[]): DailyData[];
```

**Implementation**:
- Filter sessions by date (today, this week)
- Aggregate counts by zikr
- Return arrays for chart rendering

---

#### 2. `src/components/WeeklyChart.tsx`
**Purpose**: Simple HTML/CSS bar chart

**Component Structure**:
```typescript
interface DailyData {
  date: Date;
  total: number;
  isToday: boolean;
  dayLabel: string;
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  // Auto-scale Y-axis based on max count
  // Render 7 bars with CSS heights
  // Tap interaction shows exact count
  // ARIA labels for accessibility
}
```

**Key Features**:
- No chart library (pure HTML/CSS)
- Auto-scaling Y-axis
- Today's bar highlighted
- Touch-friendly tooltips

---

#### 3. `src/components/TodaySummary.tsx`
**Purpose**: Display today's practice summary

**Component Structure**:
```typescript
export function TodaySummary({ total, breakdown }: TodaySummaryProps) {
  // Show total count
  // Show breakdown by zikr with icons
  // Handle empty state
}
```

---

#### 4. `src/pages/Progress.tsx` (update)
**Purpose**: Main progress screen

**Implementation**:
```typescript
export function Progress() {
  const sessions = useSessionStore(state => state.sessions);
  const goals = useGoalStore(state => state.goals);
  const zikrs = useZikrStore(state => state.zikrs);
  
  // Calculate progress data
  const todayTotal = calculateTodayTotal(sessions);
  const weeklyData = calculateWeeklyData(sessions);
  
  // Handle empty state
  if (sessions.length === 0) return <EmptyProgressState />;
  
  return (
    <div>
      <TodaySummary total={todayTotal} breakdown={todayBreakdown} />
      <WeeklyChart data={weeklyData} />
      <GoalProgressSection goals={activeGoals} />
    </div>
  );
}
```

---

#### 5. `src/components/GoalProgressSection.tsx`
**Purpose**: Reuse Epic 3 GoalList component

**Implementation**:
```typescript
export function GoalProgressSection({ goals }: Props) {
  // Filter for active goals
  // Reuse GoalList from Epic 3
  // Add "View All Goals" link
}
```

---

### Story 4.2: Settings & Configuration (5 files)

#### 1. `src/services/exportService.ts`
**Purpose**: Data export/import service

**Functions**:
```typescript
export async function exportData(): Promise<void>;
export async function importData(file: File): Promise<void>;
```

**Implementation**:
```typescript
interface ExportData {
  version: string;
  exportDate: string;
  data: {
    zikrs: Zikr[];
    sessions: Session[];
    goals: Goal[];
    streaks: Streak[];
    settings: Setting[];
  };
}

export const exportService = {
  async exportData(): Promise<void> {
    // Promise.all() queries all stores
    // Create JSON structure
    // Download with Blob API
  },
  
  async importData(file: File): Promise<void> {
    // Read file, validate JSON
    // Backup existing data
    // Clear stores, import entities
    // Rollback on failure
  }
};
```

---

#### 2. `src/pages/Settings.tsx` (update)
**Purpose**: Main settings screen

**Implementation**:
```typescript
export function Settings() {
  const settingsStore = useSettingsStore();
  const darkMode = settingsStore.getSetting('darkMode') ?? systemPref;
  
  const handleDarkModeToggle = async () => {
    const newMode = !darkMode;
    await settingsStore.saveSetting('darkMode', newMode);
    applyDarkMode(newMode);
  };
  
  const handleExport = async () => {
    await exportService.exportData();
  };
  
  const handleImport = async (file: File) => {
    await exportService.importData(file);
  };
  
  return (
    <div>
      <AppearanceSection darkMode={darkMode} onToggle={handleDarkModeToggle} />
      <DataManagementSection onExport={handleExport} onImport={handleImport} />
      <AppInfoSection />
      <PlatformLimitationsSection />
    </div>
  );
}
```

---

#### 3. `src/App.tsx` (update)
**Purpose**: Dark mode initialization

**Implementation**:
```typescript
useEffect(() => {
  const initializeDarkMode = async () => {
    const userSetting = settingsStore.getSetting('darkMode');
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = userSetting ?? systemPref;
    applyDarkMode(shouldBeDark);
  };
  
  initializeDarkMode();
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    if (settingsStore.getSetting('darkMode') === undefined) {
      applyDarkMode(e.matches);
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

---

#### 4. `src/components/PlatformLimitationsInfo.tsx`
**Purpose**: Platform limitation documentation

**Implementation**:
```typescript
export function PlatformLimitationsInfo() {
  return (
    <section>
      <h2>Platform Limitations</h2>
      <p>iOS: Background reminders not supported (Apple limitation)</p>
      <p>Android: Full reminder support available</p>
      <p>Cross-platform: In-app reminders work on all platforms</p>
    </section>
  );
}
```

---

#### 5. `src/components/DataManagementSection.tsx`
**Purpose**: Data export/import UI

**Implementation**:
```typescript
export function DataManagementSection() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  
  return (
    <section>
      <button onClick={handleExport} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export Data'}
      </button>
      <input type="file" accept=".json" onChange={handleImport} />
      <button onClick={handleClearAll} className="destructive">
        Clear All Data
      </button>
    </section>
  );
}
```

---

### Story 4.3: Polish & Accessibility (4 files)

#### 1. `src/index.css` (update)
**Purpose**: Global animations and transitions

**Implementation**:
```css
.transition-all {
  transition: all 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

#### 2-4. All Component Files (updates)
**Purpose**: Accessibility compliance

**Implementation**:
- **Touch Targets**: Ensure ≥ 44x44px on all interactive elements
- **ARIA Labels**: Add to icon-only buttons, progress bars, modals
- **Color Contrast**: Verify ≥ 4.5:1 for all text
- **Semantic HTML**: Use proper elements and roles

---

## State Management Integration

### No New Stores Required

**Existing Stores (from Epic 1-3)**:
- sessionStore: Sessions for progress calculations
- goalStore: Goals for progress display
- zikrStore: Zikr names/icons for display
- settingsStore: Dark mode preference

**New Utilities (not stores)**:
- progressUtils: Pure calculation functions
- exportService: Data management service

---

## Performance Considerations

### Optimization Strategies

1. **Progress Calculations**: Process arrays in memory (< 100ms for 1000 sessions)
2. **Weekly Chart**: Pure CSS rendering (no library overhead)
3. **Export/Import**: Promise.all() for parallel queries, chunked bulk operations
4. **Code Splitting**: React.lazy() for page components
5. **Tailwind Purge**: Ensure content paths are correct

### Performance Targets
- Progress calculations: < 100ms
- Chart rendering: < 50ms
- Export: < 1s (10K sessions)
- Import: < 5s (10K sessions)
- UI updates: 60fps animations

---

## Accessibility Strategy

### WCAG 2.1 AA Compliance

**Touch Targets**: All interactive elements ≥ 44x44px
- Audit existing components
- Add padding where needed
- Use min-h-[44px] Tailwind class

**ARIA Labels**:
- Icon-only buttons: aria-label
- Progress bars: aria-valuenow, aria-valuemin, aria-valuemax
- Modals: role="dialog", aria-modal="true"
- Navigation: role="navigation", landmark labels

**Color Contrast**:
- Use Tailwind accessible palette
- Verify ≥ 4.5:1 for normal text
- Verify ≥ 3:1 for large text (18pt+)
- Test with contrast checker

**Reduced Motion**:
- Respect prefers-reduced-motion media query
- Provide fallback for animations
- Ensure content is readable without motion

---

## Error Handling

### Component Level
- Progress screen: Fallback to empty state on error
- Settings: Toast notifications for export/import success/failure
- Weekly chart: Handle zero-data gracefully

### Service Level
- Export: User notification on failure, retry option
- Import: Rollback on error, clear error messages
- IndexedDB: Use existing createRetryableSubscription pattern

### User Feedback
- Success: Toast notifications
- Error: Inline errors + toasts
- Loading: Spinners during async operations

---

## Deployment Considerations

### Build Process
- No new dependencies required
- Code splitting configured (React.lazy)
- Tailwind purge optimization
- Bundle size monitoring enabled

### PWA Update
- Service worker auto-update (Epic 1)
- No cache busting needed
- Incremental changes only

### Rollback
- If issues: Delete from IndexedDB (users keep data)
- Or: Revert to previous build (PWA auto-update)

---

## Architecture Review Checklist

- [ ] Builds on Epic 1-3 without breaking changes
- [ ] Reuses existing patterns (stores, services, components)
- [ ] No new dependencies (bundle size maintained)
- [ ] Performance targets defined and achievable
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Error handling comprehensive
- [ ] Offline functionality maintained
- [ ] Mobile-first design respected
- [ ] Touch targets ≥ 44x44px
- [ ] Integration points documented

---

## Success Metrics

### Functional
- User can view daily and weekly progress
- User can export and import their data
- User can toggle dark mode
- Platform limitations communicated transparently
- All interactive elements meet accessibility standards

### Performance
- Progress calculations < 100ms
- Chart rendering < 50ms
- Export < 1s, Import < 5s
- UI 60fps during animations
- Bundle size < 200KB gzipped

### User Experience
- Progress visualization is clear and motivating
- Settings interface is intuitive
- Data export/import is straightforward
- Animations are smooth and polished
- Dark mode works seamlessly

---

**Status**: ✅ Architecture complete
**Next Phase**: Design Review (Phase 2.1)