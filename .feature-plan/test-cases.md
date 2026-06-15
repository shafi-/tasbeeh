# Artifact: Test Cases

## Metadata
- **Type**: test-cases
- **Status**: complete
- **Feature**: Manual Progress Entry for Physical Tasbeeh
- **Related Files**: TBD (after QA implementation)
- **Next**: task-synthesis
- **Date**: 2026-06-15

---

## Test Coverage Summary

- **Happy Path Tests**: 12
- **Edge Case Tests**: 15
- **Error State Tests**: 8
- **Integration Tests**: 6
- **Security Tests**: 3
- **Performance Tests**: 4
- **Accessibility Tests**: 4
- **Total**: 52 test cases

---

## Happy Path Tests

### TC-H001: Single session entry with defaults
- **Given**: User has created at least one zikr (e.g., "SubhanAllah")
- **When**: User opens "Add Session" screen, selects zikr, enters count "33", taps Save
- **Then**: Session saved with current date/time, source='manual', session appears in history
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-1, SC-1

### TC-H002: Single session entry with past date
- **Given**: User is on "Add Session" screen
- **When**: User selects "Yesterday" preset, enters count "100", taps Save
- **Then**: Session saved with yesterday's date and appropriate time
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-1

### TC-H003: Single session entry with custom date/time
- **Given**: User is on "Add Session" screen
- **When**: User opens full date-time picker, selects "June 10, 2026 at 7:30 AM", enters count "33", saves
- **Then**: Session saved with exact specified date/time
- **Priority**: P1
- **Type**: Functional
- **Acceptance Criteria**: FR-1

### TC-H004: Multi-Zikr bulk entry (5 sessions)
- **Given**: User is on "Add Session" screen, switches to bulk mode
- **When**: User selects "Multi-Zikr" mode, adds 5 rows with different zikrs and counts, saves
- **Then**: All 5 sessions saved in single transaction, all appear in history
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-2, SC-2

### TC-H005: Quick Repeat bulk entry (10 sessions)
- **Given**: User is on "Add Session" screen in bulk mode
- **When**: User selects "Quick Repeat" mode, chooses "SubhanAllah", adds 10 count rows (33, 33, 34, etc.), saves
- **Then**: All 10 sessions for same zikr saved efficiently
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-2, SC-2

### TC-H006: Smart defaults pre-fill last count
- **Given**: User previously entered "SubhanAllah" with count "100"
- **When**: User opens "Add Session", selects "SubhanAllah"
- **Then**: Count field pre-filled with "100" (or empty if no previous entry)
- **Priority**: P1
- **Type**: Functional
- **Acceptance Criteria**: FR-5

### TC-H007: Session history displays with source badges
- **Given**: User has sessions from app counter, manual entry, and physical tasbeeh
- **When**: User views session history
- **Then**: Each session shows appropriate badge: "App" 📱, "Manual" ✏️, "Physical" 📿
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-3, SC-3

### TC-H008: Sessions grouped by date
- **Given**: User has sessions across multiple dates
- **When**: User views session history
- **Then**: Sessions grouped under date headers (Today, Yesterday, June 13, etc.)
- **Priority**: P1
- **Type**: Functional
- **Acceptance Criteria**: FR-3

### TC-H009: Edit session within 3-day window
- **Given**: User created a session 2 days ago
- **When**: User taps Edit button on that session, modifies count from 33 to 100, saves
- **Then**: Session updated, goal and streak recalculated
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-4, SC-4

### TC-H010: Delete session with confirmation
- **Given**: User has session from yesterday
- **When**: User taps Delete, confirms in dialog
- **Then**: Session removed, goals and streaks updated
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-4

### TC-H011: Add row in bulk mode
- **Given**: User is in Multi-Zikr bulk mode with 1 row
- **When**: User taps "Add Another Session" button
- **Then**: New row appears below with empty zikr, count, and current timestamp
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-2

### TC-H012: Remove row in bulk mode
- **Given**: User is in bulk mode with 3 rows
- **When**: User taps remove button on second row
- **Then**: Second row removed, remaining rows maintain order
- **Priority**: P0
- **Type**: Functional
- **Acceptance Criteria**: FR-2

