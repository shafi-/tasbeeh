# Requirements: Epic 2 - Core Features - Zikrs & Sessions

**Epic**: Epic 2: Core Features - Zikrs & Sessions
**Date**: 2026-06-15
**Status**: Draft
**Dependencies**: Epic 1 (Foundation & Infrastructure) - Complete

---

## Epic Overview

**User Story**: As a user, I want to manage zikrs and track sessions through an interactive counter and manual entry, so that I can maintain my spiritual practice digitally.

**Scope**: This epic delivers the core functionality for zikr practice management:
1. **Zikr Management**: View, add, edit, delete custom zikrs
2. **Tasbeeh Counter**: Interactive counter with haptic feedback and auto-save
3. **Manual Progress Entry**: Log sessions from physical tasbeeh practice

**Constraints**:
- $0/month operational cost (no backend, all local)
- Mobile-first design with thumb-zone interaction
- Offline-first functionality
- English-only v1

---

## Story 2.1: Zikr Management

### User Story
**As a** user  
**I want** to manage my zikr list  
**So that** I can practice what matters to me

### Acceptance Criteria
- [ ] View predefined zikrs (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah)
- [ ] Add custom zikrs with name validation
- [ ] Edit and delete custom zikrs
- [ ] Predefined zikrs marked as such (read-only)
- [ ] Cascade delete with user confirmation (keep sessions vs delete all)

### Functional Requirements

#### 2.1.1: ZikrList Component
**File**: `src/components/ZikrList.tsx`
**Purpose**: Display all available zikrs with management actions

**Requirements**:
- Load zikrs from zikrStore using liveQuery
- Show predefined zikrs first in fixed order
- Display "custom" badge for user-created zikrs
- Swipe actions for custom zikrs: edit (left), delete (right)
- Empty state: "No zikrs yet - create your first one!"
- Touch targets ≥ 44x44px

**Data Source**: zikrStore (Zikr[])

**Dependencies**: Task 1.3.3 (stores), Task 1.4.1 (routing)

---

#### 2.1.2: AddZikr Modal
**File**: `src/components/AddZikrModal.tsx`
**Purpose**: Allow users to create custom zikrs

**Requirements**:
- Modal with "Add Zikr" title
- Text input field (max 50 characters)
- Character counter: "0/50"
- Save and Cancel buttons
- Validation:
  - Not empty
  - No duplicates (case-insensitive)
  - No special characters (letters, spaces, hyphens only)
- Error messages inline below input
- On save: call zikrService.add(), zikrStore auto-updates
- Loading state during save
- Success feedback: "Zikr added" toast

**Input**: zikr name (string)
**Output**: Creates Zikr entity with custom: true

**Dependencies**: Task 2.1.1

---

#### 2.1.3: Edit Zikr
**File**: `src/components/EditZikrModal.tsx` (or reuse AddZikrModal)
**Purpose**: Allow users to modify custom zikr names

**Requirements**:
- Reuse AddZikrModal with edit mode
- Pre-fill with current zikr name
- Same validation as add
- On save: call zikrService.update()
- Show loading state
- Success feedback: "Zikr updated" toast

**Constraints**: Cannot edit predefined zikrs (custom: false)

**Dependencies**: Task 2.1.2

---

#### 2.1.4: Delete Zikr with Cascade
**File**: `src/components/ZikrList.tsx` (update)
**Purpose**: Handle zikr deletion with related data options

**Requirements**:
- Delete action shows confirmation modal
- Modal title: "Delete Zikr?"
- Modal message: "What should we do with your sessions for this zikr?"
- Two options:
  - **Option A (Recommended)**: "Keep sessions" - Soft-delete zikr (set deletedAt), sessions remain
  - **Option B**: "Delete all" - Remove zikr, sessions, goals, streaks (cascade delete)
- Warning text for Option B: "This will permanently delete all related data"
- Confirm and Cancel buttons
- On confirm: call respective services based on user choice

**Architecture Fix**: Addresses cascade delete concern from architecture review

**Dependencies**: Task 2.1.1

---

