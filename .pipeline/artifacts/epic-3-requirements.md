# Requirements: Epic 3 - Goals & Streaks

**Epic**: Epic 3: Goals & Streaks
**Date**: 2026-06-15
**Status**: Draft
**Dependencies**: Epic 1 (Foundation), Epic 2 (Core Features) - Complete

---

## Epic Overview

**User Story**: As a user, I want to set goals for my zikr practice and track my streaks, so that I can stay motivated and monitor my spiritual progress.

**Scope**: This epic delivers motivational and tracking features:
1. **Goal Management**: Create daily/weekly/monthly/custom goals with progress tracking
2. **Streak Visualization**: Display current and longest streaks with visual badges

**Constraints**:
- $0/month operational cost (no backend, all local)
- Mobile-first design with thumb-zone interaction
- Offline-first functionality
- English-only v1

---

## Story 3.1: Goal Management

### User Story
**As a** user  
**I want** to set goals for my zikr practice  
**So that** I can track progress toward targets

### Acceptance Criteria
- [ ] Create daily/weekly/monthly/custom goals
- [ ] View goal progress with visual indicators
- [ ] Pause/resume/completed states
- [ ] Progress calculation based on actual sessions

### Functional Requirements

#### 3.1.1: GoalList Component
**File**: `src/components/GoalList.tsx`
**Purpose**: Display all goals with progress bars and status

**Requirements**:
- Load goals from goalStore using liveQuery
- Show progress bar for each goal (current / target)
- Display goal status: active (green), paused (gray), completed (gold)
- Group by zikr (show zikr name with each goal)
- Empty state: "No goals yet - set your first target!"
- Touch targets ≥ 44x44px
- Filter controls: All / Active / Paused / Completed

**Data Source**: goalStore (Goal[])

**Dependencies**: Task 1.3.3 (stores), Task 1.4.1 (routing)

---

#### 3.1.2: AddGoal Modal
**File**: `src/components/AddGoalModal.tsx`
**Purpose**: Allow users to create goals with flexible parameters

**Requirements**:
- Modal with "Set Goal" title
- **Zikr selector**: Dropdown (filtered to active zikrs, excludes deletedAt)
- **Period selector**: Daily, Weekly, Monthly, Custom
- **Target input**: Number field (min: 1, max: 10000)
- **Date range pickers** (if Custom): Start date, End date
- Save and Cancel buttons
- Validation:
  - Zikr required
  - Target required (> 0)
  - Date range required for Custom period
- Error messages inline below inputs
- On save: call goalService.add(), goalStore auto-updates
- Loading state during save
- Success feedback: "Goal set" toast

**Input**: zikrId, period, target, startDate?, endDate?
**Output**: Creates Goal entity with status: 'active'

**Dependencies**: Task 3.1.1

---

#### 3.1.3: Goal Progress Calculation
**File**: `src/services/goalService.ts` (update)
**Purpose**: Calculate goal progress based on sessions

**Requirements**:
- For **daily** goals: Sum today's sessions (device local time)
- For **weekly** goals: Sum this week's sessions (Mon-Sun)
- For **monthly** goals: Sum this month's sessions
- For **custom** goals: Sum sessions in date range (inclusive)
- Return: current count, target, percentage
- Handle edge cases: No sessions (0%), exceeded target (>100%)
- Use device local time consistently (no timezone conversion)

**Algorithm**:
```typescript
function calculateGoalProgress(goal: Goal, sessions: Session[]): Progress {
  const sessionsInPeriod = filterSessionsByPeriod(sessions, goal);
  const currentCount = sessionsInPeriod.reduce((sum, s) => sum + s.count, 0);
  const percentage = Math.min((currentCount / goal.target) * 100, 100);
  
  return { currentCount, target: goal.target, percentage };
}
```

**Dependencies**: Task 1.3.2 (sessionService), Task 1.2.3 (dateUtils)

---

#### 3.1.4: Pause/Resume Goal
**File**: `src/components/GoalList.tsx` (update)
**Purpose**: Allow users to temporarily stop tracking a goal

**Requirements**:
- Toggle button on each goal card
- Show "Pause" button for active goals
- Show "Resume" button for paused goals
- Visual distinction for paused goals:
  - Grayed out opacity (60%)
  - Dimmed progress bar
  - "Paused" badge visible
- On toggle: call goalService.updateStatus()
- Updates immediately in goalStore via liveQuery

