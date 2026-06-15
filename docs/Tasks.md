# Tasks: Zikr PWA v1

**Project**: Zikr - Islamic Dhikr PWA
**Status**: Ready for Implementation
**Last Updated**: 2026-06-15 (Updated with review feedback)
**Tech Stack**: React + Vite + Zustand + Dexie.js + Tailwind CSS

---

## Review Feedback Integration

**From Architecture Review (4 issues addressed):**
1. ✅ Streak calculation - Task 3.2.1 adds `lastProcessedDate` to prevent same-day increments
2. ✅ Cascade delete - Task 2.1.4 implements prompt for related data handling
3. ✅ State sync - Task 1.3.3 uses Dexie liveQuery pattern
4. ✅ Notifications scope - Clarified: v1 = in-app reminders only

**From Requirements Review (4 clarifications):**
1. ✅ Auto-save timing - Task 2.2.3: Save on target reached OR app close
2. ✅ Timezone handling - All tasks use device local time consistently
3. ✅ Cascade delete behavior - Task 2.1.4: Prompt user with options
4. ✅ Reminder scope - v1: In-app only, cross-platform

**From ADR Review (6 concerns addressed):**
1. ✅ Bundle size CI - Task 4.4.3: Lighthouse audit + size monitoring
2. ✅ React.memo profiling - Task 4.4.3: Performance audit includes profiling
3. ✅ Migration timing - Task 1.2.3: Migrations on app open with progress indicator
4. ✅ Memory-only fallback - Task 1.2.4: Persistent warning banner designed
5. ✅ Alarm API limitation - Task 4.2.5: Documented Safari limitation
6. ✅ v1 reminder scope - Epic 4, Story 4.2: In-app reminders only

---

## Epic 1: Foundation & Infrastructure

**Description**: Set up the project infrastructure, PWA configuration, and data layer.

### Story 1.1: Project Setup

**As a** developer
**I want** a properly configured React + Vite project
**So that** the team can start building features

**Acceptance**:
- React + Vite project created
- TypeScript configured
- Tailwind CSS integrated
- ESLint + Prett configured
- Git repository initialized
- Bundle size monitoring configured

#### Task 1.1.1: Initialize Vite + React project
- **File**: `package.json`, `vite.config.ts`, `tsconfig.json`
- **Acceptance**: Vite dev server runs on localhost:5173
- **Dependencies**: None
- **Guidelines**: Use `create-vite` with TypeScript template

#### Task 1.1.2: Configure Tailwind CSS
- **File**: `tailwind.config.js`, `src/index.css`, `src/App.tsx`
- **Acceptance**: Tailwind classes work, dark mode configured, purge configured
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D tailwindcss postcss autoprefixer`
  - Configure `darkMode: 'class'` for manual dark mode toggle
  - Configure `content` paths for purging unused styles
  - Add base Tailwind directives to index.html

#### Task 1.1.3: Configure PWA with vite-plugin-pwa
- **File**: `vite.config.ts`, `public/manifest.webmanifest`
- **Acceptance**: PWA installable on mobile, service worker registered
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D vite-plugin-pwa`
  - Configure manifest with app name, icons, colors
  - Enable `registerType: 'autoUpdate'` for service worker
  - Add PWA meta tags to index.html
  - **ADR 003**: Cross-platform PWA strategy

#### Task 1.1.4: Configure bundle size monitoring
- **File**: `package.json`, `bundlesize.config.json`
- **Acceptance**: Build fails if bundle exceeds 200KB gzipped
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D bundlesize`
  - Add `size-check` script to package.json
  - Configure threshold at 200KB gzipped
  - **ADR 001 concern**: Automated CI check for bundle size

---

### Story 1.2: Data Layer (IndexedDB + Dexie.js)

**As a** developer
**I want** a properly configured IndexedDB database
**So that** user data persists locally

**Acceptance**:
- Dexie.js configured with all stores
- TypeScript interfaces defined
- Database versioning strategy in place
- Migration timing specified
- Error handling documented

#### Task 1.2.1: Install and configure Dexie.js
- **File**: `src/services/db.ts`
- **Acceptance**: Database opens successfully, all stores defined
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install dexie`
  - Create database named `zikr-db` version 1
  - Define stores: `zikrs`, `sessions`, `goals`, `streaks`, `settings`
  - **ADR 002**: IndexedDB as primary data store

#### Task 1.2.2: Create TypeScript interfaces
- **File**: `src/services/db.ts` (interfaces)
- **Acceptance**: All entities have proper TypeScript types
- **Dependencies**: Task 1.2.1
- **Guidelines**:
  - Export interfaces: `Zikr`, `Session`, `Goal`, `Streak`, `Setting`
  - Use `++id` for auto-increment primary keys
  - Mark optional fields with `?`
  - Add `lastProcessedDate` to Streak interface (architecture review fix)

#### Task 1.2.3: Implement database versioning and migrations
- **File**: `src/services/db.ts` (migration functions)
- **Acceptance**: Migration pattern defined, timing specified
- **Dependencies**: Task 1.2.2
- **Guidelines**:
  - Migrations run on app open before UI renders
  - Show progress bar if migration takes >100ms
  - Use Dexie's `upgrade()` transaction for data migration
  - **ADR 002 concern**: Migration timing with progress indicator

#### Task 1.2.4: Implement error handling for IndexedDB
- **File**: `src/services/db.ts` (error handling)
- **Acceptance**: All IndexedDB errors handled gracefully
- **Dependencies**: Task 1.2.1
- **Guidelines**:
  - Handle `quotaExceededError` with user guidance
  - Handle user denying IndexedDB permission
  - Memory-only fallback with persistent warning banner
  - **ADR 002 concern**: Memory-only mode warning UX

---

### Story 1.3: State Management (Zustand)

**As a** developer
**I want** Zustand stores for app state
**So that** UI reacts to data changes

**Acceptance**:
- Core stores created and typed
- Integration with Dexie.js for live queries
- Sync pattern documented

#### Task 1.3.1: Create Zustand stores
- **File**: `src/stores/zikrStore.ts`, `src/stores/sessionStore.ts`, `src/stores/goalStore.ts`, `src/stores/uiStore.ts`
- **Acceptance**: All stores defined with TypeScript types
- **Dependencies**: Task 1.2.2
- **Guidelines**:
  - Install: `npm install zustand`
  - Create stores for: zikrs, sessions, goals, UI state
  - Use `combine` for store composition if needed

#### Task 1.3.2: Implement Dexie.js service layer
- **File**: `src/services/zikrService.ts`, `src/services/sessionService.ts`, `src/services/goalService.ts`, `src/services/streakService.ts`
- **Acceptance**: All CRUD operations defined, typed
- **Dependencies**: Task 1.2.2
- **Guidelines**:
  - Export async functions for each operation
  - Include: `add`, `update`, `delete`, `getAll`, `getById`
  - sessionService must call streakService.updateStreak after add