#### 2.1.5: Seed Predefined Zikrs
**File**: `src/services/db.ts` (seed function)
**Purpose**: Initialize app with 4 common zikrs

**Requirements**:
- Check if zikrs store is empty on first app open
- If empty, insert predefined zikrs:
  1. SubhanAllah ( Glory be to Allah)
  2. Alhamdulillah (Praise be to Allah)
  3. Allahu Akbar (Allah is Greatest)
  4. La ilaha illallah (There is no god but Allah)
- All have `custom: false`
- Insert as single transaction

**Data**:
```typescript
const predefinedZikrs = [
  { name: "SubhanAllah", custom: false, createdAt: new Date() },
  { name: "Alhamdulillah", custom: false, createdAt: new Date() },
  { name: "Allahu Akbar", custom: false, createdAt: new Date() },
  { name: "La ilaha illallah", custom: false, createdAt: new Date() }
]
```

**Dependencies**: Task 1.2.1 (database setup)

---

## Story 2.2: Tasbeeh Counter

### User Story
**As a** user  
**I want** an interactive counter  
**So that** I can track my zikr practice digitally

### Acceptance Criteria
- [ ] Tap anywhere in thumb zone to increment count
- [ ] Haptic feedback on each tap (mobile only)
- [ ] Current zikr shown with selector
- [ ] Long-press (1s) to reset with confirmation
- [ ] Auto-save when target reached OR on app close
- [ ] Counter state restored on app open

### Functional Requirements

#### 2.2.1: Counter Screen Component
**File**: `src/pages/Counter.tsx`
**Purpose**: Main counter interface for digital zikr practice

**Requirements**:
- Full-height screen layout
- **Top Section** (20% height):
  - Zikr selector (horizontal scroll or dropdown)
  - Current zikr name (bold, large text)
- **Middle Section** (50% height):
  - Current count display (huge, centered)
  - Font size: 120px, bold
  - Color: Primary accent
- **Bottom Section** (30% height):
  - Tap area = entire lower half (thumb zone)
  - Min-height: 200px
  - Visual feedback on tap (scale animation)
  - Text hint: "Tap to count"
- State persisted in sessionStore (current session)
- Empty state: "Select a zikr to begin"

**Data Source**: sessionStore (current session count), zikrStore (zikr list)

**Requirements Fix**: Uses device local time for all date calculations

**Dependencies**: Task 1.3.3 (stores), Task 1.4.1 (routing)

---

#### 2.2.2: Haptic Feedback
**File**: `src/hooks/useHaptic.ts`
**Purpose**: Provide vibration feedback on mobile devices

**Requirements**:
- Custom hook: `useHaptic()`
- Returns `triggerHaptic()` function
- Uses `navigator.vibrate()` API
- Short pulse: `vibrate(10)` (10ms vibration)
- Gracefully fails if not supported (try-catch)
- Call on each counter tap
- Desktop fallback: silent (no error)

**Implementation**:
```typescript
export function useHaptic() {
  const triggerHaptic = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (error) {
      // Silent fail on unsupported devices
    }
  }, []);
  
  return { triggerHaptic };
}
```

**Dependencies**: Task 2.2.1

---

#### 2.2.3: Auto-Save Session
**File**: `src/pages/Counter.tsx` (update)
**Purpose**: Automatically save sessions at appropriate times

**Requirements**:
- **Save Trigger A**: Count reaches common targets (33, 100)
  - Show brief toast: "Session saved: 33 dhikr"
  - Create session with source: 'app'
  - Reset counter to 0 after save
  - Update streak automatically
- **Save Trigger B**: App closes (window 'blur' event)
  - Save current count (even if not at target)
  - Create session with source: 'app'
  - Clear current count from sessionStore
- Use useEffect with window 'blur' event listener
- Cleanup event listener on unmount
- Store session in IndexedDB via sessionService

**Requirements Clarification**: Both triggers implemented (target reached OR app close)

**Dependencies**: Task 1.3.2 (services), Task 2.2.1

---

#### 2.2.4: Long-Press Reset
**File**: `src/pages/Counter.tsx` (update)
**Purpose**: Allow users to reset counter to 0

