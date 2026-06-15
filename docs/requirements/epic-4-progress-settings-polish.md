# Epic 4: Progress, Settings & Polish - Requirements Document

**Project**: Zikr PWA  
**Epic**: 4 - Progress, Settings & Polish  
**Status**: Requirements Collection  
**Created**: 2025-06-15  
**Dependencies**: Epic 1 (Foundation), Epic 2 (Core Features), Epic 3 (Goals & Streaks)

---

## Executive Summary

Epic 4 completes the Zikr PWA v1 feature set by implementing progress visualization, settings management, and comprehensive polish/accessibility. This epic transforms the app from functional to delightful, providing users with insights into their practice and full control over their experience.

**Key Differentiators from Previous Epics:**
- Focuses on visualization and user insights rather than core functionality
- Emphasizes accessibility compliance (WCAG 2.1 AA)
- Performance optimization to meet PWA best practices
- Cross-platform consistency (iOS limitations transparently communicated)

---

## Epic Scope

### In Scope
1. **Progress Visualization** (Story 4.1)
   - Daily summary with breakdown by zikr
   - Weekly bar chart (last 7 days)
   - Goal progress integration
   - Empty state handling

2. **Settings & Configuration** (Story 4.2)
   - Dark mode toggle with persistence
   - Data export (JSON download)
   - Data import (JSON restore)
   - Platform limitations documentation
   - App information section

3. **Polish & Accessibility** (Story 4.3)
   - Touch target audit (≥44x44px)
   - ARIA label implementation
   - Color contrast verification (≥4.5:1)
   - Smooth animations and transitions

4. **Performance Optimization** (Story 4.4)
   - Code splitting with React.lazy()
   - Tailwind bundle optimization
   - Performance audit (Lighthouse)
   - React.memo profiling

### Out of Scope (Deferred to v1.1+)
- Advanced analytics (monthly summaries, trends)
- Notification scheduling (beyond in-app reminders)
- Cloud sync/backup
- Social features
- Audio/tasbeeh sounds

---

## Story 4.1: Progress Visualization

### User Story
**As a** practitioner  
**I want to** see my progress over time  
**So that** I can review my practice and stay motivated

### Functional Requirements

#### FR-4.1.1: Daily Summary Display
- **Description**: Progress screen must show today's total dhikr count
- **Acceptance Criteria**:
  - Display total count across all zikrs for today (local device time)
  - Breakdown by zikr with individual counts
  - Percentage of daily goal completion (if active goal exists)
  - Update automatically when new sessions are added (liveQuery)
  - Handle timezone changes consistently (use device local time)
- **Priority**: P0 (Must-have)
- **Dependencies**: sessionStore, goalStore (from Epic 3)

#### FR-4.1.2: Weekly Trend Chart
- **Description**: Visual representation of practice over last 7 days
- **Acceptance Criteria**:
  - Bar chart showing total counts per day (Mon-Sun)
  - X-axis: Day labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  - Y-axis: Count values (auto-scale based on maximum)
  - Today's bar highlighted with distinct color
  - Zero values shown (no gaps in chart)
  - Responsive on mobile viewport
  - Accessible: Each bar has aria-label with count and day
- **Priority**: P0 (Must-have)
- **Technical Notes**: Use simple HTML/CSS bars (no chart library needed)

#### FR-4.1.3: Goal Progress Indication
- **Description**: Show progress toward active goals
- **Acceptance Criteria**:
  - List all active goals with progress bars
  - Show: current count / target count (e.g., "45 / 100")
  - Visual progress bar with percentage
  - Group by zikr if multiple goals per zikr
  - Link to Goals screen for full management
  - Handle completed goals (show "Completed!" badge)
- **Priority**: P1 (Should-have)
- **Dependencies**: GoalService (from Epic 3)

#### FR-4.1.4: Empty State Handling
- **Description**: Graceful handling when no sessions exist
- **Acceptance Criteria**:
  - Show friendly message: "Start practicing to see your progress"
  - Include call-to-action button to Counter screen
  - Illustration or icon for visual appeal
  - No broken UI elements
- **Priority**: P0 (Must-have)

#### FR-4.1.5: Streak Display
- **Description**: Show current streak on progress screen
- **Acceptance Criteria**:
  - Display StreakBadge component (from Epic 3)
  - Show: 🔥 with current streak number
  - Longest streak on tap/long-press
  - Hide if streak is 0
- **Priority**: P1 (Should-have)
- **Dependencies**: StreakService (from Epic 3)