#### Task 1.3.3: Connect stores to Dexie.js (live queries)
- **File**: `src/stores/*.ts` (update with liveQuery)
- **Acceptance**: Stores update when IndexedDB changes, sync pattern documented
- **Dependencies**: Task 1.3.1, Task 1.3.2
- **Guidelines**:
  - Use Dexie's `liveQuery()` for reactive updates
  - Update store state when query returns new data
  - Handle errors gracefully
  - **Architecture review fix**: State synchronization pattern defined

---

### Story 1.4: Routing & Layout

**As a** user
**I want** to navigate between screens
**So that** I can access all features

**Acceptance**:
- React Router configured
- Bottom navigation bar (mobile)
- Screen components created

#### Task 1.4.1: Install and configure React Router
- **File**: `src/App.tsx`, `src/pages/`
- **Acceptance**: Navigation works between screens
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install react-router-dom`
  - Create page components: Counter, Goals, Progress, Settings
  - Use HashRouter for PWA compatibility

#### Task 1.4.2: Create bottom navigation component
- **File**: `src/components/Navigation.tsx`
- **Acceptance**: 4 tabs: Counter, Goals, Progress, Settings
- **Dependencies**: Task 1.4.1
- **Guidelines**:
  - Fixed position at bottom (mobile-safe)
  - Active tab highlighted
  - Icons for each tab
  - Touch targets ≥ 44x44px

---

## Epic 2: Core Features - Zikrs & Sessions

### Story 2.1: Zikr Management

**As a** user
**I want** to manage my zikr list
**So that** I can practice what matters to me

**Acceptance**:
- View predefined zikrs
- Add custom zikrs
- Edit and delete custom zikrs
- Predefined zikrs marked as such
- Cascade delete behavior defined

#### Task 2.1.1: Create ZikrList component
- **File**: `src/components/ZikrList.tsx`
- **Acceptance**: Lists all zikrs, shows "custom" badge for user-created
- **Dependencies**: Task 1.3.3, Task 1.4.1
- **Guidelines**:
  - Load from zikrStore
  - Show predefined zikrs first (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah)
  - Swipe actions for custom zikrs (edit, delete)

#### Task 2.1.2: Create AddZikr modal
- **File**: `src/components/AddZikrModal.tsx`
- **Acceptance**: Input field for zikr name, save/cancel buttons
- **Dependencies**: Task 2.1.1
- **Guidelines**:
  - Text input with character limit (50)
  - Validation: not empty, no duplicates
  - On save: call zikrService.add(), update store

#### Task 2.1.3: Implement edit zikr
- **File**: `src/components/EditZikrModal.tsx` (or reuse AddZikrModal with mode)
- **Acceptance**: Pre-filled with current name, updates on save
- **Dependencies**: Task 2.1.2
- **Guidelines**:
  - Reuse AddZikrModal with edit mode
  - Call zikrService.update() on save

#### Task 2.1.4: Implement delete zikr with cascade prompt
- **File**: `src/components/ZikrList.tsx` (update)
- **Acceptance**: Confirmation dialog with "Keep sessions or delete all?" option
- **Dependencies**: Task 2.1.1
- **Guidelines**:
  - On delete: show confirmation with cascade options
  - Option A: Keep sessions (soft-delete zikr only) - RECOMMENDED
  - Option B: Delete all (remove sessions, goals, streaks)
  - Call respective services based on user choice
  - **Architecture review fix**: Cascade delete behavior defined
  - **Requirements review**: Cascade delete behavior clarified

#### Task 2.1.5: Seed predefined zikrs on first launch
- **File**: `src/services/db.ts` (seed function)
- **Acceptance**: First app open creates 4 predefined zikrs
- **Dependencies**: Task 1.2.1
- **Guidelines**:
  - Check if zikrs store is empty
  - If empty: insert SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah
  - Set `custom: false` for all

---

### Story 2.2: Tasbeeh Counter

**As a** user
**I want** an interactive counter
**So that** I can track my zikr practice

**Acceptance**:
- Tap anywhere in thumb zone to increment
- Haptic feedback on tap
- Current zikr shown
- Long-press to reset with confirmation
- Auto-save timing defined
- Timezone handling specified

#### Task 2.2.1: Create Counter screen component
- **File**: `src/pages/Counter.tsx`
- **Acceptance**: Large count display, zikr selector, tap area
- **Dependencies**: Task 1.3.3, Task 1.4.1
- **Guidelines**:
  - Full-height screen with centered count
  - Zikr selector at top (dropdown or horizontal scroll)
  - Tap area = entire lower half (thumb zone)
  - Count persisted in sessionStore (current session)
  - **Requirements review**: Use device local time for all date calculations

#### Task 2.2.2: Implement haptic feedback
- **File**: `src/hooks/useHaptic.ts`
- **Acceptance**: Vibration on each tap (mobile only)
- **Dependencies**: Task 2.2.1
- **Guidelines**:
  - Use `navigator.vibrate()` API
  - Short pulse: `vibrate(10)`
  - Gracefully fail if not supported

#### Task 2.2.3: Implement auto-save session
- **File**: `src/pages/Counter.tsx` (update)
- **Acceptance**: Session saved when target reached OR on app close
- **Dependencies**: Task 1.3.2, Task 2.2.1
- **Guidelines**:
  - Save when count reaches common targets (33, 100) OR app closes
  - Use useEffect with window 'blur' event for app close
  - Set `source: 'app'` for counter sessions
  - **Requirements review clarification**: Auto-save timing defined as both triggers

#### Task 2.2.4: Implement long-press reset
- **File**: `src/pages/Counter.tsx` (update)
- **Acceptance**: Long-press (1s) shows confirmation, resets on confirm
- **Dependencies**: Task 2.2.1
- **Guidelines**:
  - Use `onLongPress` or custom timer
  - Show modal: "Reset counter to 0?"
  - Reset current session count, not saved sessions

#### Task 2.2.5: Restore counter state on app open
- **File**: `src/pages/Counter.tsx` (update)
- **Acceptance**: Counter shows last count if not saved
- **Dependencies**: Task 2.2.3
- **Guidelines**:
  - Store current count in uiStore (persists in localStorage)
  - Restore on component mount
  - Clear after session saved

---

### Story 2.3: Manual Progress Entry

**As a** user
**I want** to log sessions done with physical tasbeeh
**So that** all my practice is tracked

**Acceptance**:
- Add session with count and date/time
- Default to current date/time
- Source marked as 'manual'
- Quick-add pattern considered (v1.1)

#### Task 2.3.1: Create ManualEntry modal
- **File**: `src/components/ManualEntryModal.tsx`
- **Acceptance**: Zikr selector, count input, date picker, time picker
- **Dependencies**: Task 1.3.3
- **Guidelines**:
  - Zikr dropdown (filtered to active zikrs)
  - Number input for count (min: 1, max: 10000)
  - Date picker (default: today)
  - Time picker (default: now)
  - **Requirements review**: Quick-add buttons deferred to v1.1

#### Task 2.3.2: Implement manual session save
- **File**: `src/components/ManualEntryModal.tsx` (update)
- **Acceptance**: Session saved with `source: 'manual'`
- **Dependencies**: Task 1.3.2, Task 2.3.1
- **Guidelines**:
  - On save: call sessionService.add()
  - Include `date` in YYYY-MM-DD format for queries
  - Use device local time (no timezone conversion)
  - Update streak after save
  - **Requirements review**: Timezone handled as local time consistently

#### Task 2.3.3: Handle empty zikr list
- **File**: `src/components/ManualEntryModal.tsx` (update)
- **Acceptance**: Show message "Create a zikr first" if no zikrs
- **Dependencies**: Task 2.3.1
- **Guidelines**:
  - Check zikrStore on mount
  - If empty: show empty state with link to zikr creation

---

## Epic 3: Goals & Streaks

### Story 3.1: Goal Management

**As a** user
**I want** to set goals for my zikr practice
**So that** I can track progress toward targets

**Acceptance**:
- Create daily/weekly/monthly/custom goals
- View goal progress
- Pause/resume/completed states

#### Task 3.1.1: Create GoalList component
- **File**: `src/components/GoalList.tsx`
- **Acceptance**: Shows all goals with progress bars
- **Dependencies**: Task 1.3.3, Task 1.4.1
- **Guidelines**:
  - List grouped by zikr
  - Progress bar for each goal (current / target)
  - Status badge (active/paused/completed)
  - Empty state if no goals

#### Task 3.1.2: Create AddGoal modal
- **File**: `src/components/AddGoalModal.tsx`
- **Acceptance**: Zikr selector, period dropdown, target input, date range (if custom)
- **Dependencies**: Task 1.3.3
- **Guidelines**:
  - Period options: daily, weekly, monthly, custom
  - If custom: show start/end date pickers
  - Target number input (min: 1)
  - Validate: zikr required, target required

#### Task 3.1.3: Calculate goal progress
- **File**: `src/services/goalService.ts` (update)
- **Acceptance**: Progress % calculated from sessions in goal period
- **Dependencies**: Task 1.3.2
- **Guidelines**:
  - For daily: sum today's sessions (local time)
  - For weekly: sum this week's sessions
  - For monthly: sum this month's sessions
  - For custom: sum sessions in date range
  - Return: current count, target, percentage

#### Task 3.1.4: Implement pause/resume goal
- **File**: `src/components/GoalList.tsx` (update)
- **Acceptance**: Toggle button changes status between active/paused
- **Dependencies**: Task 3.1.1
- **Guidelines**:
  - Show pause button for active goals
  - Show resume button for paused goals
  - Update goal status in IndexedDB
  - Visual distinction for paused goals (grayed out, dimmed opacity)

#### Task 3.1.5: Mark goal as completed
- **File**: `src/services/goalService.ts` (update)
- **Acceptance**: Goal marked completed when target reached
- **Dependencies**: Task 3.1.3
- **Guidelines**:
  - After each session save, check if any goal reached target
  - Update status to 'completed'
  - Show celebration animation

---

### Story 3.2: Streak Tracking

**As a** user
**I want** to see my practice streak
**So that** I'm motivated to practice daily

**Acceptance**:
- Current streak shown
- Longest streak tracked
- Streak breaks correctly (gap > 1 day)
- Same day doesn't increment
- Timezone handling specified

#### Task 3.2.1: Implement streak calculation (FIXED)
- **File**: `src/services/streakService.ts`
- **Acceptance**: Streak increments only when date changes, not same day
- **Dependencies**: Task 1.3.2
- **Guidelines**:
  - Add `lastProcessedDate` field to Streak interface
  - Only increment currentStreak if `sessionDate !== lastProcessedDate`
  - If `daysSince > 1`: reset currentStreak to 0
  - Always update longestStreak if currentStreak exceeds it
  - Use device local time for all date calculations
  - **Architecture review fix**: Same-day sessions don't inflate streaks
  - **Requirements review**: Timezone handled as local time

#### Task 3.2.2: Create StreakBadge component
- **File**: `src/components/StreakBadge.tsx`
- **Acceptance**: Shows 🔥 with current streak number
- **Dependencies**: Task 3.2.1
- **Guidelines**:
  - Show on counter screen and progress screen
  - Format: "🔥 5 day streak" or "🔥 5"
  - Show longest streak on tap/long-press
  - Hide if streak is 0

#### Task 3.2.3: Update streak on session save
- **File**: `src/services/sessionService.ts` (update)
- **Acceptance**: Streak recalculated after each session
- **Dependencies**: Task 3.2.1
- **Guidelines**:
  - Call `streakService.updateStreak(zikrId, date)` after add
  - Ensure streak update is atomic with session save

---

## Epic 4: Progress, Settings & Polish

### Story 4.1: Progress Visualization

**As a** user
**I want** to see my progress over time
**So that** I can review my practice

**Acceptance**:
- Daily summary shown
- Weekly trend chart
- Goal progress indication

#### Task 4.1.1: Create Progress screen component
- **File**: `src/pages/Progress.tsx`
- **Acceptance**: Shows daily summary, weekly chart, goal progress
- **Dependencies**: Task 1.3.3, Task 1.4.1
- **Guidelines**:
  - Section 1: Today's summary (total count, breakdown by zikr)
  - Section 2: Weekly bar chart
  - Section 3: Active goals with progress bars

#### Task 4.1.2: Implement weekly chart
- **File**: `src/components/WeeklyChart.tsx`
- **Acceptance**: Bar chart showing last 7 days counts
- **Dependencies**: Task 4.1.1
- **Guidelines**:
  - Use simple HTML/CSS bars (no chart library needed)
  - X-axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  - Y-axis: Count (auto-scale)
  - Today's bar highlighted
  - **Requirements review**: "Simple charts" defined as weekly bar chart

#### Task 4.1.3: Handle empty progress state
- **File**: `src/pages/Progress.tsx` (update)
- **Acceptance**: Show "Start practicing to see your progress" if no sessions
- **Dependencies**: Task 4.1.1
- **Guidelines**:
  - Check if any sessions exist
  - If not: show friendly empty state with CTA to counter

---

### Story 4.2: Settings & Configuration

**As a** user
**I want** to configure app settings
**So that** the app works my way

**Acceptance**:
- Dark mode toggle
- Data export/import
- App info
- Reminder configuration (in-app only)

#### Task 4.2.1: Create Settings screen
- **File**: `src/pages/Settings.tsx`
- **Acceptance**: Settings list with dark mode toggle, export/import buttons
- **Dependencies**: Task 1.4.1
- **Guidelines**:
  - Dark mode toggle (persist in settings store)
  - Export data button
  - Import data button
  - About section (version, info)

#### Task 4.2.2: Implement data export
- **File**: `src/services/exportService.ts`
- **Acceptance**: Downloads JSON file with all user data
- **Dependencies**: Task 1.3.2
- **Guidelines**:
  - Export: zikrs, sessions, goals, streaks, settings
  - Create JSON blob
  - Trigger download with timestamp filename

#### Task 4.2.3: Implement data import
- **File**: `src/services/exportService.ts` (update)
- **Acceptance**: Reads JSON file, restores data to IndexedDB
- **Dependencies**: Task 4.2.2
- **Guidelines**:
  - File input accepts .json
  - Validate JSON structure
  - Clear existing data (with confirmation)
  - Import all entities
  - Refresh stores after import

#### Task 4.2.4: Implement dark mode
- **File**: `src/App.tsx`, `src/stores/settingsStore.ts`
- **Acceptance**: Dark mode toggleable, persisted
- **Dependencies**: Task 1.1.2
- **Guidelines**:
  - Store preference in IndexedDB settings store
  - Apply 'dark' class to html element
  - Use Tailwind's `dark:` prefix for styles

#### Task 4.2.5: Document reminder limitations
- **File**: `src/pages/Settings.tsx` (update)
- **Acceptance**: iOS limitations communicated transparently
- **Dependencies**: Task 4.2.1
- **Guidelines**:
  - Show "Platform limitations" section in settings
  - Explain: iOS has no background reminders
  - Clarify: v1 = in-app reminders only (cross-platform)
  - **ADR 003 concern**: Alarm API not supported on Safari (snooze limitation)
  - **Requirements review + ADR review**: v1 reminder scope clarified

---

### Story 4.3: Polish & Accessibility

**As a** user
**I want** a polished, accessible app
**So that** I can use it comfortably

**Acceptance**:
- WCAG 2.1 AA compliance
- Touch targets 44x44px minimum
- Smooth animations

#### Task 4.3.1: Audit touch targets
- **File**: All component files
- **Acceptance**: All interactive elements ≥ 44x44px
- **Dependencies**: All UI tasks
- **Guidelines**:
  - Test with mobile viewport
  - Ensure buttons, taps meet size requirement
  - Use padding/min-height to achieve

#### Task 4.3.2: Add ARIA labels
- **File**: All component files
- **Acceptance**: All interactive elements have aria-label or accessible text
- **Dependencies**: All UI tasks
- **Guidelines**:
  - Add aria-label to icon-only buttons
  - Use semantic HTML
  - Test with screen reader

#### Task 4.3.3: Verify color contrast
- **File**: All component files
- **Acceptance**: All text has ≥ 4.5:1 contrast ratio
- **Dependencies**: All UI tasks
- **Guidelines**:
  - Use Tailwind's accessible color palette
  - Test with contrast checker
  - Adjust colors as needed

#### Task 4.3.4: Add animations and transitions
- **File**: `src/index.css`, component files
- **Acceptance**: Smooth transitions, no jarring changes
- **Dependencies**: All UI tasks
- **Guidelines**:
  - Add transition classes to interactive elements
  - Use spring animations for count updates
  - Keep animations subtle (spiritual app = calm)

---

### Story 4.4: Performance Optimization

**As a** user
**I want** the app to load quickly
**So that** I can start practicing immediately

**Acceptance**:
- FCP < 1.5s
- TTI < 3s
- Bundle < 200KB gzipped
- React.memo profiling documented

#### Task 4.4.1: Configure code splitting
- **File**: `vite.config.ts`, `src/App.tsx`
- **Acceptance**: Routes lazy-loaded
- **Dependencies**: Task 1.4.1
- **Guidelines**:
  - Use `React.lazy()` for page components
  - Add Suspense fallbacks

#### Task 4.4.2: Optimize Tailwind bundle
- **File**: `tailwind.config.js`
- **Acceptance**: Only used styles included
- **Dependencies**: Task 1.1.2
- **Guidelines**:
  - Enable purge/content configuration
  - Scan all component files
  - Test production build

#### Task 4.4.3: Performance audit and profiling
- **File**: All files
- **Acceptance**: All performance targets met, React.memo profiling documented
- **Dependencies**: All implementation tasks
- **Guidelines**:
  - Run Lighthouse audit
  - Test on mobile 4G simulation
  - Profile with React DevTools to identify components needing memo
  - Document which components need React.memo and why
  - **ADR 001 concern**: Bundle size CI + React.memo profiling addressed

---

## Epic 5: Testing & Documentation

### Story 5.1: Testing

**As a** developer
**I want** automated tests
**So that** regressions are caught

#### Task 5.1.1: Set up test framework
- **File**: `vitest.config.ts`, `src/__tests__/`
- **Acceptance**: Vitest running, tests execute
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D vitest @testing-library/react`
  - Configure vitest with React environment

