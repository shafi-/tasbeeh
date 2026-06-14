# Artifact: Test Cases

## Metadata
- **Type**: test-cases
- **Status**: complete
- **Related Files**: TBD (after QA implementation)
- **Date**: 2026-06-15

---

## Product Review

### Status: APPROVED

### Business Value
Zikr fills three critical gaps in existing tasbeeh apps:
1. **Customization** - Users can practice their preferred dhikr, not pre-selected lists
2. **Offline tracking** - Physical tasbeeh sessions are counted (huge for devoted practitioners)
3. **Personalization** - Goals adapt to individual spiritual journeys

### Success Metrics
- **Retention**: Streak feature drives daily engagement
- **Adoption**: Manual progress entry enables offline use
- **Satisfaction**: Custom zikrs allow personalization

### UX Validation by Feature

#### 1. Custom Zikrs
**Status**: ✅ Intuitive
- Add/Edit/Delete actions are standard CRUD patterns
- Predefined zikrs reduce cold-start problem
- Clear differentiation between custom vs predefined

#### 2. Manual Progress Entry
**Status**: ✅ Clear flow
- Date/time picker with "now" default reduces friction
- Count entry is straightforward (number input)
- Source tracking enables analytics without user burden

**Concern**: ⚠️ Consider adding "quick add" for common counts (33, 100)

#### 3. Tasbeeh Counter
**Status**: ✅ Well-designed
- Tap anywhere in thumb zone is ideal for one-handed use
- Haptic feedback provides tactile confirmation
- Long-press reset prevents accidental resets

**Accessibility**: Ensure tap target is full-screen width, not just a button

#### 4. Goal Setting
**Status**: ✅ Flexible
- Period options (daily/weekly/monthly/custom) cover all use cases
- Per-zikr goals enable granular tracking
- Active/paused/completed states support lifecycle

**Concern**: ⚠️ "Paused" state might confuse users - ensure clear visual distinction

#### 5. Streaks
**Status**: ✅ Critical for retention
- Consecutive day tracking is standard habit pattern
- Current + longest streak provides motivation
- Visual fire icon 🔥 or similar indicator recommended

#### 6. Progress Visualization
**Status**: ⚠️ Needs definition
- "Simple charts" is vague - define what charts in v1
- Recommendation: Daily summary bar + weekly trend line
- Keep it minimal - over-charting overwhelms casual users

#### 7. Reminders
**Status**: ⚠️ Platform limitation
- iOS fallback to in-app center is honest but underwhelming
- Recommendation: Add "snooze" option in in-app center
- Consider vibration pattern as nudge when app opens

---

## Test Cases

### Feature 1: Custom Zikrs

#### TC-ZIKR-001: View zikr list
- **Given**: User has opened the app
- **When**: User navigates to zikr list
- **Then**: Predefined zikrs (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah) are shown
- **Priority**: P0
- **Type**: Functional

#### TC-ZIKR-002: Add custom zikr
- **Given**: User is on zikr list screen
- **When**: User taps "Add Zikr", enters name "Astaghfirullah", confirms
- **Then**: New zikr appears in list marked as "custom"
- **Priority**: P0
- **Type**: Functional

#### TC-ZIKR-003: Edit custom zikr
- **Given**: User has custom zikr "Astaghfirullah"
- **When**: User taps edit, changes name to "Astaghfirullah Rabbi", saves
- **Then**: Zikr name is updated
- **Priority**: P1
- **Type**: Functional

#### TC-ZIKR-004: Delete custom zikr
- **Given**: User has custom zikr
- **When**: User swipes/taps delete, confirms
- **Then**: Zikr is removed from list (soft delete)
- **Priority**: P1
- **Type**: Functional

#### TC-ZIKR-005: Cannot delete predefined zikr
- **Given**: User is viewing predefined zikr
- **When**: User attempts to delete predefined zikr
- **Then**: Delete option is not available OR confirmation warns "This will remove..."
- **Priority**: P2
- **Type**: Functional

#### TC-ZIKR-006: Empty state on zikr list
- **Given**: User has deleted all zikrs
- **When**: User views zikr list
- **Then**: Empty state message "Add your first zikr to get started" shown
- **Priority**: P1
- **Type**: Edge Case

---

### Feature 2: Manual Progress Entry

#### TC-ENTRY-001: Add manual session with defaults
- **Given**: User has created at least one zikr
- **When**: User opens "Add Session" modal, enters "100", confirms
- **Then**: Session saved with today's date, now time, source='manual'
- **Priority**: P0
- **Type**: Functional

#### TC-ENTRY-002: Add session with past date
- **Given**: User is adding manual session
- **When**: User selects yesterday's date, enters "33"
- **Then**: Session saved with yesterday's date
- **Priority**: P1
- **Type**: Functional

#### TC-ENTRY-003: Cancel session entry
- **Given**: User is adding manual session
- **When**: User enters count but taps cancel
- **Then**: Modal closes, no session saved
- **Priority**: P1
- **Type**: Functional