**Status Transitions**:
- active → paused: "Pause" button, user confirms
- paused → active: "Resume" button, immediate activation

**Dependencies**: Task 3.1.1

---

#### 3.1.5: Mark Goal as Completed
**File**: `src/services/goalService.ts` (update)
**Purpose**: Automatically mark goals as completed when target reached

**Requirements**:
- After each session save, check if any goal reached target
- Calculate progress including new session
- If currentCount >= target: Update status to 'completed'
- Show celebration animation (simple confetti or emoji burst)
- Play subtle sound/haptic if available
- Display "🎉 Goal reached!" toast notification
- Update goalStore immediately

**Trigger Points**:
- After manual session save
- After counter auto-save (33, 100)
- After bulk import (future Epic 6)

**Dependencies**: Task 3.1.3, Task 2.2.3 (auto-save), Task 2.3.2 (manual save)

---

## Story 3.2: Streak Visualization

### User Story
**As a** user  
**I want** to see my practice streak  
**So that** I'm motivated to practice daily

### Acceptance Criteria
- [ ] Current streak displayed (days)
- [ ] Longest streak tracked
- [ ] Streak breaks correctly (gap > 1 day)
- [ ] Same day doesn't increment
- [ ] Visual badge with 🔥 emoji

### Functional Requirements

#### 3.2.1: Streak Calculation Verification
**File**: `src/services/streakService.ts` (verify)
**Purpose**: Ensure streak calculation works correctly per architecture fix

**Requirements**:
- Streak increments only when date changes, not same day
- If `sessionDate !== lastProcessedDate`: Check gap
- If `daysSince > 1`: Reset currentStreak to 0 (streak broken)
- If `daysSince === 1`: Increment currentStreak (consecutive day)
- Always update longestStreak if currentStreak exceeds it
- Use device local time for all date calculations
- Handle first session: `lastProcessedDate` defaults to epoch (new Date(0))

**Verification Tests**:
- Single session per day: Streak = 1
- Multiple sessions same day: Streak = 1 (no inflation)
- Miss one day: Streak resets to 0
- Resume next day: Streak = 1 (new streak)
- 7 consecutive days: Streak = 7

**Dependencies**: Task 1.3.2 (streakService - already implemented)

---

#### 3.2.2: StreakBadge Component
**File**: `src/components/StreakBadge.tsx`
**Purpose**: Display streak with 🔥 emoji and count

**Requirements**:
- Show 🔥 emoji with current streak number
- Format: "🔥 5 day streak" or "🔥 5" (compact)
- Show on counter screen (top right or inline)
- Show on progress screen (summary section)
- Hide if streak is 0 (no practice yet)
- **Long-press or tap**: Show longest streak
  - Display: "🏆 Best: 10 days"
  - Auto-hide after 3 seconds
- Loading state: Show skeleton while calculating
- Touch target: ≥ 44x44px
- Animated update: Scale animation when streak increases

**Data Source**: streakStore (Streak for selected zikr)

**Dependencies**: Task 3.2.1, Task 1.3.3 (stores)

---

#### 3.2.3: Update Streak on Session Save
**File**: `src/services/sessionService.ts` (verify)
**Purpose**: Ensure streak updates automatically after session save

**Requirements**:
- Verify sessionService.add() calls streakService.updateStreak()
- Verify update is atomic with session save
- Verify update happens for all session sources:
  - 'app' (counter auto-save)
  - 'manual' (manual entry)
  - 'physical' (future bulk entry)
- Verify error handling: If streak update fails, session still saves
- Use correct date field: session.date (not session.timestamp)

**Verification**:
- Code inspection: sessionService.add() includes streak update
- Test: Create session → Verify streak increments
- Test: Same day multiple sessions → Verify no inflation
- Test: Skip day → Verify streak resets

**Dependencies**: Task 2.2.3 (auto-save), Task 2.3.2 (manual save), Task 1.3.2 (streakService)

---

## Technical Requirements

### Performance
- Goal progress calculation < 100ms (for 10 goals, 1000 sessions)
- Streak update < 50ms (single zikr query)
- UI updates 60fps during animations
- No blocking calculations on main thread

### Accessibility
- All touch targets ≥ 44x44px
- ARIA labels for progress bars
- Screen reader announcements for goal completion
- Keyboard navigation support
- Color contrast ≥ 4.5:1

### Data Integrity
- Goal progress accurate based on sessions
- Streak calculation correct per date logic
- No race conditions in updates
- Atomic operations with rollback on error