#### Task 5.1.2: Write unit tests for services
- **File**: `src/__tests__/services/*.test.ts`
- **Acceptance**: All service functions have unit tests
- **Dependencies**: Task 5.1.1
- **Guidelines**:
  - Test: zikrService, sessionService, goalService, streakService
  - Mock Dexie.js operations
  - Cover edge cases (empty data, cascade delete, same-day streak)

#### Task 5.1.3: Write component tests
- **File**: `src/__tests__/components/*.test.tsx`
- **Acceptance**: Core components have tests
- **Dependencies**: Task 5.1.1
- **Guidelines**:
  - Test: Counter, ZikrList, GoalList, ManualEntryModal
  - Use @testing-library/react
  - Test user interactions

---

### Story 5.2: Documentation

**As a** maintainer
**I want** clear documentation
**So that** others can contribute

#### Task 5.2.1: Update README
- **File**: `README.md`
- **Acceptance**: Setup instructions, project overview included
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Add project description
  - Setup commands
  - Tech stack overview
  - Contributing guidelines

#### Task 5.2.2: Update architecture documentation
- **File**: `docs/architecture.md`
- **Acceptance**: All final decisions documented, migrations specified
- **Dependencies**: Task 1.2.3
- **Guidelines**:
  - Remove "pending" language
  - Add diagrams
  - Document data flow
  - **ADR 002 concern**: Schema versioning documented