#### TC-ENTRY-004: Invalid count rejected
- **Given**: User is adding manual session
- **When**: User enters negative number "-10" or "0"
- **Then**: Submit button disabled OR error shown
- **Priority**: P1
- **Type**: Error State

#### TC-ENTRY-005: No zikrs available
- **Given**: User has no zikrs
- **When**: User attempts to add manual session
- **Then**: Message "Create a zikr first" shown, redirect to zikr creation
- **Priority**: P1
- **Type**: Edge Case

---

### Feature 3: Tasbeeh Counter

#### TC-COUNTER-001: Tap increments count
- **Given**: User has selected a zikr on counter screen
- **When**: User taps anywhere on counter area
- **Then**: Count increments by 1, haptic feedback triggered
- **Priority**: P0
- **Type**: Functional

#### TC-COUNTER-002: Switch zikr on counter
- **Given**: User is counting "SubhanAllah"
- **When**: User taps zikr selector, chooses "Alhamdulillah"
- **Then**: Counter resets to 0, new zikr shown
- **Priority**: P0
- **Type**: Functional

#### TC-COUNTER-003: Long-press resets counter
- **Given**: User has count of 25
- **When**: User long-presses counter area (1 second)
- **Then**: Confirmation dialog shown, on confirm counter resets to 0
- **Priority**: P0
- **Type**: Functional

#### TC-COUNTER-004: Session auto-saved on counter
- **Given**: User is counting on counter screen
- **When**: User reaches target count (e.g., 33) OR closes app
- **Then**: Session automatically saved to IndexedDB with source='app'
- **Priority**: P0
- **Type**: Integration

#### TC-COUNTER-005: Counter persists across app close
- **Given**: User has count of 15, hasn't reached target
- **When**: User closes and reopens app
- **Then**: Counter shows 15 (not reset)
- **Priority**: P1
- **Type**: Functional

#### TC-COUNTER-006: Tap latency < 50ms
- **Given**: User is tapping counter rapidly
- **When**: User taps 10 times quickly
- **Then**: Each tap responds within 50ms perceived (no lag)
- **Priority**: P1
- **Type**: Performance

#### TC-COUNTER-007: Full-screen tap target
- **Given**: User is on counter screen
- **When**: User taps any area in lower half of screen (thumb zone)
- **Then**: Count increments (not just small button)
- **Priority**: P1
- **Type**: Accessibility

---

### Feature 4: Goal Setting

#### TC-GOAL-001: Create daily goal
- **Given**: User has zikr "SubhanAllah"
- **When**: User creates goal: zikr=SubhanAllah, period=daily, target=100
- **Then**: Goal shown as active, progress bar shows 0/100
- **Priority**: P0
- **Type**: Functional

#### TC-GOAL-002: Create weekly goal
- **Given**: User has zikr
- **When**: User creates goal with period=weekly, target=500
- **Then**: Goal tracks Monday-Sunday (or configurable start day)
- **Priority**: P1
- **Type**: Functional

#### TC-GOAL-003: Create custom date range goal
- **Given**: User has zikr
- **When**: User creates goal with period=custom, start=June 1, end=June 30, target=1000
- **Then**: Goal tracks within date range
- **Priority**: P1
- **Type**: Functional

#### TC-GOAL-004: Pause goal
- **Given**: User has active goal
- **When**: User taps pause
- **Then**: Goal marked as paused, progress frozen
- **Priority**: P1
- **Type**: Functional

#### TC-GOAL-005: Complete goal
- **Given**: User has goal with target 100, current count 100
- **When**: User adds 101st session
- **Then**: Goal marked as completed, celebration shown
- **Priority**: P0
- **Type**: Functional

#### TC-GOAL-006: Multiple goals per zikr
- **Given**: User has zikr "SubhanAllah"
- **When**: User creates daily goal=100 AND monthly goal=3000
- **Then**: Both goals shown, tracked independently
- **Priority**: P2
- **Type**: Edge Case

---

### Feature 5: Streaks

#### TC-STREAK-001: Streak increments with daily practice
- **Given**: User practiced yesterday
- **When**: User practices today
- **Then**: Current streak increments by 1
- **Priority**: P0
- **Type**: Functional

#### TC-STREAK-002: Streak breaks after gap
- **Given**: User has streak of 5 days, last session was 2 days ago
- **When**: User opens app today
- **Then**: Streak shown as 0 (broken), longest streak preserved
- **Priority**: P0
- **Type**: Functional

#### TC-STREAK-003: Same day doesn't increment streak
- **Given**: User already practiced today, streak=5
- **When**: User practices again today (2nd session)
- **Then**: Streak remains 5 (not incremented to 6)
- **Priority**: P0
- **Type**: Functional (addresses architecture review issue)

#### TC-STREAK-004: First practice starts streak
- **Given**: User has never practiced
- **When**: User completes first session
- **Then**: Current streak = 1, longest streak = 1
- **Priority**: P0
- **Type**: Functional