**Requirements**:
- Long-press detection: 1 second hold
- Use `onLongPress` pattern or custom timer
- Show confirmation modal: "Reset counter to 0?"
- Modal text: "Your current count will be lost. Continue?"
- Confirm and Cancel buttons
- On confirm: reset current session count to 0
- On cancel: return to counter
- Does NOT affect already-saved sessions
- Visual feedback during long-press (progress indicator)

**Constraints**: Only resets current session, not saved sessions

**Dependencies**: Task 2.2.1

---

#### 2.2.5: Restore Counter State
**File**: `src/pages/Counter.tsx` (update)
**Purpose**: Restore unsaved counter count on app open

**Requirements**:
- Store current count in uiStore (persists in localStorage)
- Update store on every tap increment
- On component mount: restore count from uiStore
- After session saved: clear uiStore count
- Fallback: if no saved state, start at 0
- Handle edge case: unsaved count > 0 from previous session

**Data Store**: uiStore (UI state persists in localStorage)

**Dependencies**: Task 2.2.3

---

## Story 2.3: Manual Progress Entry

### User Story
**As a** user  
**I want** to log sessions done with physical tasbeeh  
**So that** all my practice is tracked

### Acceptance Criteria
- [ ] Add session with count and date/time
- [ ] Default to current date/time
- [ ] Source marked as 'manual'
- [ ] Quick-add pattern deferred to v1.1

### Functional Requirements

#### 2.3.1: Manual Entry Modal
**File**: `src/components/ManualEntryModal.tsx`
**Purpose**: Allow users to manually log sessions from physical tasbeeh

**Requirements**:
- Modal with "Log Session" title
- **Fields**:
  - Zikr dropdown (filtered to active zikrs, excludes deletedAt)
  - Count input (number type, min: 1, max: 10000)
  - Date picker (default: today)
  - Time picker (default: now)
- Save and Cancel buttons
- Validation:
  - Zikr required
  - Count required, > 0
  - Date/time required
- Error messages inline
- Loading state during save
- Success feedback: "Session logged" toast

**Input**: zikrId, count, date, time
**Output**: Creates Session entity with source: 'manual'

**Requirements Note**: Quick-add buttons (33, 100) deferred to v1.1

**Dependencies**: Task 1.3.3 (stores)

---

#### 2.3.2: Manual Session Save
**File**: `src/components/ManualEntryModal.tsx` (update)
**Purpose**: Handle manual session creation

**Requirements**:
- On save: call sessionService.add()
- Include date in YYYY-MM-DD format for efficient queries
- Include timestamp combining date + time
- Use device local time (no timezone conversion)
- Set source: 'manual'
- Update streak after save via streakService
- Update goal progress if applicable
- Show loading state
- Success: "Session logged" toast + close modal
- Error: inline error message + keep form data

**Requirements Clarification**: Timezone handled as local time consistently

**Dependencies**: Task 1.3.2 (services), Task 2.3.1

---

#### 2.3.3: Empty Zikr List Handling
**File**: `src/components/ManualEntryModal.tsx` (update)
**Purpose**: Handle case where no zikrs exist

**Requirements**:
- On mount: check zikrStore for active zikrs
- If empty:
  - Show message: "Create a zikr first"
  - Show button: "Go to Zikrs"
  - Disable form interactions
  - Link to zikr creation screen
- If zikrs exist later (liveQuery):
  - Auto-enable form
  - Remove empty state message

**Edge Case**: User attempts manual entry before creating any zikrs

**Dependencies**: Task 2.3.1

---

## Technical Requirements

### Performance
- Counter tap response < 100ms (instant feedback)
- Haptic feedback < 50ms latency
- Session save < 500ms
- UI updates 60fps during animations

### Accessibility
- All touch targets ≥ 44x44px
- Counter tap area: entire lower half (thumb zone)
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for feedback

### Data Integrity
- Sessions never lost (auto-save on app close)
- Counter state restored across app restarts
- Streak updates atomic with session save
- No race conditions between saves