---

## Implementation Order

**Recommended sequence:**

1. **Foundation First** (Epic 1) - All stories must complete before others
2. **Core Features** (Epic 2) - Build in order: Zikrs → Counter → Manual Entry
3. **Goals & Streaks** (Epic 3) - Depends on Epic 2
4. **Progress & Polish** (Epic 4) - Can parallelize with Epic 3
5. **Testing** (Epic 5) - Ongoing, final push

**Critical Path:**
```
Epic 1 → Epic 2 Story 2.2 (Counter) → Epic 3 Story 3.2 (Streaks)
```

---

## Notes from Reviews

**Architecture Review (4 issues):**
1. ✅ Streak calculation - Task 3.2.1 adds `lastProcessedDate`
2. ✅ Cascade delete - Task 2.1.4 implements prompt
3. ✅ State sync - Task 1.3.3 uses Dexie liveQuery
4. ✅ Notification scope - v1 = in-app only (Task 4.2.5)

**Requirements Review (4 clarifications):**
1. ✅ Auto-save timing - Task 2.2.3: target reached OR app close
2. ✅ Timezone handling - All tasks: use device local time
3. ✅ Cascade delete - Task 2.1.4: prompt with options
4. ✅ Reminder scope - v1: in-app only, cross-platform

**ADR Review (6 concerns):**
1. ✅ Bundle CI - Task 1.1.4 + Task 4.4.3
2. ✅ React.memo - Task 4.4.3: profiling documented
3. ✅ Migration timing - Task 1.2.3: on app open with progress
4. ✅ Memory fallback - Task 1.2.4: persistent warning
5. ✅ Alarm API - Task 4.2.5: Safari limitation documented
6. ✅ v1 reminders - Task 4.2.5: in-app only clarified