#### TC-STREAK-005: Streak visual indicator
- **Given**: User has streak of 7+ days
- **When**: User views any screen
- **Then**: Fire icon 🔥 or streak badge shown (motivation)
- **Priority**: P1
- **Type**: UX

---

### Feature 6: Progress Visualization

#### TC-PROG-001: Daily summary shows
- **Given**: User has sessions today
- **When**: User opens progress screen
- **Then**: Summary shows: total count today, breakdown by zikr
- **Priority**: P0
- **Type**: Functional

#### TC-PROG-002: Weekly trend chart shows
- **Given**: User has sessions this week
- **When**: User opens progress screen
- **Then**: Bar chart shows daily counts for past 7 days
- **Priority**: P1
- **Type**: Functional

#### TC-PROG-003: Goal progress indication
- **Given**: User has active goal
- **When**: User views progress screen
- **Then**: Progress bar shows % completion for each active goal
- **Priority**: P0
- **Type**: Functional

#### TC-PROG-004: Empty progress state
- **Given**: User has no sessions yet
- **When**: User opens progress screen
- **Then**: Message "Start practicing to see your progress" shown
- **Priority**: P1
- **Type**: Edge Case

---

### Feature 7: Reminders

#### TC-REM-001: Android notification permission
- **Given**: User on Android device
- **When**: User enables reminders
- **Then**: Permission request dialog shown
- **Priority**: P1
- **Type**: Functional

#### TC-REM-002: iOS in-app notification center
- **Given**: User on iOS device
- **When**: User opens app with pending reminder
- **Then**: Notification center shows pending reminders
- **Priority**: P1
- **Type**: Functional

#### TC-REM-003: Transparent iOS limitation
- **Given**: User on iOS device
- **When**: User enables reminders
- **Then**: Message "iOS limits background reminders" shown
- **Priority**: P1
- **Type**: UX

---

### Cross-Feature Integration

#### TC-INT-001: Deleting zikr affects related data
- **Given**: User has zikr with sessions, goals, streaks
- **When**: User deletes zikr
- **Then**: User prompted "Keep sessions or delete all?" - choice honored
- **Priority**: P0
- **Type**: Integration (addresses architecture review issue)

#### TC-INT-002: Goal progress updates with counter
- **Given**: User has active goal for zikr
- **When**: User increments counter for that zikr
- **Then**: Goal progress updates immediately
- **Priority**: P0
- **Type**: Integration

#### TC-INT-003: Manual session updates streak
- **Given**: User adds manual session for yesterday
- **When**: Session saved
- **Then**: Streak recalculated based on new session
- **Priority**: P0
- **Type**: Integration

---

### Performance & Accessibility

#### TC-PERF-001: First paint < 1.5s
- **Given**: User opens app on mobile 4G
- **When**: App loads
- **Then**: First Contentful Paint < 1.5s
- **Priority**: P0
- **Type**: Performance

#### TC-PERF-002: Time to interactive < 3s
- **Given**: User opens app on mobile 4G
- **When**: App loads
- **Then**: Time to Interactive < 3s
- **Priority**: P0
- **Type**: Performance

#### TC-ACC-001: Touch targets 44x44px minimum
- **Given**: User on mobile device
- **When**: User taps any interactive element
- **Then**: Touch target is at least 44x44px
- **Priority**: P1
- **Type**: Accessibility

#### TC-ACC-002: Color contrast 4.5:1
- **Given**: User views any screen
- **When**: User reads text
- **Then**: Color contrast ratio is at least 4.5:1
- **Priority**: P1
- **Type**: Accessibility

#### TC-ACC-003: Screen reader support
- **Given**: User using screen reader
- **When**: User navigates app
- **Then**: All elements have proper ARIA labels
- **Priority**: P1
- **Type**: Accessibility

---

## User Acceptance Criteria for v1

### Must Have (P0)
- [x] User can add, edit, delete custom zikrs
- [x] User can log manual progress entries with date/time
- [x] Counter increments on tap with haptic feedback
- [x] User can set daily/weekly/monthly/custom goals
- [x] Streaks track consecutive days correctly
- [x] Progress visualization shows daily summary
- [x] App works offline (PWA cached)

### Should Have (P1)
- [x] Streak doesn't increment on same-day multiple sessions
- [x] Deleting zikr prompts for related data handling
- [x] Empty states have helpful messages
- [x] Counter persists across app close
- [x] Goal progress updates in real-time
- [x] iOS limitations communicated transparently

### Nice to Have (P2)
- [ ] Quick-add for common manual entry counts (33, 100)
- [ ] Multiple goals per zikr
- [ ] "Paused" goal state visual distinction
- [ ] Weekly trend chart (not just daily summary)

---

## Open Questions for v1.1

1. **Reminder frequency**: Daily at set time vs customizable?
2. **Streak freeze**: Allow pausing for travel/illness?
3. **Analytics detail level**: What charts for progress visualization?