### Offline Functionality
- All features work offline
- No network calls in any flow
- Data persists locally only

### Error Handling
- IndexedDB quota exceeded: user notification
- Invalid zikr name: inline validation
- Session save failure: retry with user notification
- Database error: show FallbackBanner (from Epic 1)

---

## Integration Points

### Within Epic 2
- **Story 2.1 → Story 2.2**: ZikrList provides zikr selector for Counter
- **Story 2.1 → Story 2.3**: ZikrList provides zikr dropdown for Manual Entry
- **Story 2.2 → Story 2.3**: Both create sessions (different sources)

### With Epic 1 (Foundation)
- Uses zikrStore, sessionStore from Task 1.3
- Uses zikrService, sessionService, streakService from Task 1.3
- Uses Navigation component from Task 1.4
- Uses HashRouter from Task 1.4

### With Epic 3 (Goals & Streaks) - Future
- Sessions update goal progress (Task 3.1)
- Sessions update streaks (Task 3.2)

---

## Success Criteria

### Functional
- [ ] User can view and manage zikrs (predefined + custom)
- [ ] User can practice with digital counter (tap, haptic, auto-save)
- [ ] User can log sessions from physical tasbeeh
- [ ] Data persists across app restarts
- [ ] Streaks update automatically on session save

### User Experience
- [ ] Counter feels responsive (< 100ms tap response)
- [ ] Haptic feedback works on mobile (silent fail on desktop)
- [ ] Zikr management is intuitive (clear badges, swipe actions)
- [ ] Manual entry is quick (< 30 seconds to log session)

### Technical
- [ ] All operations work offline
- [ ] No data loss scenarios (auto-save on app close)
- [ ] Performance targets met (< 100ms response, 60fps animations)
- [ ] Accessibility standards met (44x44px targets, ARIA labels)

---

## Edge Cases & Considerations

### Edge Cases
1. **Empty zikr list**: Counter shows "Select a zikr to begin"
2. **All zikrs deleted**: Show recovery message + link to create zikr
3. **Count > 10,000**: Validation prevents unrealistically high counts
4. **App force-close**: Auto-save on 'blur' catches most cases
5. **Concurrent saves**: IndexedDB transactions handle race conditions
6. **Timezone change**: All times stored as local, no conversion needed

### Considerations
- **Predefined zikrs**: Cannot be edited/deleted (custom: false)
- **Cascade delete**: User chooses (keep sessions vs delete all)
- **Haptic feedback**: Graceful degradation on unsupported devices
- **Auto-save timing**: Balance between catching progress vs not disrupting flow
- **Counter state restore**: Only for unsaved counts (saved sessions persist)

---

## Out of Scope (Deferred to v1.1)

- Quick-add buttons (33, 100) for manual entry
- Bulk session entry
- Session edit/delete (Story 6.5)
- Session history view (Story 6.4)
- Advanced goal tracking
- Reminders/notifications
- Analytics and insights

---

## Dependencies & Prerequisites

### Completed Prerequisites (Epic 1)
- ✅ React + Vite + TypeScript setup
- ✅ IndexedDB with Dexie.js
- ✅ Zustand stores (zikr, session, goal, UI)
- ✅ Service layer (zikr, session, goal, streak)
- ✅ React Router with HashRouter
- ✅ Navigation component
- ✅ Error recovery and error boundaries

### Required for Epic 2
- None new (builds on Epic 1 foundation)

---

## Timeline & Effort

**Total Stories**: 3
**Total Tasks**: 13
**Estimated Effort**: 20-30 hours

**Story Breakdown**:
- Story 2.1 (Zikr Management): 5 tasks, ~10 hours
- Story 2.2 (Tasbeeh Counter): 5 tasks, ~12 hours  
- Story 2.3 (Manual Entry): 3 tasks, ~8 hours

**Critical Path**: 2.1.1 → 2.1.5 → 2.2.1 → 2.2.5

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
- [ ] Dependencies on Epic 1 verified
- [ ] Technical constraints considered

---

**Status**: ✅ Requirements complete
**Next Phase**: Requirements Review (Phase 1.1)