### Data Requirements

#### DR-4.1.1: Progress Calculation
- Daily total: Sum all session counts where `session.date === today` (local time)
- Weekly data: Array of 7 objects, each with `{ day, count }`
- Goal progress: Use existing GoalService calculation from Epic 3

#### DR-4.1.2: Date Handling
- All dates in device local time (no UTC conversion)
- Today boundary: midnight to midnight in user's timezone
- Week calculation: Last 7 complete days including today

### UI/UX Requirements

#### UX-4.1.1: Screen Layout
```
┌─────────────────────────────┐
│  Progress (Title)            │
├─────────────────────────────┤
│  🔥 7 day streak            │  ← StreakBadge
│                              │
│  Today's Summary            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← Section divider
│  Total: 234 dhikr           │  ← Daily summary
│  • SubhanAllah: 100         │
│  • Alhamdulillah: 89        │
│  • Allahu Akbar: 45         │
│                              │
│  This Week                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [BAR CHART]                │  ← WeeklyChart component
│  Mon Tue Wed Thu Fri Sat    │
│   ██  ████  ██  █   ██  █  │
│                              │
│  Active Goals               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  SubhanAllah Daily Goal      │
│  ████████░░░░ 80 / 100      │  ← Goal progress
│                              │
└─────────────────────────────┘
```

#### UX-4.1.2: Visual Hierarchy
- Primary focus: Today's summary (large numbers)
- Secondary: Weekly chart (visual trend)
- Tertiary: Goals (detailed progress)

### Technical Requirements

#### TR-4.1.1: Component Structure
```
src/pages/Progress.tsx           ← Main container
src/components/DailySummary.tsx  ← Today's summary
src/components/WeeklyChart.tsx   ← Weekly bar chart
src/components/GoalProgress.tsx  ← Goal progress cards
```

#### TR-4.1.2: State Management
- Use existing sessionStore and goalStore (no new stores needed)
- liveQuery subscription for automatic updates
- No local component state (all from stores)

#### TR-4.1.3: Performance
- Chart rendering: <100ms for 7-bar calculation
- Total screen load: <300ms on mid-range mobile
- Use React.memo for chart bars (prevent re-renders)

### Integration Points

#### IP-4.1.1: Session Data
- Query: `db.sessions.where('date').equals(formatDate(today))`
- Transform: Group by zikrId, sum counts
- Update: liveQuery from sessionStore

#### IP-4.1.2: Goal Data
- Use existing GoalService.getActiveGoals()
- Use existing GoalService.calculateProgress()
- Link to /goals route for management

#### IP-4.1.3: Streak Data
- Use existing StreakBadge component
- Query: `db.streaks.get(zikrId)`
- No additional calculations needed

### Edge Cases & Error Handling

#### EC-4.1.1: No Sessions Today
- Daily summary shows "No sessions today"
- Weekly chart still displays (shows 0 for today)
- Goals section still shows (if active goals exist)

#### EC-4.1.2: Deleted Zikr in History
- Show "Deleted Zikr" in breakdown
- Grayed out styling
- Still count toward total (data integrity)

#### EC-4.1.3: Large Count Values
- Chart auto-scales (no overflow)
- Format numbers >1000 as "1.2k" if needed
- Progress bars handle 100%+ (show completion badge)

#### EC-4.1.4: Midnight Boundary
- Recalculate "today" when day changes
- Use liveQuery to auto-update
- No page refresh needed

### Accessibility Requirements

#### A11y-4.1.1: Screen Reader Support
- Chart bars have aria-label: "Monday: 100 dhikr"
- Progress bars have aria-valuenow and aria-valuemax
- Goals section uses landmark `<section>` tags

#### A11y-4.1.2: Keyboard Navigation
- Tab order through interactive elements
- Enter/Space on goal cards navigates to Goals screen
- Escape closes any modals (if added later)

#### A11y-4.1.3: Color Contrast
- All text ≥4.5:1 contrast ratio
- Chart colors distinguishable in both light/dark mode
- Progress bars use semantic colors (green/blue)

---

## Story 4.2: Settings & Configuration

### User Story
**As a** user  
**I want to** configure app settings and manage my data  
**So that** the app works my way and my data is safe

### Functional Requirements

#### FR-4.2.1: Dark Mode Toggle
- **Description**: User can switch between light and dark themes
- **Acceptance Criteria**:
  - Toggle switch in Settings screen
  - Preference persisted in IndexedDB settings store
  - Applies immediately (no reload required)
  - Respects system preference on first launch
  - All components support both themes
  - Toggle accessible (44x44px touch target, aria-label)