---

## Open Questions (Deferred to v1.1)

1. Reminder frequency and scheduling
2. Streak freeze feature for travel/illness
3. Analytics granularity for progress charts
4. Quick-add pattern for manual entry (33, 100 buttons)
5. Onboarding/tutorial for first-time users

---

## Epic 6: Advanced Manual Progress Entry

**Description**: Comprehensive manual session entry with bulk mode, edit/delete, session history, and progressive save.
**Status**: Pending
**Planned**: 2025-06-15 via /feature-planner workflow

> **Note**: This epic enhances and replaces the basic Story 2.3 manual entry with full-featured session management including bulk entry, 3-day edit window, session history, and progressive save for large batches.

### Story 6.1: Database Schema v2 Enhancement

**As a** developer
**I want** to extend the IndexedDB schema for manual sessions
**So that** we support editable sessions, source tracking, and bulk save resume

**Acceptance**:
- Schema v2 with `editableUntil`, `source` fields
- New stores for progressive save state and smart defaults
- Migration from v1 with `editableUntil` calculation

#### Task 6.1.1: Update Dexie schema to version 2
- **File**: `src/db/schema.ts` (or `src/services/db.ts`)
- **Acceptance**:
  - Version 2 schema defined
  - Sessions store extended: `editableUntil` (indexed), `source` ('app'|'manual'|'physical')
  - New store: `sessionFormState` (id, sessions, currentIndex, createdAt)
  - New store: `zikrLastCount` (zikrId, count, updatedAt)
  - Indexes added: `editableUntil`, `date` (denormalized)
- **Dependencies**: Task 1.2.1
- **Guidelines**: Follow existing Dexie pattern, use versioning

#### Task 6.1.2: Implement v1 to v2 migration
- **File**: `src/db/migrations.ts`
- **Acceptance**:
  - Existing sessions get `editableUntil = timestamp + 3 days`
  - Existing sessions get `source = 'app'` (default)
  - Migration runs atomically with error handling per session
- **Dependencies**: Task 6.1.1
- **Guidelines**: Try-catch per session, log errors, continue on failure

#### Task 6.1.3: Define TypeScript interfaces
- **File**: `src/features/sessions/types/session.ts`
- **Acceptance**:
  - `Session` interface with all fields including `editableUntil`, `source`
  - `SessionInput` for create operations
  - `SessionUpdate` for edit operations (partial fields)
  - `SessionRow` for form state
  - `BulkResult` with success/failed/errors/stateId
- **Dependencies**: Task 6.1.1
- **Guidelines**: Export from barrel file

---

### Story 6.2: Session Service Layer

**As a** developer
**I want** a comprehensive service layer for session CRUD
**So that** business logic is separated from UI

**Acceptance**:
- SessionService handles add, update, delete, isEditable
- ValidationService provides real-time validation
- ProgressiveSaveService handles large bulk saves

#### Task 6.2.1: Implement SessionService.addSession
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Accepts `SessionInput` (zikrId, count, timestamp)
  - Calculates `editableUntil = timestamp + 3 days`
  - Stores session with source='manual', createdAt, updatedAt
  - Triggers GoalProgressService.recalculateForSession()
  - Triggers StreakService.updateForSession()
  - Stores last count in zikrLastCount
  - Returns created session
- **Dependencies**: Task 6.1.3
- **Guidelines**: Use Dexie transaction for atomicity

#### Task 6.2.2: Implement SessionService.addBulkSessions
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Accepts array of `SessionInput[]`
  - Saves all in single IndexedDB transaction
  - Returns `BulkResult` with success/failed counts
  - On partial failure: saves what we can, reports errors
- **Dependencies**: Task 6.2.1
- **Guidelines**: Transaction rollback on validation error

#### Task 6.2.3: Implement SessionService.updateSession
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Validates `isEditable()` before update (3-day window)
  - Updates count, zikrId, or timestamp
  - Recalculates goals and streaks
  - Returns updated session
- **Dependencies**: Task 6.2.1
- **Guidelines**: Update `updatedAt` timestamp

#### Task 6.2.4: Implement SessionService.deleteSession
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Validates `isEditable()` before delete (3-day window)
  - Removes session from IndexedDB
  - Recalculates goals and streaks
- **Dependencies**: Task 6.2.1
- **Guidelines**: Consider soft delete for analytics

#### Task 6.2.5: Implement SessionService.isEditable
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Accepts session id or Session object
  - Returns true if `now < editableUntil`
  - Async for consistency (per architecture review)
- **Dependencies**: Task 6.2.1
- **Guidelines**: Handle missing session gracefully

#### Task 6.2.6: Implement SessionService.getSessionsByDateRange
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Accepts start and end Date objects
  - Queries using `date` index
  - Returns array sorted by timestamp descending
- **Dependencies**: Task 6.1.1
- **Guidelines**: Use Dexie's `where()` and `between()`

#### Task 6.2.7: Implement SessionValidationService
- **File**: `src/features/sessions/services/SessionValidationService.ts`
- **Acceptance**:
  - `validateCount(value)`: min 1, positive integer only
  - `validateDateTime(value)`: not null, valid Date
  - `validateRow(row)`: combines both validations
  - All validation < 50ms (performance target)
- **Dependencies**: Task 6.1.3
- **Guidelines**: Synchronous for real-time feedback

