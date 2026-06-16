# Requirements: Epic 4 - Progress, Settings & Polish

**Epic**: Epic 4: Progress, Settings & Polish
**Date**: 2026-06-15
**Status**: Draft
**Dependencies**: Epic 1 (Foundation), Epic 2 (Core Features), Epic 3 (Goals & Streaks) - Complete

---

## Epic Overview

**User Story**: As a user, I want to visualize my progress, configure app settings, and experience a polished interface, so that I can track my spiritual journey and customize the app to my preferences.

**Scope**: This epic delivers visualization, configuration, and polish features:
1. **Progress Visualization**: Daily summaries, weekly charts, goal progress tracking
2. **Settings & Configuration**: Dark mode, data export/import, app configuration
3. **Polish & Accessibility**: WCAG 2.1 AA compliance, smooth animations, refined UX

**Constraints**:
- $0/month operational cost (no backend, all local)
- Mobile-first design with thumb-zone interaction
- Offline-first functionality
- English-only v1

---

## Story 4.1: Progress Visualization

### User Story
**As a** user  
**I want** to see my practice progress over time  
**So that** I can review my spiritual journey and stay motivated

### Acceptance Criteria
- [ ] Daily summary shows total count and breakdown by zikr
- [ ] Weekly trend chart displays last 7 days of practice
- [ ] Goal progress indication integrated with Epic 3 goals
- [ ] Empty state handles no sessions gracefully

### Functional Requirements

#### 4.1.1: Progress Screen Component
**File**: `src/pages/Progress.tsx` (update placeholder)
**Purpose**: Main progress visualization screen

**Requirements**:
- **Section 1: Today's Summary**
  - Total dhikr count today
  - Breakdown by zikr (with icons)
  - Comparison to yesterday (optional v1.1)
- **Section 2: Weekly Chart**
  - Bar chart showing last 7 days (Mon-Sun)
  - Today's bar highlighted
  - Auto-scaling Y-axis
  - Simple HTML/CSS (no chart library)
- **Section 3: Goal Progress**
  - Integration with Epic 3 GoalList
  - Shows active goals with progress bars
  - Quick access to Goals screen

**Data Source**:
- sessionStore (sessions for daily/weekly)
- goalStore (goal progress)
- zikrStore (zikr names/icons)

**Dependencies**: Epic 1 (stores), Epic 3 (goals)

---

#### 4.1.2: Weekly Chart Component
**File**: `src/components/WeeklyChart.tsx`
**Purpose**: Simple bar chart for weekly trend visualization

**Requirements**:
- **X-axis**: Day labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- **Y-axis**: Count values (auto-scale based on max)
- **Bars**: One per day, height proportional to count
- **Styling**:
  - Today's bar: blue/active color
  - Other bars: gray/neutral color
  - Min bar height: 4px (visibility)
  - Max height: 120px
- **Responsiveness**: Works on mobile viewport (max 640px)
- **Touch**: Tap bar to see exact count (tooltip or inline)

**Algorithm**:
```typescript
function getWeeklyData(sessions: Session[]): WeeklyData[] {
  const today = new Date();
  const weekStart = getPeriodStart('weekly', today);
  const weekEnd = getPeriodEnd('weekly', today);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.toDateString() === dayDate.toDateString();
    });
    
    const total = daySessions.reduce((sum, s) => sum + s.count, 0);
    days.push({ date: dayDate, total, isToday: i === 6 });
  }
  return days;
}
```

**Dependencies**: Epic 1 (goalUtils for period calculation)

---

#### 4.1.3: Empty State Handling
**File**: `src/pages/Progress.tsx` (logic)
**Purpose**: Graceful handling when no sessions exist

**Requirements**:
- **Condition**: No sessions in sessionStore
- **Display**:
  - Friendly message: "Start practicing to see your progress"
  - 🔥 emoji (streak motivation)
  - CTA button: "Go to Counter" (navigates to /)
- **Fallback**: If sessions exist but chart empty (no data this week)
  - Show chart with empty bars
  - Message: "No sessions this week yet"

**Dependencies**: sessionStore

---

## Story 4.2: Settings & Configuration

### User Story
**As a** user  
**I want** to configure app settings and manage my data  
**So that** I can customize the experience and backup my progress

### Acceptance Criteria
- [ ] Dark mode toggle with persistence
- [ ] Data export downloads JSON file
- [ ] Data import restores from JSON file
- [ ] Platform limitations documented transparently