- **Priority**: P0 (Must-have)
- **Dependencies**: Tailwind dark mode (configured in Epic 1)

#### FR-4.2.2: Data Export
- **Description**: User can download all their data as JSON
- **Acceptance Criteria**:
  - "Export Data" button in Settings
  - Downloads JSON file named `zikr-backup-YYYY-MM-DD.json`
  - Includes all entities: zikrs, sessions, goals, streaks, settings
  - Shows success toast after download
  - Handles large datasets (>1000 sessions) without timeout
  - No data loss during export
- **Priority**: P0 (Must-have)
- **Dependencies**: All IndexedDB stores

#### FR-4.2.3: Data Import
- **Description**: User can restore data from JSON backup
- **Acceptance Criteria**:
  - "Import Data" button in Settings
  - File picker accepts .json files
  - Validates JSON structure before import
  - Shows confirmation dialog: "This will replace all data. Continue?"
  - Clears existing data before import
  - Imports all entities atomically (transaction)
  - Shows success toast and refreshes stores
  - Shows error toast if validation fails
- **Priority**: P0 (Must-have)
- **Dependencies**: ExportService

#### FR-4.2.4: App Information
- **Description**: About section with app details
- **Acceptance Criteria**:
  - App name and version
  - Short description: "Islamic dhikr practice tracker"
  - Link to GitHub repo (if public)
  - "Made with ❤️ for the Muslim ummah"
- **Priority**: P2 (Nice-to-have)

#### FR-4.2.5: Platform Limitations Documentation
- **Description**: Transparent communication about iOS limitations
- **Acceptance Criteria**:
  - "Platform Limitations" section in Settings
  - Explains iOS reminder limitations (no background reminders)
  - Clarifies v1 reminder scope (in-app only, cross-platform)
  - Links to counter screen for practicing
  - Non-technical language (user-friendly)
  - Acknowledges limitation while offering alternatives
- **Priority**: P0 (Must-have)
- **Dependencies**: ADR 003 (PWA strategy)

### Data Requirements

#### DR-4.2.1: Export JSON Schema
```json
{
  "version": "1.0",
  "exportDate": "2025-06-15T10:30:00Z",
  "zikrs": [...],
  "sessions": [...],
  "goals": [...],
  "streaks": [...],
  "settings": [...]
}
```

#### DR-4.2.2: Settings Store Schema
```typescript
Setting {
  key: string,        // 'darkMode', 'lastExportDate', etc.
  value: any,         // boolean, string, number
  updatedAt: Date
}
```

### UI/UX Requirements

#### UX-4.2.1: Settings Screen Layout
```
┌─────────────────────────────┐
│  Settings (Title)           │
├─────────────────────────────┤
│  Appearance                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🌙 Dark Mode               │  ← Toggle switch
│                              │
│  Data Management            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  📤 Export Data             │  ← Button
│  📥 Import Data             │  ← Button
│                              │
│  Platform Limitations       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ℹ️ iOS Reminder Limitations │  ← Disclosure
│  [About iOS reminders...]    │
│                              │
│  About                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Zikr v1.0.0                │
│  Islamic dhikr tracker      │
│  Made with ❤️                │
└─────────────────────────────┘
```

#### UX-4.2.2: Dark Mode Toggle
- Left-aligned label "Dark Mode"
- Right-aligned toggle switch (animated)
- Immediate theme change (no reload)
- Persisted in settings store

#### UX-4.2.3: Export/Import Buttons
- Full-width buttons (44x44px min)
- Icons + text labels
- Loading state during export (spinner)
- Success/error toasts

### Technical Requirements

#### TR-4.2.1: Component Structure
```
src/pages/Settings.tsx              ← Main container
src/components/SettingSection.tsx   ← Section grouping
src/components/DarkModeToggle.tsx   ← Theme switcher
src/services/exportService.ts        ← Export/import logic
```

#### TR-4.2.2: ExportService Implementation
```typescript
export async function exportData(): Promise<Blob> {
  // 1. Fetch all entities from IndexedDB
  // 2. Wrap in export schema
  // 3. Create JSON blob
  // 4. Return blob for download
}

export async function importData(jsonFile: File): Promise<void> {
  // 1. Parse JSON
  // 2. Validate schema
  // 3. Clear existing data (with confirmation)
  // 4. Import all entities in transaction
  // 5. Refresh all stores
}
```