#### Task 6.2.8: Implement ProgressiveSaveService.saveInChunks
- **File**: `src/features/sessions/services/ProgressiveSaveService.ts`
- **Acceptance**:
  - Chunks into batches of 10
  - Saves state to sessionFormState for resume
  - Calls progress callback after each chunk
  - Yields to UI thread (setTimeout 0)
  - Cleans up state on completion
  - Returns `BulkResult` with stateId
- **Dependencies**: Task 6.2.2
- **Guidelines**: CHUNK_SIZE = 10

#### Task 6.2.9: Implement ProgressiveSaveService.resumeInterruptedSave
- **File**: `src/features/sessions/services/ProgressiveSaveService.ts`
- **Acceptance**:
  - Accepts stateId from interrupted save
  - Loads sessionFormState, continues from currentIndex
  - Cleans up state on completion
- **Dependencies**: Task 6.2.8
- **Guidelines**: Check state exists before resume

---

### Story 6.3: Session Entry UI

**As a** user
**I want** a comprehensive session entry form
**So that** I can add single or bulk sessions efficiently

**Acceptance**:
- Single session entry with smart defaults
- Bulk entry (Multi-Zikr and Quick Repeat modes)
- Real-time validation with inline errors
- Progressive save for 50+ sessions

#### Task 6.3.1: Create sessionFormStore
- **File**: `src/features/sessions/stores/sessionFormStore.ts`
- **Acceptance**:
  - State: mode (single/bulk), bulkMode (multi-zikr/quick-repeat), rows, isSaving, saveProgress
  - Actions: setMode, setBulkMode, addRow, removeRow, updateRow, setSaving, setSaveProgress, reset
  - Initial row: `{zikrId: '', count: 0, timestamp: new Date()}` (type fixed per review)
- **Dependencies**: Task 6.1.3
- **Guidelines**: Use Zustand create pattern

#### Task 6.3.2: Create SessionEntryForm container
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - Header with "Add Session" title and close button
  - Orchestrates mode switching
  - Shows loading state during save
  - Handles success/error toasts
  - Resets form on successful save
- **Dependencies**: Task 6.3.1
- **Guidelines**: Mobile-first, 300ms load target

#### Task 6.3.3: Create SessionRow component
- **File**: `src/features/sessions/components/SessionRow.tsx`
- **Acceptance**:
  - Zikr dropdown with search
  - Count input (number type, min=1, 44x44px touch target)
  - Date/time picker with presets (Now, Yesterday, This Morning)
  - Full date-time picker option
  - Remove button (bulk mode only)
  - Real-time validation with inline errors
  - ARIA labels for accessibility
- **Dependencies**: Task 6.2.7, Task 6.3.1
- **Guidelines**: ARIA labels per WCAG 2.1 AA

#### Task 6.3.4: Implement smart defaults (last count)
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - On zikr selection, query zikrLastCount store
  - Pre-fill count field with last used value
  - Fall back to empty if no previous entry
- **Dependencies**: Task 6.3.2, Task 6.3.3
- **Guidelines**: Async query, update form state

#### Task 6.3.5: Handle no zikrs available
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - Show "Create a zikr first" message if zikr list empty
  - Provide button to navigate to zikr creation
  - Disable form interactions
- **Dependencies**: Task 6.3.2
- **Guidelines**: Empty state UX pattern

#### Task 6.3.6: Implement Multi-Zikr bulk mode
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - Mode toggle: single vs bulk
  - Bulk mode toggle: Multi-Zikr vs Quick Repeat
  - Multiple SessionRow components rendered
  - "Add Another Session" button adds new row
  - Each row has zikr, count, date/time, remove button
  - Real-time validation per row
  - Save disabled if any row invalid
  - Limit to 50 rows with message
- **Dependencies**: Task 6.3.3, Task 6.3.1
- **Guidelines**: Dynamic row management

#### Task 6.3.7: Implement Quick Repeat bulk mode
- **File**: `src/features/sessions/components/QuickRepeatForm.tsx`
- **Acceptance**:
  - Single zikr selector at top
  - Multiple count/date rows below (reduced UI chrome)
  - If only one zikr exists, auto-select and hide selector
  - "Add Row" button adds count/date row
  - Save disabled if any row invalid
- **Dependencies**: Task 6.3.1, Task 6.3.3
- **Guidelines**: Simplified UI for efficiency

#### Task 6.3.8: Implement cancel with confirmation
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - If form has unsaved data (rows > 1 or any filled)
  - Show confirmation: "Discard unsaved sessions?"
  - On confirm: reset store, close form
  - On cancel: return to form
- **Dependencies**: Task 6.3.1
- **Guidelines**: Check store state for changes

#### Task 6.3.9: Wire single session save
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - On Save: validate row
  - Call SessionService.addSession()
  - Show loading state
  - On success: toast, reset form, navigate to history
  - On error: toast with error message, keep form data
- **Dependencies**: Task 6.2.1, Task 6.3.2
- **Guidelines**: Try-catch for error handling

#### Task 6.3.10: Wire bulk session save (< 50 sessions)
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - Validate all rows before save
  - If < 50 sessions: call SessionService.addBulkSessions()
  - Show loading state
  - On success: "X sessions saved" toast, reset form
  - On partial failure: "X of Y sessions saved" + retry option
- **Dependencies**: Task 6.2.2, Task 6.3.6
- **Guidelines**: Check row count for path

#### Task 6.3.11: Wire progressive bulk save (50+ sessions)
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - If >= 50 sessions: call ProgressiveSaveService.saveInChunks()
  - Show progress indicator: "Saved X of Y sessions..."
  - UI remains responsive during save
  - On completion: success toast, reset form
  - On interruption: state saved for resume
- **Dependencies**: Task 6.2.8, Task 6.3.10
- **Guidelines**: Progress bar with percentage

#### Task 6.3.12: Implement save resume prompt
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - On form open, check for interrupted save state
  - Show prompt: "Resume save? X sessions remaining"
  - On "Resume": call ProgressiveSaveService.resumeInterruptedSave()
  - On "Discard": clear state, start fresh
- **Dependencies**: Task 6.2.9, Task 6.3.11
- **Guidelines**: Check sessionFormState store

---

### Story 6.4: Session History UI

**As a** user
**I want** to view my session history
**So that** I can review my practice

**Acceptance**:
- Sessions displayed in chronological order
- Grouped by date with headers
- Source badges (App, Manual, Physical)
- Edit/delete within 3-day window

#### Task 6.4.1: Create sessionHistoryStore
- **File**: `src/features/sessions/stores/sessionHistoryStore.ts`
- **Acceptance**:
  - State: sessions array, groupedByDate object, loading flag
  - Actions: loadSessions(), groupByDate(), refresh()
  - Uses Dexie liveQuery for reactive updates
- **Dependencies**: Task 6.1.1
- **Guidelines**: LiveQuery for automatic updates