---

## Edge Case Tests

### TC-E001: Empty count field validation
- **Given**: User is adding a session
- **When**: User leaves count field empty and taps Save
- **Then**: Error message "Count is required" shown, Save button disabled
- **Priority**: P0
- **Type**: Edge Case
- **Acceptance Criteria**: FR-6

### TC-E002: Zero count rejected
- **Given**: User is on "Add Session" screen
- **When**: User enters count "0"
- **Then**: Inline error "Count must be at least 1" shown
- **Priority**: P0
- **Type**: Edge Case
- **Acceptance Criteria**: FR-6

### TC-E003: Negative count rejected
- **Given**: User is on "Add Session" screen
- **When**: User enters count "-10"
- **Then**: Inline error "Count must be a positive number" shown
- **Priority**: P0
- **Type**: Edge Case
- **Acceptance Criteria**: FR-6

### TC-E004: No zikrs available - redirect
- **Given**: User has deleted all zikrs
- **When**: User attempts to open "Add Session"
- **Then**: Message "Create a zikr first" shown with button to zikr creation
- **Priority**: P1
- **Type**: Edge Case
- **Acceptance Criteria**: SC-9

### TC-E005: Bulk entry with mix of valid and invalid rows
- **Given**: User is in Multi-Zikr bulk mode with 5 rows
- **When**: Row 1 is valid (zikr + count), Row 2 missing count, Row 3 valid, Row 4 missing zikr, Row 5 valid
- **Then**: Error icons on invalid rows (2, 4), message "Fix errors before saving", Save disabled
- **Priority**: P0
- **Type**: Edge Case
- **Acceptance Criteria**: FR-6

### TC-E006: 3-day edit window boundary
- **Given**: User has session from exactly 3 days ago at 10:00 AM
- **When**: Current time is 10:01 AM (3 days + 1 minute later)
- **Then**: Edit/Delete buttons not shown or disabled
- **Priority**: P0
- **Type**: Edge Case
- **Acceptance Criteria**: FR-4, SC-8

### TC-E007: Session from deleted zikr displays gracefully
- **Given**: User has sessions for "CustomZikr" which was later deleted
- **When**: User views session history
- **Then**: Session shows zikr name "CustomZikr (deleted)" with appropriate styling
- **Priority**: P1
- **Type**: Edge Case
- **Acceptance Criteria**: SC-7

### TC-E008: Very large count (10,000)
- **Given**: User is on "Add Session" screen
- **When**: User enters count "10000"
- **Then**: Input accepts value, session saves successfully
- **Priority**: P2
- **Type**: Edge Case

### TC-E009: Bulk entry - single row behaves like single mode
- **Given**: User is in Multi-Zikr bulk mode
- **When**: User has only 1 row and taps Save
- **Then**: Saves like single session (no bulk overhead)
- **Priority**: P1
- **Type**: Edge Case

### TC-E010: Day boundary session
- **Given**: User adds session for yesterday at 11:59 PM
- **When**: Session saved and viewed in history
- **Then**: Session appears under yesterday's date group
- **Priority**: P1
- **Type**: Edge Case
- **Acceptance Criteria**: SC-2

### TC-E011: Future date time
- **Given**: User is on "Add Session" screen
- **When**: User selects date/time 1 hour in future
- **Then**: Warning "This session is in the future" shown, but save allowed
- **Priority**: P2
- **Type**: Edge Case

### TC-E012: Maximum rows in bulk mode
- **Given**: User is adding rows in bulk mode
- **When**: User reaches 50 rows
- **Then**: "Add Another" button shows message "For larger batches, consider export/import" (future feature)
- **Priority**: P2
- **Type**: Edge Case

### TC-E013: Quick Repeat with single zikr
- **Given**: User has only one zikr defined
- **When**: User enters Quick Repeat bulk mode
- **Then**: Zikr selector auto-filled, no zikr selection UI shown (simplified)
- **Priority**: P1
- **Type**: Edge Case

### TC-E014: Very long zikr name in history
- **Given**: User has zikr with 50-character name
- **When**: Session appears in history list
- **Then**: Zikr name truncated with ellipsis, full name shown on tap/long-press
- **Priority**: P2
- **Type**: Edge Case