#### TR-4.2.3: SettingsStore
- New Zustand store for settings
- liveQuery to `db.settings` table
- Actions: `setDarkMode`, `getDarkMode`, `setSetting`, `getSetting`

### Integration Points

#### IP-4.2.1: Dark Mode with Tailwind
- SettingsStore persists preference
- App.tsx reads on mount and applies 'dark' class
- All components use `dark:` prefix

#### IP-4.2.2: Export with IndexedDB
- Use `db.transaction()` to fetch all tables
- Handle large datasets with pagination if needed

#### IP-4.2.3: Import with Validation
- Schema validation before import
- Rollback on partial failure
- Error messages for invalid files

### Edge Cases & Error Handling

#### EC-4.2.1: Export Failure
- Catch IndexedDB errors
- Show toast: "Export failed. Please try again."
- Log error to console (for debugging)

#### EC-4.2.2: Import Invalid JSON
- Validate JSON structure
- Show toast: "Invalid backup file. Please check the file format."
- Don't clear existing data if validation fails

#### EC-4.2.3: Import Partial Failure
- Use transaction (all-or-nothing)
- Rollback on any error
- Show toast: "Import failed. No data was changed."

#### EC-4.2.4: Large Export File
- Handle >1MB files without timeout
- Show progress indicator if export takes >500ms
- Optimize JSON structure (remove unnecessary fields)

#### EC-4.2.5: Dark Mode System Preference
- On first launch: check `window.matchMedia('(prefers-color-scheme: dark)')`
- Save as initial setting
- Don't override if user manually toggles later

### Accessibility Requirements

#### A11y-4.2.1: Toggle Switch
- aria-label: "Toggle dark mode"
- aria-checked: true/false
- Keyboard accessible (Enter/Space to toggle)

#### A11y-4.2.2: Export/Import Buttons
- aria-label: "Export all data as JSON"
- aria-describedby: "Download backup file"
- Focus visible (outline)

#### A11y-4.2.3: Platform Limitations Section
- Clear, non-technical language
- No jargon ("background API" → "reminders")
- Positive framing ("Works best when app is open")

---

## Story 4.3: Polish & Accessibility

### User Story
**As a** user  
**I want to** a polished, accessible app  
**So that** I can use it comfortably regardless of my abilities

### Functional Requirements

#### FR-4.3.1: Touch Target Audit
- **Description**: Ensure all interactive elements meet minimum size
- **Acceptance Criteria**:
  - All buttons ≥44x44px (mobile guidelines)
  - All touch targets ≥44x44px (tap areas)
  - Touch targets for icons (edit, delete, etc.)
  - Tap areas for navigation items
  - Swipe targets in ZikrList
  - Document any exceptions (with justification)
- **Priority**: P0 (Must-have)
- **Dependencies**: All UI components from Epics 1-3

#### FR-4.3.2: ARIA Label Implementation
- **Description**: Add accessibility labels to all interactive elements
- **Acceptance Criteria**:
  - Icon-only buttons have aria-label
  - Form inputs have aria-label (if no visible label)
  - Navigation links have aria-label (if icon-only)
  - Modal dialogs have aria-labelledby and aria-describedby
  - Error messages have aria-live="polite"
  - Chart bars have aria-label with data
  - Test with screen reader (VoiceOver/TalkBack)
- **Priority**: P0 (Must-have)
- **Dependencies**: All components

#### FR-4.3.3: Color Contrast Verification
- **Description**: Ensure all text meets WCAG 2.1 AA standards
- **Acceptance Criteria**:
  - All text ≥4.5:1 contrast ratio (normal text)
  - Large text ≥3:1 contrast ratio (18pt+)
  - Interactive elements ≥3:1 contrast ratio
  - Focus indicators visible (≥3:1)
  - Test in both light and dark modes
  - Document color palette with contrast ratios
- **Priority**: P0 (Must-have)
- **Dependencies**: Tailwind configuration

#### FR-4.3.4: Animations and Transitions
- **Description**: Add smooth, subtle animations throughout
- **Acceptance Criteria**:
  - Counter increment: Spring animation (0-300ms)
  - Modal open/close: Fade + scale (200ms)
  - Button interactions: Color transition (150ms)
  - Page transitions: Fade (150ms)
  - Progress bars: Animate to value (300ms)
  - Chart bars: Grow from bottom (200ms)
  - Respect `prefers-reduced-motion` (disable if set)
  - All animations ≤300ms (spiritual app = calm)