#### Task 6.4.2: Create SessionHistoryList component
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Acceptance**:
  - Pull to refresh
  - Infinite scroll or pagination
  - Empty state: "No sessions yet - start practicing!"
  - Loading state during initial load
  - Error state with retry option
- **Dependencies**: Task 6.4.1
- **Guidelines**: Mobile-optimized list

#### Task 6.4.3: Implement session grouping by date
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Acceptance**:
  - Group sessions under date headers: "Today", "Yesterday", "MMM DD, YYYY"
  - Sessions sorted by timestamp within each date
- **Dependencies**: Task 6.4.1, Task 6.4.2
- **Guidelines**: Use dateUtils for formatting

#### Task 6.4.4: Create SessionCard component
- **File**: `src/features/sessions/components/SessionCard.tsx`
- **Acceptance**:
  - Display: zikr name (bold), count (e.g., "33 dhikr"), time (e.g., "7:30 AM")
  - Source badge: 📱 App, ✏️ Manual, 📿 Physical
  - Edit button (if within 3-day window)
  - Delete button (if within 3-day window)
  - Truncate long zikr names with ellipsis
  - Show full name on long-press
  - Touch targets 44x44px minimum
- **Dependencies**: Task 6.2.5
- **Guidelines**: 44x44px touch targets per accessibility

#### Task 6.4.5: Handle deleted zikr reference
- **File**: `src/features/sessions/components/SessionCard.tsx`
- **Acceptance**:
  - If zikr not found, show "Zikr Name (deleted)"
  - Style with muted colors
  - Still show count, time, source badge
- **Dependencies**: Task 6.4.4
- **Guidelines**: Graceful degradation

#### Task 6.4.6: Wire history to liveQuery
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Acceptance**:
  - Subscribe to Dexie liveQuery on sessions store
  - Auto-update when sessions added/edited/deleted
  - Unsubscribe on component unmount
- **Dependencies**: Task 6.4.1, Task 6.4.2
- **Guidelines**: Use useEffect for subscription

---

### Story 6.5: Edit and Delete Sessions

**As a** user
**I want** to correct mistakes
**So that** my records are accurate

**Acceptance**:
- Edit sessions within 3-day window
- Delete sessions with confirmation
- Goals and streaks recalculated

#### Task 6.5.1: Implement edit session flow
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Acceptance**:
  - Tap Edit on session card
  - Load session into SessionEntryForm
  - User modifies count, zikr, or date/time
  - On Save: call SessionService.updateSession()
  - Show success toast, return to history
- **Dependencies**: Task 6.2.3, Task 6.3.2
- **Guidelines**: Pass session id to form

#### Task 6.5.2: Implement delete session with confirmation
- **File**: `src/features/sessions/components/SessionCard.tsx`
- **Acceptance**:
  - Tap Delete on session card
  - Show confirmation dialog: "Delete this session?"
  - On confirm: call SessionService.deleteSession()
  - Show success toast
  - On cancel: return to history
- **Dependencies**: Task 6.2.4
- **Guidelines**: Destructive action confirmation

---

### Story 6.6: Integration Services

**As a** developer
**I want** sessions to integrate with goals and streaks
**So that** progress is accurate

**Acceptance**:
- GoalProgressService recalculates on session changes
- StreakService updates on session changes
- SettingsService stores last count per zikr

#### Task 6.6.1: Implement GoalProgressService.recalculateForSession
- **File**: `src/services/GoalProgressService.ts` (create if not exists)
- **Acceptance**:
  - Accepts session object
  - Finds active goals for session's zikr
  - Recalculates progress including new session
  - Updates goal status if complete
  - Handles session edit (delta recalculation)
  - Handles session delete (subtract from progress)
- **Dependencies**: Task 6.2.1, Task 6.2.3, Task 6.2.4
- **Guidelines**: Query by date range for period goals

#### Task 6.6.2: Implement StreakService.updateForSession
- **File**: `src/services/StreakService.ts` (enhance existing)
- **Acceptance**:
  - Accepts session object
  - Recalculates streak based on all session dates
  - Updates current streak and longest streak
  - Handles session add, edit, delete
  - Uses local time consistently (not UTC)
- **Dependencies**: Task 6.2.1, Task 6.2.3, Task 6.2.4
- **Guidelines**: Set of unique dates for streak

#### Task 6.6.3: Wire goal/streak updates to session operations
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - addSession: triggers goal and streak updates
  - updateSession: triggers goal and streak recalculation
  - deleteSession: triggers goal and streak recalculation
  - addBulkSessions: batch updates for efficiency
- **Dependencies**: Task 6.6.1, Task 6.6.2
- **Guidelines**: Transactional with session save

#### Task 6.6.4: Implement last count storage
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - On successful session save: store count in zikrLastCount
  - Upsert operation (put) with updatedAt timestamp
- **Dependencies**: Task 6.2.1
- **Guidelines**: Fire-and-forget (non-blocking)

#### Task 6.6.5: Implement last count retrieval
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Method: getLastCount(zikrId)
  - Returns count from zikrLastCount or 0 if not found
  - Used by SessionEntryForm for smart defaults
- **Dependencies**: Task 6.6.4
- **Guidelines**: Async query

---

### Story 6.7: Polish & Error Handling

**As a** user
**I want** a polished, reliable experience
**So that** the app works smoothly

**Acceptance**:
- Dark mode support
- Accessibility compliance
- Error handling for edge cases
- Offline functionality

#### Task 6.7.1: Dark mode for session entry
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`, `SessionRow.tsx`
- **Acceptance**:
  - Form colors adapt to dark mode
  - Input borders visible in both themes
  - Validation errors readable in dark mode
  - No visual glitches on theme switch
- **Dependencies**: Task 6.3.2, Task 6.3.3
- **Guidelines**: Tailwind dark: prefix

#### Task 6.7.2: Dark mode for session history
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`, `SessionCard.tsx`
- **Acceptance**:
  - Cards, badges, buttons render in dark mode
  - Proper contrast maintained (4.5:1 minimum)
  - Date headers visible in dark mode
- **Dependencies**: Task 6.4.2, Task 6.4.4
- **Guidelines**: Test with system dark mode