### TC-E015: Cancel after partial data entry
- **Given**: User is in bulk mode with 3 rows partially filled
- **When**: User taps Cancel button
- **Then**: Confirmation "Discard unsaved sessions?" shown, on confirm form closes
- **Priority**: P1
- **Type**: Edge Case

---

## Error State Tests

### TC-ERR001: IndexedDB quota exceeded
- **Given**: User's IndexedDB is near quota limit
- **When**: User attempts to save large bulk entry
- **Then**: Error "Storage full - delete old sessions or clear browser data" shown
- **Priority**: P1
- **Type**: Error State

### TC-ERR002: Bulk save partial failure
- **Given**: User is saving 20 sessions in bulk
- **When**: Sessions 1-15 save successfully, 16-20 fail due to unexpected error
- **Then**: Success message "15 of 20 sessions saved" with option to retry failed ones
- **Priority**: P0
- **Type**: Error State

### TC-ERR003: Progressive save interruption - user closes app
- **Given**: User is saving 100 sessions with progressive chunking
- **When**: User closes app after 40 sessions saved
- **Then**: On next app open, "Resume save? 60 sessions remaining" prompt shown
- **Priority**: P1
- **Type**: Error State
- **Acceptance Criteria**: SC-9

### TC-ERR004: Progressive save - resume after cancellation
- **Given**: User has interrupted progressive save with state saved
- **When**: User opens "Add Session" again and chooses "Resume"
- **Then**: Remaining sessions continue saving from last checkpoint
- **Priority**: P1
- **Type**: Error State

### TC-ERR005: Network offline (PWA scenario)
- **Given**: User is offline (no network connection)
- **When**: User adds sessions and views history
- **Then**: All operations work normally (no network dependency)
- **Priority**: P0
- **Type**: Error State
- **Acceptance Criteria**: SC-5

### TC-ERR006: Edit session after 3-day window - attempt
- **Given**: User has session from 10 days ago
- **When**: User attempts to edit (if button shown somehow)
- **Then**: Error "This session can no longer be edited (older than 3 days)" shown
- **Priority**: P0
- **Type**: Error State
- **Acceptance Criteria**: FR-4

### TC-ERR007: Corrupted session data recovery
- **Given**: IndexedDB has corrupted session record
- **When**: Session history is loaded
- **Then**: Corrupted sessions skipped with console warning, valid sessions shown
- **Priority**: P2
- **Type**: Error State

### TC-ERR008: Transaction rollback on validation error
- **Given**: User is saving bulk sessions where one has invalid count
- **When**: Validation catches error mid-transaction
- **Then**: Entire transaction rolled back, no partial save, specific error shown
- **Priority**: P0
- **Type**: Error State

---

## Integration Tests

### TC-INT001: Manual entry updates goal progress
- **Given**: User has active goal: "SubhanAllah - 100 daily", current progress 33
- **When**: User adds manual session: SubhanAllah, count 67
- **Then**: Goal progress updates to 100/100, goal marked complete
- **Priority**: P0
- **Type**: Integration
- **Acceptance Criteria**: FR-1, SC-6

### TC-INT002: Manual entry updates streak
- **Given**: User's current streak is 5 days, last session was yesterday
- **When**: User adds manual session for today
- **Then**: Streak updates to 6 days
- **Priority**: P0
- **Type**: Integration
- **Acceptance Criteria**: FR-1, SC-6

### TC-INT003: Edit session recalculates goals
- **Given**: User has session from 2 days ago with count 33, goal progress affected
- **When**: User edits session to count 100
- **Then**: Goal progress for that date recalculated and updated
- **Priority**: P0
- **Type**: Integration
- **Acceptance Criteria**: FR-4, SC-6

### TC-INT004: Delete session updates streak
- **Given**: User has streak of 7 days based on daily sessions
- **When**: User deletes session from 3 days ago
- **Then**: Streak recalculated (may break if that day had no other sessions)
- **Priority**: P0
- **Type**: Integration
- **Acceptance Criteria**: FR-4, SC-6