- **Priority**: P1 (Should-have)
- **Dependencies**: All interactive elements

### UI/UX Requirements

#### UX-4.3.1: Animation Timing
- Fast interactions: 150ms (buttons, links)
- Medium transitions: 200ms (modals, pages)
- Slow updates: 300ms (progress, counters)

#### UX-4.3.2: Animation Easing
- Standard: `ease-out` (natural deceleration)
- Spring: Custom spring for counters (bounce at end)
- Linear: Only for loading spinners

#### UX-4.3.3: Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Technical Requirements

#### TR-4.3.1: Accessibility Testing
- Manual testing with VoiceOver (iOS)
- Manual testing with TalkBack (Android)
- Lighthouse accessibility audit (score ≥90)
- axe DevTools extension scan (0 violations)

#### TR-4.3.2: Animation Implementation
```typescript
// CSS-in-TS approach (Tailwind)
className="transition-all duration-200 ease-out"

// Framer Motion (if needed for complex animations)
import { motion } from 'framer-motion';
```

#### TR-4.3.3: Color Contrast Testing
- Use WebAIM Contrast Checker
- Document all color pairs
- Adjust Tailwind colors if needed

### Integration Points

#### IP-4.3.1: Existing Components
- Audit all components from Epic 1-3
- Fix touch targets in ZikrList
- Add ARIA labels to icon buttons
- Verify contrast in dark mode

#### IP-4.3.2: New Components (Epic 4)
- Build accessibility into Progress screen
- Ensure Settings toggle is accessible
- Chart bars have aria-labels

### Edge Cases & Error Handling

#### EC-4.3.1: Screen Reader Inconsistencies
- Test on multiple platforms (iOS, Android, desktop)
- Provide fallback labels if aria-label not supported
- Use role="button" for non-button interactive elements