### Offline Functionality
- All features work offline
- No network calls in any flow
- Data persists locally only

### Error Handling
- GoalService errors: User notification, no data loss
- StreakService errors: Graceful fallback, show "Streak unavailable"
- UI errors: FallbackBanner (from Epic 1)
- Progress calculation errors: Show 0% with error message

---

## Integration Points

### Within Epic 3
- **Story 3.1 → Story 3.2**: Goals provide context for streaks display
- **Story 3.2 → Story 3.1**: Streak badge shows on goal cards

### With Epic 2 (Core Features)
- **Session creation**: Triggers streak update (Task 3.2.3)
- **Session creation**: Checks goal completion (Task 3.1.5)
- **Zikr selector**: Shared with goals and streaks

### With Epic 1 (Foundation)
- **Goal tracking**: Uses goalStore from Task 1.3
- **Streak tracking**: Uses streakStore from Task 1.3
- **UI Components**: Reuses Navigation, modals from Epic 1

### With Epic 4 (Future) - Progress Visualization
- **Goal progress**: Displayed on Progress screen
- **Streak badges**: Shown in weekly summary

---

## Success Criteria

### Functional
- [ ] User can create goals with flexible periods
- [ ] User can view goal progress accurately
- [ ] User can pause/resume goals
- [ ] Goals mark completed when target reached
- [ ] User can view current and longest streaks
- [ ] Streak calculation is correct (no same-day inflation)
- [ ] Streak updates automatically on session save

### User Experience
- [ ] Goal setting is intuitive (< 1 minute to create goal)
- [ ] Progress visualization is clear and motivating
- [ ] Streak badges provide positive reinforcement
- [ ] Pause/resume is obvious and discoverable
- [ ] Celebration feedback is satisfying

### Technical
- [ ] All operations work offline
- [ ] Performance targets met (< 100ms calculations)
- [ ] Accessibility standards met (44x44px targets, ARIA labels)
- [ ] Bundle size < 200KB gzipped

---

## Edge Cases & Considerations

### Edge Cases
1. **No goals**: Show friendly empty state with CTA
2. **All goals completed**: Show "🎉 All goals completed!" message
3. **All goals paused**: Show "Goals paused - resume to track progress"
4. **No sessions yet**: Progress shows 0%, streak badge hidden
5. **First session**: Streak = 1, displays correctly
6. **Multiple sessions same day**: Streak = 1 (verified no inflation)
7. **Timezone change**: All calculations use local time (no conversion)
8. **Very long streak**: Display formatted number (e.g., "100+ days")
9. **Unrealistic targets**: Allow up to 10,000 per period
10. **Past date range**: Custom goals can have past dates

### Considerations
- **Goal completion**: Celebrate but don't annoy (show toast, don't block)
- **Streak resets**: Discreet notification, don't shame user
- **Paused goals**: Visually distinct but not hidden
- **Progress calculation**: Efficient for 1000+ sessions
- **Streak display**: Compact format to save space

---

## Out of Scope (Deferred to v1.1)

- Streak freeze feature (for travel/illness)
- Goal reminders/notifications
- Goal templates (presets like "Ramadan month")
- Streak milestones (7-day, 30-day badges)
- Goal history/charts
- Competitive goals (with friends)
- Goal sharing on social media

---

## Dependencies & Prerequisites

### Completed Prerequisites (Epic 1 + Epic 2)
- ✅ React + Vite + TypeScript setup
- ✅ IndexedDB with Dexie.js
- ✅ Zustand stores (zikr, session, goal, UI)
- ✅ Service layer (zikr, session, goal, streak)
- ✅ React Router with HashRouter
- ✅ Core features (zikr management, counter, manual entry)
- ✅ Streak calculation logic (already implemented)
- ✅ Session creation with auto-save

### Required for Epic 3
- None new (builds on Epic 1 + Epic 2)

---

## Timeline & Effort

**Total Stories**: 2
**Total Tasks**: 8
**Estimated Effort**: 15-20 hours

**Story Breakdown**:
- Story 3.1 (Goal Management): 5 tasks, ~12 hours
- Story 3.2 (Streak Visualization): 3 tasks, ~8 hours

**Critical Path**: 3.1.1 → 3.1.3 → 3.1.5 → 3.2.2

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
- [ ] Dependencies on Epic 1 + Epic 2 verified
- [ ] Technical constraints considered

---

**Status**: ✅ Requirements complete
**Next Phase**: Requirements Review (Phase 1.1)