### Functional Requirements

#### 4.2.1: Settings Screen Component
**File**: `src/pages/Settings.tsx` (update placeholder)
**Purpose**: Main settings and configuration screen

**Requirements**:
- **Section 1: Appearance**
  - Dark mode toggle (switch)
  - Preview of dark/light mode
- **Section 2: Data Management**
  - Export Data button (downloads JSON)
  - Import Data button (uploads JSON)
  - Clear All Data button (destructive, requires confirmation)
- **Section 3: App Info**
  - App version (from package.json)
  - Build information
  - Links to docs (optional v1.1)
- **Section 4: Platform Limitations**
  - iOS reminder limitations explanation
  - In-app vs. background reminders clarification
  - Cross-platform behavior notes

**Dependencies**: Epic 1 (settingsStore, routing)

---

#### 4.2.2: Data Export Functionality
**File**: `src/services/exportService.ts`
**Purpose**: Export all user data to JSON file

**Requirements**:
- **Export Includes**:
  - zikrs (including predefined and custom)
  - sessions (all historical data)
  - goals (active, paused, completed)
  - streaks (current and longest)
  - settings (user preferences)
- **Format**: JSON file with timestamp filename
  - Example: `zikr-backup-2026-06-15.json`
- **Trigger**: Browser download API
- **Validation**:
  - All entities exported
  - No data loss
  - JSON structure valid
- **Error Handling**:
  - Fallback if IndexedDB read fails
  - User notification of export success/failure

**Data Structure**:
```json
{
  "version": "1.0",
  "exportDate": "2026-06-15T21:30:00Z",
  "data": {
    "zikrs": [...],
    "sessions": [...],
    "goals": [...],
    "streaks": [...],
    "settings": [...]
  }
}
```

**Dependencies**: Epic 1 (all stores)

---

#### 4.2.3: Data Import Functionality
**File**: `src/services/exportService.ts` (extend)
**Purpose**: Restore user data from JSON file

**Requirements**:
- **Input**: File upload accepts .json files
- **Validation**:
  - Check JSON structure (version, data fields)
  - Validate entity schemas (zikr, session, goal, streak)
  - Reject invalid files with error message
- **Process**:
  1. Show confirmation: "This will replace all data. Continue?"
  2. Clear existing IndexedDB stores
  3. Import entities in order: zikrs → sessions → goals → streaks → settings
  4. Refresh all stores (trigger liveQuery updates)
  5. Show success notification
- **Error Recovery**:
  - If import fails: rollback to previous data
  - Keep backup of existing data before import
  - User notification of failure
- **Constraints**:
  - File size limit: 10MB (reasonable for personal data)
  - Timeout: 30 seconds (large imports)

**Dependencies**: Epic 1 (all stores, IndexedDB)

---

#### 4.2.4: Dark Mode Implementation
**File**: `src/App.tsx`, `src/core/stores/settingsStore.ts`
**Purpose**: Toggle and persist dark mode preference

**Requirements**:
- **Storage**: Persist in IndexedDB settings store
  ```typescript
  interface Setting {
    key: 'darkMode';
    value: boolean;
  }
  ```
- **Implementation**:
  - Toggle switch in Settings screen
  - Apply 'dark' class to `<html>` element
  - Use Tailwind's `dark:` prefix for all conditional styles
  - Immediate UI update (no reload)
- **Default**: System preference (matchMedia('(prefers-color-scheme: dark)'))
- **Persistence**: Save to IndexedDB on change
- **Migration**: If no setting exists, default to system preference

**Dependencies**: Epic 1 (settingsStore, Tailwind config)

---

#### 4.2.5: Platform Limitations Documentation
**File**: `src/pages/Settings.tsx` (section)
**Purpose**: Transparent communication of platform constraints

**Requirements**:
- **Section Title**: "Platform Limitations"
- **Content**:
  - **iOS**: "Background reminders not supported (Apple limitation)"
  - **Android**: "Full reminder support available"
  - **Cross-platform**: "In-app reminders work on all platforms"
  - **V1 Scope**: "Future versions may add background notifications"
- **Design**:
  - Info icon (ℹ️) with accessible text
  - Collapsible section (optional)
  - Clear, non-technical language
- **Context**:
  - Link to ADR 003 (PWA strategy) if detailed
  - Reassure: "Your data is safe and local"

**Dependencies**: ADR 003 (cross-platform PWA strategy)

---

## Story 4.3: Polish & Accessibility

