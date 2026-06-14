# Tasks: Zikr PWA v1

**Project**: Zikr - Islamic Dhikr PWA
**Status**: Ready for Implementation
**Last Updated**: 2026-06-15
**Tech Stack**: React + Vite + Zustand + Dexie.js + Tailwind CSS

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

#### Task 1.1.1: Initialize Vite + React project
- **File**: `package.json`, `vite.config.ts`, `tsconfig.json`
- **Acceptance**: Vite dev server runs on localhost:5173
- **Dependencies**: `npm create vite@latest zikr -- --template react-ts`
- **Guidelines**: Use `create-vite` with TypeScript template

#### Task 1.1.2: Configure Tailwind CSS
- **File**: `tailwind.config.js`, `src/index.css`, `src/App.tsx`
- **Acceptance**: Tailwind classes work, dark mode configured
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D tailwindcss postcss autoprefixer`
  - Configure `darkMode: 'class'` for manual dark mode toggle
  - Add base Tailwind directives to index.css

#### Task 1.1.3: Configure PWA with vite-plugin-pwa
- **File**: `vite.config.ts`, `public/manifest.webmanifest`
- **Acceptance**: PWA installable on mobile, service worker registered
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install -D vite-plugin-pwa`
  - Configure manifest with app name, icons, colors
  - Enable `registerType: 'autoUpdate'` for service worker
  - Add PWA meta tags to index.html

---

### Story 1.2: Data Layer (IndexedDB + Dexie.js)

**As a** developer
**I want** a properly configured IndexedDB database
**So that** user data persists locally

**Acceptance**:
- Dexie.js configured with all stores
- TypeScript interfaces defined
- Database versioning strategy in place

#### Task 1.2.1: Install and configure Dexie.js
- **File**: `src/services/db.ts`
- **Acceptance**: Database opens successfully, all stores defined
- **Dependencies**: Task 1.1.1
- **Guidelines**:
  - Install: `npm install dexie`
  - Create database named `zikr-db` version 1
  - Define stores: `zikrs`, `sessions`, `goals`, `streaks`, `settings`

#### Task 1.2.2: Create TypeScript interfaces
- **File**: `src/services/db.ts` (interfaces)
- **Acceptance**: All entities have proper TypeScript types
- **Dependencies**: Task 1.2.1
- **Guidelines**:
  - Export interfaces: `Zikr`, `Session`, `Goal`, `Streak`, `Setting`
  - Use `++id` for auto-increment primary keys
  - Mark optional fields with `?`

---

### Story 1.3: State Management (Zustand)

**As a** developer
**I want** Zustand stores for app state
**So that** UI reacts to data changes

**Acceptance**:
- Core stores created and typed
- Integration with Dexie.js for live queries

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
- **Acceptance**: Stores update when IndexedDB changes
- **Dependencies**: Task 1.3.1, Task 1.3.2
- **Guidelines**:
  - Use Dexie's `liveQuery()` for reactive updates
  - Update store state when query returns new data
  - Handle errors gracefully

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
  - If "delete all": remove related sessions, goals, streaks
  - If "keep": soft-delete zikr only (set deletedAt)
  - Call respective services

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

#### Task 2.2.1: Create Counter screen component
- **File**: `src/pages/Counter.tsx`
- **Acceptance**: Large count display, zikr selector, tap area
- **Dependencies**: Task 1.3.3, Task 1.4.1
- **Guidelines**:
  - Full-height screen with centered count
  - Zikr selector at top (dropdown or horizontal scroll)
  - Tap area = entire lower half (thumb zone)
  - Count persisted in sessionStore (current session)

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
- **Acceptance**: Session saved when target reached or app closed
- **Dependencies**: Task 1.3.2, Task 2.2.1
- **Guidelines**:
  - Save to IndexedDB when count reaches common targets (33, 100)
  - Also save on app blur (use useEffect with window events)
  - Set `source: 'app'` for counter sessions

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
  - Store current count in localStorage or sessionStore
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

#### Task 2.3.1: Create ManualEntry modal
- **File**: `src/components/ManualEntryModal.tsx`
- **Acceptance**: Zikr selector, count input, date picker, time picker
- **Dependencies**: Task 1.3.3
- **Guidelines**:
  - Zikr dropdown (filtered to active zikrs)
  - Number input for count (min: 1, max: 10000)
  - Date picker (default: today)
  - Time picker (default: now)

#### Task 2.3.2: Implement manual session save
- **File**: `src/components/ManualEntryModal.tsx` (update)
- **Acceptance**: Session saved with `source: 'manual'`
- **Dependencies**: Task 1.3.2, Task 2.3.1
- **Guidelines**:
  - On save: call sessionService.add()
  - Include `date` in YYYY-MM-DD format for queries
  - Update streak after save

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
  - For daily: sum today's sessions
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
  - Visual distinction for paused goals (grayed out)

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

#### Task 3.2.1: Implement streak calculation (FIXED)
- **File**: `src/services/streakService.ts`
- **Acceptance**: Streak increments only when date changes, not same day
- **Dependencies**: Task 1.3.2
- **Guidelines**:
  - Add `lastProcessedDate` field to Streak interface
  - Only increment currentStreak if `sessionDate !== lastProcessedDate`
  - If `daysSince > 1`: reset currentStreak to 0
  - Always update longestStreak if currentStreak exceeds it
  - **This addresses architecture review issue**

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

#### Task 4.4.3: Performance audit
- **File**: All files
- **Acceptance**: All performance targets met
- **Dependencies**: All implementation tasks
- **Guidelines**:
  - Run Lighthouse audit
  - Test on mobile 4G simulation
  - Fix any bottlenecks

---

## Epic 5: Testing & Documentation

### Story 5.1: Testing

**As a** developer
**I want** automated tests
**So that** regressions are caught

#### Task 5.1.1: Set up test framework
- **File**: `vitest.config.ts`, `src/__tests__/`
- **Acceptance**: Vitest running, tests execute
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
  - Cover edge cases (empty data, cascade delete)

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
- **Guidelines**:
  - Add project description
  - Setup commands
  - Tech stack overview
  - Contributing guidelines

#### Task 5.2.2: Document architecture decisions
- **File**: `docs/architecture.md` (update)
- **Acceptance**: All final decisions documented
- **Dependencies**: All implementation tasks
- **Guidelines**:
  - Remove "pending" language
  - Add diagrams
  - Document data flow

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

## Notes from Architecture Review

**Must address during implementation:**

1. **Streak Calculation**: Add `lastProcessedDate` to prevent same-day increments (Task 3.2.1)
2. **Cascade Delete**: Implement prompt for related data when deleting zikr (Task 2.1.4)
3. **State Sync**: Stores use Dexie liveQuery for reactivity (Task 1.3.3)
4. **Notifications**: Document v1 limitation (no Android push without server)

---

## Open Questions (Deferred to v1.1)

1. Reminder frequency and scheduling
2. Streak freeze feature for travel/illness
3. Analytics granularity for progress charts

---

*Generated by /feature-planner*
*Based on requirements, architecture, and test case artifacts*