#### EC-4.3.2: Reduced Motion Preference
- Check `window.matchMedia('(prefers-reduced-motion: reduce)')`
- Disable all animations if true
- Store preference (don't check repeatedly)

#### EC-4.3.3: High Contrast Mode
- Respect Windows High Contrast mode
- Ensure borders visible in HCM
- Test with Edge browser HCM emulation

---

## Story 4.4: Performance Optimization

### User Story
**As a** user  
**I want to** the app to load quickly  
**So that** I can start practicing immediately

### Functional Requirements

#### FR-4.4.1: Code Splitting
- **Description**: Lazy-load routes to reduce initial bundle
- **Acceptance Criteria**:
  - Use React.lazy() for all page components
  - Suspense fallbacks for loading states
  - Initial bundle <150KB gzipped
  - Route changes load code on-demand
  - No visible lag during navigation
- **Priority**: P0 (Must-have)
- **Dependencies**: React Router (from Epic 1)

#### FR-4.4.2: Tailwind Bundle Optimization
- **Description**: Remove unused Tailwind CSS classes
- **Acceptance Criteria**:
  - Configure content paths in tailwind.config.js
  - Purge unused classes in production build
  - CSS bundle <15KB gzipped
  - All used classes still available
  - Test production build for visual regressions
- **Priority**: P0 (Must-have)
- **Dependencies**: Tailwind CSS (from Epic 1)

#### FR-4.4.3: Performance Audit
- **Description**: Lighthouse audit with performance targets
- **Acceptance Criteria**:
  - First Contentful Paint (FCP) <1.5s (mobile 4G)
  - Time to Interactive (TTI) <3s (mobile 4G)
  - Total bundle size <200KB gzipped
  - Lighthouse performance score ≥90
  - Lighthouse accessibility score ≥90
  - Document which components need React.memo
  - Profile with React DevTools Profiler
- **Priority**: P0 (Must-have)
- **Dependencies**: All components

### Technical Requirements

#### TR-4.4.1: Code Splitting Implementation
```typescript
// App.tsx
const Counter = lazy(() => import('./pages/Counter'));
const Goals = lazy(() => import('./pages/Goals'));
const Progress = lazy(() => import('./pages/Progress'));
const Settings = lazy(() => import('./pages/Settings'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

#### TR-4.4.2: Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/index.html'
  ],
  // ... rest of config
}
```

#### TR-4.4.3: Bundle Size Monitoring
- bundlesize CI check (already configured in Epic 1)
- Fail build if bundle exceeds 200KB
- Document bundle size breakdown by chunk

### Performance Targets

#### PT-4.4.1: Load Times (Mobile 4G)
| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| First Input Delay | <100ms | Lighthouse |
| Total Blocking Time | <300ms | Lighthouse |

#### PT-4.4.2: Bundle Sizes
| Asset | Target | Current |
|-------|--------|---------|
| JS (gzipped) | <200KB | TBD |
| CSS (gzipped) | <15KB | TBD |
| Total (gzipped) | <215KB | TBD |

### Integration Points

#### IP-4.4.1: Vite Build Process
- Use Vite's built-in code splitting
- Configure chunk size limits
- Generate build manifest

#### IP-4.4.2: CI/CD Pipeline
- bundlesize check on PR
- Lighthouse CI on merge to main
- Fail if targets not met

### Edge Cases & Error Handling

#### EC-4.4.1: Lazy Load Failure
- Error boundary catches lazy load errors
- Show user-friendly error message
- Offer retry option

#### EC-4.4.2: Slow Network
- Test on 3G and slow 4G
- Show loading indicator (not blank screen)
- Progressive enhancement (works without JS)

---

## Cross-Cutting Requirements

### Non-Functional Requirements

#### NFR-1: Accessibility (WCAG 2.1 AA)
- All requirements from Story 4.3 apply across Epic 4
- Lighthouse accessibility score ≥90
- Manual screen reader testing

#### NFR-2: Performance
- All requirements from Story 4.4 apply across Epic 4
- No performance regressions from Epic 1-3 baseline

#### NFR-3: Offline-First
- All features work offline (no network calls)
- Service worker caches all assets
- Export/import works in airplane mode

#### NFR-4: Dark Mode
- All components support both themes
- Consistent experience across screens
- No visual glitches on theme switch

### Data Privacy & Security

#### DP-1: Local Data Only
- No data leaves device (export is user-initiated)
- No analytics or tracking
- No network calls in v1

#### DP-2: Export Security
- User controls export file
- No sensitive data in JSON (only zikr names, counts)
- No personal identifiers (no names, emails)

### Testing Strategy

#### TS-1: Unit Tests
- ExportService: export/import, validation
- SettingsStore: get/set operations
- Progress calculation logic

#### TS-2: Integration Tests
- Export/import with real IndexedDB
- Dark mode persistence
- Progress chart data flow

#### TS-3: Accessibility Tests
- Automated: Lighthouse, axe DevTools
- Manual: Screen reader testing
- Manual: Keyboard navigation

#### TS-4: Performance Tests
- Lighthouse audit (all metrics)
- Bundle size check
- Animation performance (profiler)

---

## Acceptance Criteria

### Epic-Level Gates

#### Gate-1: Functional Completeness
- [ ] All user stories implemented
- [ ] All acceptance criteria met
- [ ] No critical bugs
- [ ] No P0 requirements deferred

#### Gate-2: Accessibility
- [ ] Lighthouse accessibility score ≥90
- [ ] Zero axe DevTools violations
- [ ] Manual screen reader test passed
- [ ] Touch targets ≥44x44px verified

#### Gate-3: Performance
- [ ] Bundle size <200KB gzipped
- [ ] Lighthouse performance score ≥90
- [ ] FCP <1.5s, TTI <3s
- [ ] Code splitting implemented

#### Gate-4: Polish
- [ ] Animations smooth (≤300ms)
- [ ] Dark mode consistent
- [ ] Empty states handled
- [ ] Error states handled

---

## Success Criteria

### User-Facing Success
1. **Insights**: Users can see their practice trends over time
2. **Control**: Users can customize app appearance and manage data
3. **Delight**: Smooth animations and polished interactions
4. **Inclusivity**: App usable by people with disabilities

### Technical Success
1. **Performance**: Meets all load time and bundle size targets
2. **Accessibility**: WCAG 2.1 AA compliant
3. **Quality**: Zero critical bugs, low bug density
4. **Maintainability**: Clean code, well-documented

### Business Success
1. **Completion**: Epic 4 completes v1 feature set
2. **Launch-Ready**: App ready for public use
3. **Foundation**: Solid base for v1.1 enhancements

---

## Open Questions & Risks

### Questions to Resolve
1. **Chart Library**: Confirm simple HTML/CSS bars (no library needed) ✅
   - Resolution: Use HTML/CSS, maintain consistency with existing patterns

2. **Export Schema**: Finalize JSON structure for backup files ✅
   - Resolution: Schema defined in DR-4.2.1

3. **Animation Library**: Use Framer Motion or CSS-only? ❓
   - Recommendation: CSS-only (Tailwind transitions) to keep bundle small
   - Decision deferred: Evaluate complexity, use Framer Motion only if needed

4. **iOS Limitations Communication**: How technical should we be? ❓
   - Recommendation: Non-technical, user-friendly language
   - Decision deferred: UX copy review

### Risks & Mitigations

#### Risk-1: Performance Regressions
- **Risk**: New features slow down app
- **Mitigation**: Lighthouse CI on every PR, bundle size monitoring

#### Risk-2: Accessibility Gaps
- **Risk**: Screen reader issues on new components
- **Mitigation**: Manual testing with VoiceOver/TalkBack, automated scans

#### Risk-3: Dark Mode Visual Bugs
- **Risk**: Some components don't render correctly in dark mode
- **Mitigation**: Comprehensive visual testing in both themes

#### Risk-4: Export/Import Data Loss
- **Risk**: User loses data during import
- **Mitigation**: Transaction-based import, confirmation dialog, validation

---

## Dependencies & Blockers

### External Dependencies
- None (all functionality is local)

### Internal Dependencies
- **Epic 1**: Foundation infrastructure ✅ Complete
- **Epic 2**: Core features ✅ Complete
- **Epic 3**: Goals & streaks ✅ Complete

### Technical Blockers
- None identified

---

## Implementation Notes

### Consistency with Existing Patterns

#### Pattern-1: Service Layer
- Follow existing pattern: `sessionService`, `streakService`
- New service: `exportService` (export/import logic)
- Async functions, error handling, TypeScript types

#### Pattern-2: State Management
- Use existing stores: sessionStore, goalStore, zikrStore
- New store: settingsStore (minimal, just dark mode preference)
- liveQuery for reactive updates

#### Pattern-3: Component Structure
- Follow existing pattern: pages + components split
- New pages: Progress (already exists), Settings (already exists)
- New components: WeeklyChart, DailySummary, DarkModeToggle

#### Pattern-4: Modal/Dialog
- Follow existing pattern: fixed overlay, centered content
- Reuse modal patterns from ZikrList, ManualEntryModal

### Code Reuse Opportunities

#### Reuse-1: Existing Components
- StreakBadge (from Epic 3): Use in Progress screen
- Navigation (from Epic 1): No changes needed
- Modal patterns (from Epic 2): Use for export/import confirmations

#### Reuse-2: Existing Services
- sessionService: Query sessions for progress calculation
- goalService: Query goals for progress display
- streakService: Query streaks for progress screen

#### Reuse-3: Existing Utilities
- dateUtils: Format dates for progress queries
- validation: Validate export JSON structure

### New Code to Write

#### New-1: ExportService (~200 LOC)
- exportData(): Fetch all tables, create JSON blob
- importData(): Parse JSON, validate, import in transaction
- validateExport(): Schema validation
- downloadBlob(): Trigger download

#### New-2: WeeklyChart Component (~150 LOC)
- Calculate weekly data from sessions
- Render HTML/CSS bars
- Handle empty state
- ARIA labels for accessibility

#### New-3: SettingsStore (~50 LOC)
- Persist dark mode preference
- liveQuery to db.settings
- get/set methods

#### New-4: Progress Screen (~200 LOC)
- Compose DailySummary, WeeklyChart, GoalProgress
- Query data from existing stores
- Handle empty state

**Total Estimated New Code**: ~600 LOC

---

## Timeline & Effort

### Story Breakdown
| Story | Tasks | Est. Effort |
|-------|-------|-------------|
| 4.1 Progress Visualization | 3 tasks | 12-16 hours |
| 4.2 Settings & Configuration | 4 tasks | 10-14 hours |
| 4.3 Polish & Accessibility | 4 tasks | 8-12 hours |
| 4.4 Performance Optimization | 3 tasks | 6-8 hours |
| **Total** | **14 tasks** | **36-50 hours** |

### Critical Path
```
Epic 4 Foundation → Story 4.2 (Settings) → Story 4.1 (Progress) → Story 4.3 (Polish) → Story 4.4 (Performance)
```

### Parallelization Opportunities
- Story 4.1 and 4.2 can be developed in parallel (no shared dependencies)
- Story 4.3 can run after 4.1 and 4.2 (audit completed components)
- Story 4.4 must run last (optimizes everything)

---

## Definition of Done

### Story-Level DoD
- [ ] All acceptance criteria met
- [ ] Code reviewed by peer
- [ ] Unit tests written (for services)
- [ ] Manual testing completed
- [ ] Accessibility verified (Lighthouse + manual)
- [ ] No critical bugs
- [ ] Documentation updated

### Epic-Level DoD
- [ ] All stories completed per story DoD
- [ ] Epic-level acceptance criteria met
- [ ] Integration testing completed
- [ ] Performance audit passed (Lighthouse ≥90)
- [ ] Accessibility audit passed (Lighthouse ≥90, 0 axe violations)
- [ ] Bundle size verified (<200KB)
- [ ] Release notes prepared
- [ ] Demo recorded (for stakeholders)

---

## Appendices

### Appendix A: Component Inventory
```
New Components:
- src/pages/Progress.tsx (update existing)
- src/pages/Settings.tsx (update existing)
- src/components/DailySummary.tsx (new)
- src/components/WeeklyChart.tsx (new)
- src/components/GoalProgress.tsx (new)
- src/components/DarkModeToggle.tsx (new)

Updated Components:
- src/core/components/Navigation.tsx (no changes, verify dark mode)
- src/pages/Counter.tsx (no changes, verify dark mode)

New Services:
- src/services/exportService.ts (new)
- src/core/stores/settingsStore.ts (new)
```

### Appendix B: Data Flow Diagrams

#### Progress Screen Data Flow
```
User opens Progress screen
  └─▶ sessionStore liveQuery triggers
  └─▶ goalStore liveQuery triggers
  └─▶ streakStore liveQuery triggers
  └─▶ Components re-render with new data
  └─▶ WeeklyChart calculates bars from sessions
  └─▶ DailySummary aggregates today's counts
  └─▶ GoalProgress queries goal progress
```

#### Export Data Flow
```
User clicks "Export Data"
  └─▶ ExportService.exportData() called
  └─▶ Transaction fetch all tables
  └─▶ Wrap in export schema
  └─▶ Create JSON blob
  └─▶ Trigger download (filename with timestamp)
  └─▶ Show success toast
```

#### Import Data Flow
```
User clicks "Import Data"
  └─▶ File picker opens
  └─▶ User selects JSON file
  └─▶ ExportService.validateExport() checks schema
  └─▶ Show confirmation dialog
  └─▶ User confirms "Replace all data?"
  └─▶ ExportService.importData() starts transaction
  └─▶ Clear all tables
  └─▶ Import all entities
  └─▶ Refresh all stores
  └─▶ Show success toast
```

### Appendix C: Accessibility Checklist
```
Touch Targets:
☐ All buttons ≥44x44px
☐ All touch targets ≥44x44px
☐ Icon buttons have sufficient tap area
☐ Swipe targets work correctly

ARIA Labels:
☐ Icon-only buttons have aria-label
☐ Form inputs have aria-label or visible label
☐ Modal dialogs have aria-labelledby
☐ Error messages have aria-live
☐ Chart bars have aria-label with data

Color Contrast:
☐ All text ≥4.5:1 contrast ratio
☐ Interactive elements ≥3:1 contrast ratio
☐ Focus indicators visible (≥3:1)
☐ Tested in both light and dark modes

Screen Reader:
☐ Tested with VoiceOver (iOS)
☐ Tested with TalkBack (Android)
☐ Logical tab order
☐ No unlabeled interactive elements

Keyboard Navigation:
☐ All actions accessible via keyboard
☐ Tab order logical
☐ Enter/Space activate buttons
☐ Escape closes modals
☐ Focus indicators visible
```

### Appendix D: Performance Checklist
```
Bundle Size:
☐ JS bundle <200KB gzipped
☐ CSS bundle <15KB gzipped
☐ Total bundle <215KB gzipped
☐ Code splitting implemented

Load Times:
☐ FCP <1.5s (mobile 4G)
☐ TTI <3s (mobile 4G)
☐ First Input Delay <100ms
☐ Total Blocking Time <300ms

Lighthouse:
☐ Performance score ≥90
☐ Accessibility score ≥90
☐ Best Practices score ≥90
☐ SEO score ≥90 (PWA)

Animations:
☐ All animations ≤300ms
☐ Respects prefers-reduced-motion
☐ No layout shifts (CLS <0.1)
☐ Smooth 60fps transitions
```

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-06-15 | 1.0 | Initial requirements document | Requirements Collector |

---

**Document Status**: Ready for Architecture Review  
**Next Step**: Proceed to Solution Architecture phase