### User Story
**As a** user  
**I want** a polished, accessible app  
**So that** I can use it comfortably regardless of ability or device

### Acceptance Criteria
- [ ] WCAG 2.1 AA compliance
- [ ] Touch targets ≥ 44x44px minimum
- [ ] Smooth animations and transitions
- [ ] Refined, consistent UI

### Functional Requirements

#### 4.3.1: Touch Target Audit
**File**: All component files
**Purpose**: Ensure all interactive elements meet minimum size requirements

**Requirements**:
- **Audit Scope**: All buttons, taps, swipes, interactive elements
- **Minimum Size**: 44x44px (WCAG 2.1 AA recommendation)
- **Testing**:
  - Manual audit of all screens
  - Mobile viewport testing (375px width)
  - Touch target verification
- **Fix Strategy**:
  - Add padding to small buttons
  - Use `min-h-[44px]` Tailwind class
  - Expand tap areas with invisible hitboxes
  - Document exceptions (if any)

**Dependencies**: All UI components (Epic 1-3)

---

#### 4.3.2: ARIA Labels Implementation
**File**: All component files
**Purpose**: Ensure screen reader accessibility

**Requirements**:
- **Mandatory ARIA**:
  - All icon-only buttons: `aria-label` or `aria-labelledby`
  - Progress bars: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
  - Modal dialogs: `role="dialog"`, `aria-modal="true"`
  - Form inputs: `aria-label`, `aria-invalid` for errors
  - Navigation: `role="navigation"`, landmark labels
- **Semantic HTML**:
  - Use `<button>` for actions (not `<div>`)
  - Use `<label>` for form inputs
  - Use heading hierarchy (`<h1>`, `<h2>`, etc.)
  - Use list elements for lists
- **Testing**:
  - Screen reader testing (VoiceOver, TalkBack)
  - Keyboard navigation testing
  - ARIA validation tools

**Dependencies**: All UI components

---

#### 4.3.3: Color Contrast Verification
**File**: All component files + Tailwind config
**Purpose**: Ensure text readability for all users

**Requirements**:
- **Contrast Ratio**: ≥ 4.5:1 for normal text (WCAG 2.1 AA)
- **Large Text**: ≥ 3:1 for 18pt+ or 14pt+ bold
- **Testing**:
  - Manual review of all text combinations
  - Contrast checker tool verification
  - Dark mode testing (equivalent requirements)
- **Tailwind Palette**:
  - Use accessible colors from default palette
  - Custom colors must pass contrast check
  - Document color tokens
- **Focus States**:
  - Visible focus indicators
  - 3:1 contrast for focus outlines

**Dependencies**: Epic 1 (Tailwind config), all UI components

---

#### 4.3.4: Animations and Transitions
**File**: `src/index.css`, component files
**Purpose**: Add polish with smooth, performant animations

**Requirements**:
- **Global Transitions** (`index.css`):
  ```css
  .transition-all {
    transition: all 0.2s ease-in-out;
  }
  ```
- **Component Animations**:
  - Modal fade-in: `opacity` + `transform`
  - Button hover: `background-color` + `transform`
  - Progress bars: `width` transition (500ms)
  - Streak badge: `scale` animation on update
- **Performance**:
  - Use `transform` and `opacity` (GPU-accelerated)
  - Avoid animating `width`/`height` (reflows)
  - `will-change` sparingly
- **Accessibility**:
  - Respect `prefers-reduced-motion` media query
  - No animation if user prefers reduced motion

**Dependencies**: All UI components, Epic 1 (index.css)

---

## Technical Requirements

### Performance
- Weekly chart render < 100ms (for 1000 sessions)
- Data export < 1s (for 10,000 sessions)
- Data import < 5s (for 10,000 sessions)
- UI updates 60fps during animations
- No blocking calculations on main thread

### Accessibility
- WCAG 2.1 AA compliance
- All touch targets ≥ 44x44px
- Color contrast ≥ 4.5:1 (normal text)
- Screen reader compatible
- Keyboard navigation support
- ARIA labels on interactive elements

### Data Integrity
- Export includes all entities (zikrs, sessions, goals, streaks, settings)
- Import validates JSON structure
- Import rollback on failure
- No data loss during export/import

### Offline Functionality
- All features work offline
- Export works offline (local download)
- Import works offline (local file)
- No network calls in any flow

### Error Handling
- Export errors: User notification, retry option
- Import errors: Clear error messages, validation feedback
- Chart errors: Fallback to empty state
- Settings errors: Graceful degradation