### TC-INT005: Last count stored in settings
- **Given**: User adds session with count 100 for "SubhanAllah"
- **When**: User opens "Add Session" again, selects "SubhanAllah"
- **Then**: Count field pre-filled with 100
- **Priority**: P1
- **Type**: Integration
- **Acceptance Criteria**: FR-5

### TC-INT006: All three sources in history together
- **Given**: User has sessions from app counter, manual entry, and explicitly marked "physical"
- **When**: User views history list
- **Then**: All sessions shown chronologically with distinct badges
- **Priority**: P0
- **Type**: Integration
- **Acceptance Criteria**: FR-3

---

## Security Tests

### TC-SEC001: Input sanitization - count field
- **Given**: User is on "Add Session" screen
- **When**: User enters count with HTML/JavaScript: "<script>alert('xss')</script>"
- **Then**: Input sanitized, stored as number or rejected, no XSS execution
- **Priority**: P0
- **Type**: Security

### TC-SEC002: IndexedDB injection protection
- **Given**: User enters specially crafted input
- **When**: Data stored to IndexedDB
- **Then**: No injection possible, all data properly typed/escaped
- **Priority**: P0
- **Type**: Security

### TC-SEC003: No data exfiltration (offline-only)
- **Given**: User adds sessions
- **When**: Network traffic monitored
- **Then**: No HTTP requests made during session operations (all local)
- **Priority**: P0
- **Type**: Security
- **Acceptance Criteria**: FR-1

---

## Performance Tests

### TC-PERF001: Form opens within 300ms
- **Given**: User taps "Add Session" button
- **When**: Form renders
- **Then**: Time to interactive < 300ms on mid-range mobile device
- **Priority**: P1
- **Type**: Performance
- **Acceptance Criteria**: NFR-P1

### TC-PERF002: Real-time validation within 50ms
- **Given**: User is typing in count field
- **When**: User enters each character
- **Then**: Validation feedback appears within 50ms (no perceived lag)
- **Priority**: P1
- **Type**: Performance
- **Acceptance Criteria**: NFR-P2

### TC-PERF003: Bulk save of 10 sessions within 500ms
- **Given**: User saves 10 sessions in bulk mode
- **When**: Save operation executes
- **Then**: Complete within 500ms including IndexedDB transaction
- **Priority**: P1
- **Type**: Performance
- **Acceptance Criteria**: NFR-P3

### TC-PERF004: Progressive save for 100+ sessions
- **Given**: User initiates bulk save of 100 sessions
- **When**: Progressive save executes
- **Then**: UI remains responsive, progress updates every 10 sessions, completes in < 5 seconds
- **Priority**: P1
- **Type**: Performance
- **Acceptance Criteria**: FR-2, SC-6

---

## Accessibility Tests

### TC-ACC001: Form inputs properly labeled
- **Given**: User using screen reader
- **When**: User focuses on zikr selector
- **Then**: Screen reader announces "Select zikr, choose from your zikr list"
- **Priority**: P0
- **Type**: Accessibility
- **Acceptance Criteria**: UI/UX-5

### TC-ACC002: Error messages announced
- **Given**: User using screen reader submits form with errors
- **When**: Form validation fails
- **Then**: Screen reader announces "Form has errors, Count is required"
- **Priority**: P0
- **Type**: Accessibility
- **Acceptance Criteria**: UI/UX-5

### TC-ACC003: Touch targets 44x44px minimum
- **Given**: User on mobile device
- **When**: User taps Save, Cancel, Add Row, Remove Row buttons
- **Then**: All touch targets are at least 44x44 pixels
- **Priority**: P1
- **Type**: Accessibility
- **Acceptance Criteria**: UI/UX-5

### TC-ACC004: Keyboard navigation
- **Given**: User using keyboard (desktop/mobile external keyboard)
- **When**: User tabs through form
- **Then**: Logical tab order, all focusable elements reachable, Enter submits
- **Priority**: P1
- **Type**: Accessibility
- **Acceptance Criteria**: UI/UX-5

---

## Dark Mode Tests