#### Task 6.7.3: ARIA labels and announcements
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`, `SessionRow.tsx`
- **Acceptance**:
  - All form inputs have aria-label
  - Error messages announced to screen reader
  - "Form has X errors" announcement on submit
  - Progress updates announced during bulk save
- **Dependencies**: Task 6.3.2, Task 6.3.3
- **Guidelines**: Use aria-live for errors

#### Task 6.7.4: Keyboard navigation
- **File**: `src/features/sessions/components/SessionEntryForm.tsx`
- **Acceptance**:
  - Logical tab order through form fields
  - Enter key submits form
  - Escape key cancels (with confirmation if dirty)
  - Arrow keys work in dropdowns
- **Dependencies**: Task 6.3.2
- **Guidelines**: Test with keyboard only

#### Task 6.7.5: IndexedDB quota exceeded error
- **File**: `src/features/sessions/services/SessionService.ts`
- **Acceptance**:
  - Catch quota exceeded error
  - Show toast: "Storage full - delete old sessions or clear browser data"
  - Link to session history for cleanup
- **Dependencies**: Task 6.2.1, Task 6.2.2
- **Guidelines**: Try-catch on add operations

#### Task 6.7.6: Corrupted session recovery
- **File**: `src/features/sessions/components/SessionHistoryList.tsx`
- **Acceptance**:
  - Catch parsing errors when loading sessions
  - Log corrupted session id to console
  - Skip corrupted session, show valid ones
  - Don't crash entire list
- **Dependencies**: Task 6.4.2
- **Guidelines**: Defensive coding

#### Task 6.7.7: Future date warning
- **File**: `src/features/sessions/components/SessionRow.tsx`
- **Acceptance**:
  - If selected date/time is in future
  - Show warning: "This session is in the future"
  - Allow save (not an error)
- **Dependencies**: Task 6.3.3
- **Guidelines**: Compare with new Date()

#### Task 6.7.8: Verify offline functionality
- **File**: All session components
- **Acceptance**:
  - All operations work offline (no network calls)
  - Session save, edit, delete work in airplane mode
  - History loads and updates offline
- **Dependencies**: All session tasks
- **Guidelines**: Test with network throttling

---

### Story 6.8: Testing

**As a** developer
**I want** comprehensive tests
**So that** the feature is reliable

**Acceptance**:
- Unit tests for services
- Integration tests for flows
- E2E tests for critical paths

#### Task 6.8.1: Test SessionService
- **File**: `src/features/sessions/services/__tests__/SessionService.test.ts`
- **Acceptance**:
  - Test addSession with all fields
  - Test addSession calculates editableUntil correctly
  - Test addBulkSessions transaction behavior
  - Test updateSession within 3-day window
  - Test updateSession rejected after 3-day window
  - Test deleteSession within 3-day window
  - Test isEditable boundary conditions
- **Dependencies**: Task 6.2.1-6.2.6
- **Guidelines**: Mock IndexedDB, test integration calls

#### Task 6.8.2: Test SessionValidationService
- **File**: `src/features/sessions/services/__tests__/SessionValidationService.test.ts`
- **Acceptance**:
  - Test count validation (empty, 0, negative, valid)
  - Test date validation (null, invalid, valid)
  - Test row validation combines both
  - Test performance (< 50ms)
- **Dependencies**: Task 6.2.7
- **Guidelines**: Measure execution time

#### Task 6.8.3: Test ProgressiveSaveService
- **File**: `src/features/sessions/services/__tests__/ProgressiveSaveService.test.ts`
- **Acceptance**:
  - Test chunking logic (10 per batch)
  - Test progress callback invocation
  - Test state saved for resume
  - Test resume from checkpoint
  - Test state cleanup on completion
- **Dependencies**: Task 6.2.8-6.2.9
- **Guidelines**: Mock setTimeout for chunk delays

#### Task 6.8.4: Test goal/streak integration
- **File**: `src/__tests__/integration/sessionIntegration.test.ts`
- **Acceptance**:
  - Test addSession updates goal progress
  - Test addSession updates streak
  - Test editSession recalculates goals
  - Test deleteSession updates streak
- **Dependencies**: Task 6.6.1-6.6.3
- **Guidelines**: Test with real IndexedDB (in-memory)

#### Task 6.8.5: E2E test suite for session entry
- **File**: `e2e/sessionEntry.spec.ts` (if using Playwright/Cypress)
- **Acceptance**:
  - TC-H001: Single session entry with defaults
  - TC-H004: Multi-Zikr bulk entry
  - TC-H005: Quick Repeat bulk entry
  - TC-H009: Edit session within 3-day window
  - TC-H010: Delete session
  - TC-E001-E003: Validation errors
  - TC-OFF001: Offline functionality
- **Dependencies**: Task 6.1-6.7
- **Guidelines**: Use test data fixtures

---

## Epic 6 Task Dependencies

```
┌─ Database Layer (6.1.1-6.1.3) ─────────────────────────────┐
│                                                             │
├─ Service Layer (6.2.1-6.2.9) ──────┐                     │
│        │                            │                     │
│        └─ Testing (6.8.1-6.8.5) ────┴─────────┐           │
│                                              │           │
├─ UI State (6.3.1) ──────────────────────────┼──┐        │
│                                              │  │        │
├─ Entry UI (6.3.2-6.3.12) ────────────────────┘  │        │
│                                                   │        │
├─ History UI (6.4.1-6.4.6) ───────────────────────┤        │
│                                                   │        │
├─ Edit/Delete (6.5.1-6.5.2) ─────────────────────┤        │
│                                                   │        │
├─ Integration (6.6.1-6.6.5) ──────────────────────┘        │
│                                                            │
├─ Polish (6.7.1-6.7.8) ────────────────────────────────────┤
│                                                            │
└─ E2E Tests (6.8.5) ────────────────────────────────────────┘
```

**Critical Path** (for Manual Progress Entry MVP):
6.1.1 → 6.1.3 → 6.2.1 → 6.3.1 → 6.3.2 → 6.3.3 → 6.3.9 → 6.4.1 → 6.4.2 → 6.4.4 → 6.6.1 → 6.6.2 → 6.8.5

**Total Tasks for Epic 6**: 42 tasks
**Estimated Effort**: 60-80 hours

---

## Epic 6 Implementation Notes

**From Architecture Review:**
- Fix type safety: sessionFormStore initializes count as number (Task 6.3.1)
- Consider rollback strategy for progressive save (Task 6.2.8)
- Add per-error handling in migration (Task 6.1.2)
- Make isEditable async (Task 6.2.5)

**From Requirements Review:**
- Timezone handling: Use device local time consistently (Task 6.6.2)
- Cascade delete: Prompt user with options (existing Task 2.1.4 covers this)

**Key Features Delivered:**
1. ✅ Single and bulk session entry (2 modes: Multi-Zikr, Quick Repeat)
2. ✅ Edit/delete within 3-day window
3. ✅ Session history with grouping and source badges
4. ✅ Smart defaults (last count per zikr)
5. ✅ Progressive save for 50+ sessions
6. ✅ Comprehensive validation
7. ✅ Goal and streak integration
8. ✅ Offline functionality
9. ✅ Dark mode support
10. ✅ Accessibility compliance

---

*Generated by /feature-planner*
*Based on requirements, architecture, test cases, and reviews*
*Incorporates feedback from architecture review, requirements review, and ADR review*