---

## Integration Points

### Within Epic 4
- **Story 4.1 → 4.2**: Progress screen links to Settings
- **Story 4.2 → 4.3**: Settings applies dark mode (affects all screens)

### With Epic 3 (Goals & Streaks)
- **Progress screen**: Shows Epic 3 goals with progress
- **Streak integration**: Uses StreakBadge from Epic 3
- **Goal progress**: Integrates with GoalList component

### With Epic 2 (Core Features)
- **Progress calculation**: Uses Epic 2 sessions
- **Zikr display**: Shows Epic 2 zikr icons
- **Data export**: Includes Epic 2 custom zikrs

### With Epic 1 (Foundation)
- **All stores**: Uses zikrStore, sessionStore, goalStore, streakStore, settingsStore
- **Service layer**: Uses sessionService for data queries
- **Navigation**: Uses Epic 1 routing
- **UI patterns**: Reuses Epic 1 modal patterns

---

## Success Criteria

### Functional
- [ ] User can view daily and weekly progress
- [ ] User can export and import their data
- [ ] User can toggle dark mode
- [ ] Platform limitations communicated transparently
- [ ] All interactive elements meet accessibility standards

### User Experience
- [ ] Progress visualization is clear and motivating
- [ ] Settings interface is intuitive
- [ ] Data export/import is straightforward
- [ ] Animations are smooth and polished
- [ ] Dark mode works seamlessly

### Technical
- [ ] All operations work offline
- [ ] Performance targets met (< 100ms calculations)
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Bundle size < 200KB gzipped
- [ ] No regressions in existing features

---

## Edge Cases & Considerations

### Edge Cases
1. **No sessions**: Show friendly empty state with CTA
2. **No goals**: Show progress without goals section
3. **Import failure**: Rollback to previous data, clear error message
4. **Export failure**: Retry mechanism, error notification
5. **Huge dataset**: Performance optimization for 10K+ sessions
6. **Invalid JSON**: Validate structure before import, specific error messages
7. **Chart overflow**: Handle very high counts (10K+ dhikr per day)
8. **Dark mode system**: Respect system preference if no user setting

### Considerations
- **Progress privacy**: All data stays local, no cloud sync
- **Import security**: Validate JSON to prevent injection attacks
- **Animation performance**: Test on low-end devices
- **Accessibility testing**: Test with real screen readers
- **Platform limitations**: Be transparent about iOS constraints

---

## Out of Scope (Deferred to v1.1)

- Advanced chart types (line charts, pie charts)
- Goal history/charts beyond progress bars
- Data sync across devices
- Cloud backup/restore
- Advanced settings (sound customization, theme colors)
- Progress sharing on social media
- Achievement badges beyond streaks

---

## Dependencies & Prerequisites

### Completed Prerequisites (Epic 1 + Epic 2 + Epic 3)
- ✅ React + Vite + TypeScript setup
- ✅ IndexedDB with Dexie.js
- ✅ Zustand stores (zikr, session, goal, streak, settings)
- ✅ Service layer (zikr, session, goal, streak, export)
- ✅ React Router with HashRouter
- ✅ Core features (zikr management, counter, manual entry)
- ✅ Goals & streaks functionality

### Required for Epic 4
- None new (builds on Epic 1 + Epic 2 + Epic 3)

---

## Timeline & Effort

**Total Stories**: 3
**Total Tasks**: 14
**Estimated Effort**: 36-50 hours

**Story Breakdown**:
- Story 4.1 (Progress Visualization): 5 tasks, ~16 hours
- Story 4.2 (Settings & Configuration): 5 tasks, ~20 hours
- Story 4.3 (Polish & Accessibility): 4 tasks, ~14 hours

**Critical Path**: 4.1.1 → 4.1.2 → 4.1.3 → 4.2.1 → 4.3.4

---

## Requirements Review Checklist

- [ ] All user stories clearly defined
- [ ] Acceptance criteria specific and measurable
- [ ] Edge cases identified and addressed
- [ ] Integration points documented
- [ ] Performance requirements specified
- [ ] Accessibility requirements included
- [ ] Error handling defined
- [ ] Out of scope clearly delimited
- [ ] Dependencies on Epic 1 + Epic 2 + Epic 3 verified
- [ ] Technical constraints considered

---

**Status**: ✅ Requirements complete
**Next Phase**: Requirements Review (Phase 1.1)