### TC-DARK001: Dark mode rendering
- **Given**: User has dark mode enabled
- **When**: User views "Add Session" form and session history
- **Then**: All UI elements render correctly in dark theme, proper contrast
- **Priority**: P1
- **Type**: UI/UX
- **Acceptance Criteria**: UI/UX-6

### TC-DARK002: Theme switch
- **Given**: User is in light mode with form open
- **When**: User switches to dark mode
- **Then**: Form immediately updates to dark theme without visual glitches
- **Priority**: P1
- **Type**: UI/UX

---

## Offline Functionality Tests

### TC-OFF001: Add session while offline
- **Given**: User has no network connection (airplane mode)
- **When**: User adds session and views history
- **Then**: All operations work, session saved to IndexedDB
- **Priority**: P0
- **Type**: Offline
- **Acceptance Criteria**: SC-5

### TC-OFF002: Offline bulk entry
- **Given**: User is offline
- **When**: User adds 20 sessions in bulk mode
- **Then**: All sessions save successfully, history updates correctly
- **Priority**: P0
- **Type**: Offline
- **Acceptance Criteria**: SC-5

---

## Test Coverage Matrix

| Requirement | Test Cases | Coverage |
|-------------|-------------|----------|
| FR-1: Single Session Entry | TC-H001, H002, H003, E001-E004, SEC001, OFF001 | ✅ Complete |
| FR-2: Bulk Session Entry | TC-H004, H005, H011, H012, E005, E009, E012-E015, ERR002, ERR008, PERF004, OFF002 | ✅ Complete |
| FR-3: Session History | TC-H007, H008, E007, E014, INT006 | ✅ Complete |
| FR-4: Edit and Delete | TC-H009, H010, E006, ERR006, INT003, INT004 | ✅ Complete |
| FR-5: Smart Defaults | TC-H006, INT005 | ✅ Complete |
| FR-6: Validation | TC-E001, E002, E003, E005, ERR008 | ✅ Complete |
| Goals Integration | TC-INT001, INT003 | ✅ Complete |
| Streaks Integration | TC-INT002, INT004 | ✅ Complete |
| Security | TC-SEC001, SEC002, SEC003 | ✅ Complete |
| Performance | TC-PERF001-PERF004 | ✅ Complete |
| Accessibility | TC-ACC001-ACC004 | ✅ Complete |
| Offline | TC-OFF001, OFF002 | ✅ Complete |

---

## Success Criteria Mapping

| Success Criteria | Test Cases | Status |
|------------------|-------------|--------|
| SC-1: Single session add | TC-H001-H003 | ✅ |
| SC-2: Bulk entry 10+ sessions | TC-H004, H005 | ✅ |
| SC-3: Source badges display | TC-H007, INT006 | ✅ |
| SC-4: Edit/delete within 3 days | TC-H009, H010, E006 | ✅ |
| SC-5: Smart defaults | TC-H006, INT005 | ✅ |
| SC-6: Validation prevents invalid | TC-E001-E003, E005 | ✅ |
| SC-7: Goals/streaks update | TC-INT001-INT004 | ✅ |
| SC-8: Offline works | TC-OFF001, OFF002 | ✅ |
| SC-9: Dark mode | TC-DARK001, DARK002 | ✅ |
| SC-10: Screen reader | TC-ACC001, ACC002 | ✅ |
| SC-11: Large bulk (50+) | TC-PERF004, ERR003 | ✅ |

---

## Notes for QA Implementation

1. **Test Data Setup**: Create predefined zikrs, some existing sessions, and goals before running tests
2. **Time Manipulation**: Some edge cases (TC-E006) require manipulating system time or using test-specific dates
3. **IndexedDB State**: Clear IndexedDB between test runs for isolation
4. **Progressive Save Testing**: Use browser DevTools to throttle network/CPU for TC-PERF004
5. **Accessibility Testing**: Use screen reader (NVDA/VoiceOver) for ACC001, ACC002
6. **Performance Baseline**: Establish baseline metrics for TC-PERF001-PERF004 before optimization

---

## Next Steps

After test cases are documented:
1. Proceed to Task Synthesis phase (invoke `/task-creator`)
2. Synthesize requirements, architecture, and test cases into executable tasks
3. Output: `docs/Tasks.md`
