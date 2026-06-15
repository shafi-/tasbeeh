# Requirements: Manual Progress Entry for Physical Tasbeeh

## Metadata
- **Type**: requirements
- **Status**: complete
- **Next**: architecture

## Overview
Enable users to manually log zikr sessions performed with physical tasbeeh or when offline. This is a core differentiator feature that accommodates users who prefer traditional prayer beads or practice away from their device.

## Objective
Build a manual session entry system that allows users to:
- Add individual or bulk zikr sessions with custom counts and timestamps
- Edit/delete recently entered sessions (within 3 days)
- Track the source of each session (app vs manual vs physical)
- Maintain accurate streak and goal progress with manual entries

## User Stories
- **As a** practitioner who uses a physical tasbeeh, **I want** to log my completed zikr sessions in the app, **so that** my progress and streaks are tracked accurately
- **As a** user who was offline during practice, **I want** to enter past sessions in bulk, **so that** I don't lose track of my progress
- **As a** user who made a mistake, **I want** to edit or delete recent entries, **so that** my records remain accurate

## Functional Requirements

### FR-1: Single Session Entry
- User can select a zikr from their list (predefined or custom)
- User can enter any positive integer count (minimum 1)
- User can select date/time with smart defaults
  - Quick presets: "Now", "Yesterday", "This Morning"
  - Full date-time picker for precision
- Session is saved with `source: 'manual'` in IndexedDB
- Saved session updates goal progress and streak calculations

### FR-2: Bulk Session Entry
- User can add multiple sessions in one form submission
- Each row has: zikr selector, count input, date/time picker
- Real-time validation per row as user types
- User can add/remove rows dynamically
- All valid rows are saved in a single transaction

### FR-3: Session History
- All sessions (app, manual, physical) displayed in chronological order
- Each session shows: zikr name, count, date/time, source badge
- Source badges visually distinguish entry method
- Sessions grouped by date for readability

### FR-4: Edit and Delete (Recent Sessions)
- Users can edit or delete sessions entered within the last 3 days
- After 3 days, sessions become read-only (data integrity)
- Edit: modify count, date/time, or zikr
- Delete: remove session with confirmation
- Changes trigger recalculation of goals and streaks

### FR-5: Smart Defaults
- App remembers last entered count per zikr
- When selecting a zikr, pre-fill count with last used value
- Date/time defaults to "Now" on open
- Reduces friction for repeat entries

### FR-6: Validation
- Minimum count: 1 (positive integers only)
- Required fields: zikr, count, date/time
- Real-time validation with inline error messages
- Bulk entry: validate each row independently
- Prevent save if any row has errors

## Non-Functional Requirements

### Performance
- Form opens within 300ms on mobile
- Real-time validation responds within 50ms
- Bulk save of 10 sessions completes within 500ms
- IndexedDB queries for history within 200ms

### Security
- All data stored locally (IndexedDB)
- No network calls for session operations
- User has full control over their data

### Scalability
- Support unlimited sessions per user
- Efficient IndexedDB indexes for date-based queries
- Pagination or virtual scrolling for large histories

## UI/UX Requirements

### Screen Layout (Mobile-First)
- **Header**: "Add Session" title, close button
- **Form**:
  - Zikr selector (dropdown with search)
  - Count input (large, thumb-friendly)
  - Date/time picker (preset buttons + full picker)
  - Add Another Session button (for bulk)
- **Footer**: Save button (primary), Cancel button

### Bulk Entry Mode
- Multiple session rows stacked vertically
- Each row: zikr | count | date/time | remove button
- "Add Row" button at bottom
- Save button persists all valid rows

### Session History Screen
- List grouped by date
- Each session card shows:
  - Zikr name (bold)
  - Count with label (e.g., "33 dhikr")
  - Time (e.g., "7:30 AM")
  - Source badge (icon + label)
  - Edit/Delete button (if within 3 days)
- Pull to refresh
- Infinite scroll or pagination

### Interactions
- Haptic feedback on successful save
- Confirmation dialog for delete
- Toast notification for save success/error
- Loading state during save operation

### Accessibility
- All form inputs properly labeled
- Error messages announced to screen readers
- Touch targets minimum 44x44px
- Keyboard navigation support
- Color contrast 4.5:1 minimum

### Dark Mode
- Full dark mode support
- Smooth transitions between themes
- High contrast for readability

## Data & Integration

### Data Models
```javascript
// IndexedDB Store: sessions
Session {
  id: string (autoIncrement)
  zikrId: string (foreign key)
  count: number (min: 1)
  source: 'app' | 'manual' | 'physical'
  timestamp: Date
  date: Date (denormalized YYYY-MM-DD)
  editableUntil: Date (timestamp + 3 days)
}
```

### API/Service Layer
- `SessionService.addSession(session)` - Save single session
- `SessionService.addBulkSessions(sessions[])` - Transactional bulk save
- `SessionService.updateSession(id, updates)` - Edit session
- `SessionService.deleteSession(id)` - Remove session
- `SessionService.getSessionsByDateRange(start, end)` - History query
- `SessionService.isEditable(sessionId)` - Check 3-day window

### Integration Points
- **Goal Service**: Recalculate progress on session change
- **Streak Service**: Update streaks on session change
- **Zikr Service**: Fetch user's zikr list for dropdown
- **Settings Service**: Remember last count per zikr

## Impact Analysis

### Affected Features
- Goals: Need to recalculate on manual entry
- Streaks: Need to update on manual entry
- Progress Visualization: Include manual sessions
- Settings: Store per-zikr last count preference

### Breaking Changes
- None (new feature)

### Integration Points
- Session management flow
- Goal progress calculation
- Streak calculation logic

### Migration Required
- No migration (greenfield project)

## Edge Cases to Handle

1. **Timezone changes**: User travels, enters session with different timezone
2. **Day boundary**: Session entered just before midnight
3. **Bulk entry with errors**: Some rows valid, some invalid
4. **Race condition**: User edits while bulk save in progress
5. **Offline behavior**: All operations work offline (IndexedDB)
6. **Large bulk entry**: 50+ sessions in one save
7. **Deleted zikr**: Session references deleted zikr (handle gracefully)
8. **3-day window**: Edit/delete button appears/disappears at boundary

## Success Criteria

- [ ] User can add single session with zikr, count, and date/time
- [ ] User can add 10+ sessions in bulk entry mode
- [ ] Sessions appear in history with correct source badges
- [ ] Edit/delete works within 3 days, disabled after
- [ ] Smart defaults pre-fill with last count per zikr
- [ ] Validation prevents invalid entries with clear messages
- [ ] Goal and streak updates triggered by manual entries
- [ ] All operations work offline
- [ ] Dark mode renders correctly
- [ ] Screen reader can navigate and operate form

## Assumptions & Constraints

**Technical Assumptions:**
- IndexedDB available on target platforms
- Dexie.js handles database operations
- Zustand manages UI state for form

**Business Constraints:**
- $0/month operational cost (no backend sync)
- Bundle size < 200KB gzipped
- Mobile-first design required

**Timeline Considerations:**
- P0 feature for v1 launch
- Depends on: zikr management, database setup
- Blocks: progress visualization, goals tracking
