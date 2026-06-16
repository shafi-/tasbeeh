# Artifact: Requirements

## Metadata
- **Type**: requirements
- **Status**: complete
- **Feature**: Epic 6: Advanced Manual Progress Entry
- **Next**: architecture
- **Created**: 2026-06-16

## Overview

Epic 6 establishes comprehensive manual session entry functionality for the Zikr PWA. This epic enhances and replaces the basic Story 2.3 manual entry with full-featured session management including bulk entry modes, session history with edit/delete capabilities, progressive save for large batches, and intelligent data management.

**Key Differentiators:**
- **3-day edit window** for session correction (view-only after expiry)
- **Bulk entry modes** (Multi-Zikr and Quick Repeat) for efficient data entry
- **Session history** with edit/delete, grouped by time periods
- **Progressive save** for large batches with automatic chunking
- **Smart defaults** (last count per zikr) for rapid entry
- **Data safety** features (export/import, local-only processing)

**User Stories:**
- **As a** devoted practitioner, **I want** bulk session entry modes, **so that** I can efficiently log multiple sessions from mosque attendance
- **As a** casual practitioner, **I want** to correct mistakes in my sessions, **so that** my records are accurate and meaningful
- **As a** user, **I want** to view my session history, **so that** I can review my spiritual progress over time
- **As a** user, **I want** smart defaults and auto-save, **so that** data entry is fast and reliable

## Requirements

### Objective

Implement a comprehensive manual session entry system that enhances the basic manual entry with bulk modes, session history with edit/delete capabilities, progressive save for large batches, and intelligent data management while maintaining $0/month operational cost and offline-first architecture.

### Functional Requirements

#### Story 6.1: Database Schema v2 Enhancement

**FR-1.1: Schema Version 2 Implementation**
- Update IndexedDB schema from version 1 to version 2
- Add `editableUntil` field to sessions store (indexed, calculated as timestamp + 3 days)
- Add `createdAt` and `updatedAt` timestamps to sessions store
- Ensure `source` field exists and properly typed ('app'|'manual'|'physical')
- Add `sessionFormState` store for progressive save state management
- Add `zikrLastCount` store for smart defaults (last count per zikr)
- Add index on `editableUntil` for efficient edit window queries
- Keep existing `date` index for time-based queries

**FR-1.2: Data Migration v1 to v2**
- Implement blocking migration on app open with progress indicator
- Calculate `editableUntil` for existing sessions as (createdAt + 3 days)
- Set `source = 'app'` for existing sessions (default for counter sessions)
- Add `createdAt` and `updatedAt` timestamps to existing sessions
- Use `createdAt` from existing timestamp field if available
- Handle migration errors gracefully with per-session try-catch
- Show migration progress bar for databases with many sessions
- Block UI until migration completes (blocking migration per requirements)

**FR-1.3: TypeScript Interface Definitions**
- Create `Session` interface with all v2 fields
- Create `SessionInput` interface for create operations (zikrId, count, timestamp)
- Create `SessionUpdate` interface for edit operations (partial fields)
- Create `SessionRow` interface for form state management
- Create `BulkResult` interface with success/failed/errors/stateId fields
- Export all interfaces from barrel file
- Ensure type safety across session management system

#### Story 6.2: Session Service Layer

**FR-2.1: Enhanced SessionService.addSession**
- Accept `SessionInput` (zikrId, count, timestamp)
- Calculate `editableUntil = timestamp + 3 days`
- Set `source = 'manual'` for manual entry sessions
- Add `createdAt` and `updatedAt` timestamps
- Store session in IndexedDB
- Trigger `GoalProgressService.recalculateForSession()` after save
- Trigger `StreakService.updateForSession()` after save
- Store last count in `zikrLastCount` store (smart defaults)
- Return created session with id
- Use Dexie transaction for atomicity

**FR-2.2: SessionService.addBulkSessions**
- Accept array of `SessionInput[]`
- Validate all sessions before save (skip invalid, continue per requirements)
- Save valid sessions in single IndexedDB transaction
- Return `BulkResult` with success count, failed count, errors array, stateId
- On partial failure: save valid sessions, report invalid ones with details
- Use transaction rollback on validation error (all or nothing for validation)
- Support progressive save for large batches (50+ sessions)
- Maintain data integrity (no orphaned records)

**FR-2.3: SessionService.updateSession**
- Accept session id and `SessionUpdate` (partial fields)
- Validate `isEditable()` before update (3-day window check)
- Update `updatedAt` timestamp on every edit
- Allow updating count, zikrId, or timestamp fields
- Recalculate goals and streaks after update
- Return updated session
- Handle missing session gracefully (return undefined)
- Maintain audit trail through updatedAt field

**FR-2.4: SessionService.deleteSession**
- Accept session id for deletion
- Validate `isEditable()` before delete (3-day window check)
- Remove session from IndexedDB
- Recalculate goals and streaks after deletion
- Consider soft delete for analytics (mark as deleted with timestamp)
- Handle missing session gracefully
- Return success/failure status

**FR-2.5: SessionService.isEditable**
- Accept session id or Session object
- Return true if `now < editableUntil` (within 3-day window)
- Return false if window expired
- Async for consistency with other service methods
- Handle missing session gracefully (return false)
- Used by UI to show/hide edit and delete buttons

**FR-2.6: SessionService.getSessionsByDateRange**
- Accept start and end Date objects
- Query sessions using `date` index with Dexie's `between()` 
- Return array sorted by timestamp descending (newest first)
- Support open-ended ranges (null end date for "all future sessions")
- Include sessions from all sources (app, manual, physical)
- Efficient query performance using indexes

**FR-2.7: SessionValidationService Implementation**
- `validateCount(value)`: min 1, positive integer only, max 10000
- `validateDateTime(value)`: not null, valid Date object, not in future (warning only)
- `validateRow(row)`: combines count and datetime validation
- All validation < 50ms performance target (real-time validation)
- Synchronous execution for immediate UI feedback
- Return error messages or null for valid input

**FR-2.8: ProgressiveSaveService.saveInChunks**
- Accept array of sessions and progress callback
- Chunk into batches of 10 sessions per chunk (CHUNK_SIZE = 10)
- Save state to `sessionFormState` store for resume capability
- Call progress callback after each chunk completion
- Yield to UI thread with setTimeout(0) between chunks (prevent UI freeze)
- Clean up state on completion
- Return `BulkResult` with stateId for interrupted saves
- Always use progressive save for bulk operations (per requirements)
- Show minimal progress bar during save operation

**FR-2.9: ProgressiveSaveService.resumeInterruptedSave**
- Accept stateId from interrupted save operation
- Load `sessionFormState` from IndexedDB
- Continue save from currentIndex (not from beginning)
- Clean up state on completion
- Return final `BulkResult` with completion status
- Check state exists before resume (return error if missing)
- Allow users to discard interrupted save and start fresh

#### Story 6.3: Session Entry UI

**FR-3.1: sessionFormStore Implementation**
- Create Zustand store with mode (single/bulk), bulkMode (multi-zikr/quick-repeat)
- State includes: rows array, isSaving flag, saveProgress, errors
- Actions: setMode, setBulkMode, addRow, removeRow, updateRow, setSaving, setSaveProgress, reset
- Initial row: `{zikrId: '', count: 0, timestamp: new Date()}` (type fixed per architecture review)
- Auto-save to localStorage every 30 seconds for error recovery
- Support 50+ rows without performance issues
- Reset form on successful save

**FR-3.2: SessionEntryForm Container Component**
- Header with "Add Session" title and close button
- Mode toggle between single and bulk entry
- Bulk mode toggle: Multi-Zikr vs Quick Repeat
- Show loading state during save with minimal progress bar
- Handle success/error toasts with helpful messages
- Reset form on successful save
- Auto-save form state to localStorage (error recovery)
- Mobile-first design with 300ms load target
- 44x44px minimum touch targets for accessibility

**FR-3.3: SessionRow Component**
- Zikr dropdown with search capability (for many zikrs)
- Count input (number type, min=1, max=10000, 44x44px touch target)
- Date/time picker with presets (Now, Yesterday, This Morning)
- Full date-time picker option for precise control
- Remove button (bulk mode only) with 44x44px touch target
- Real-time validation with inline error messages
- ARIA labels for all interactive elements (WCAG 2.1 AA)
- Support keyboard navigation (Enter to save, Escape to cancel)
- Dark mode support with sufficient color contrast

**FR-3.4: Smart Defaults Implementation**
- On zikr selection, query `zikrLastCount` store
- Pre-fill count field with last used value for that zikr
- Fall back to empty if no previous entry exists
- Update last count after successful session save
- Async query with loading state indication
- Improve data entry speed for frequent practitioners

**FR-3.5: Empty Zikr List Handling**
- Show "Create a zikr first" message if zikr list empty
- Provide button to navigate to zikr creation screen
- Disable form interactions when no zikrs available
- Helpful error message explains why entry is blocked
- Link to zikr management with clear call-to-action

**FR-3.6: Multi-Zikr Bulk Mode**
- Mode toggle: single vs bulk entry
- Multiple SessionRow components rendered dynamically
- "Add Another Session" button adds new row
- Each row has zikr dropdown, count, date/time, remove button
- Real-time validation per row (invalid rows show errors immediately)
- Save disabled if any row is invalid
- Support unlimited rows (no hard limit per requirements)
- Dynamic row management with efficient rendering

**FR-3.7: Quick Repeat Bulk Mode**
- Single zikr selector at top of form
- Multiple count/date rows below with reduced UI chrome
- If only one zikr exists, auto-select and hide selector
- "Add Row" button adds new count/date row
- Save disabled if any row is invalid
- Optimized for entering same zikr with different counts/times
- Efficient UI for repetitive session logging

**FR-3.8: Cancel with Confirmation**
- If form has unsaved data (rows > 1 or any filled), show confirmation
- Confirmation dialog: "Discard unsaved sessions?"
- On confirm: reset store, close form, return to previous screen
- On cancel: return to form, preserve all data
- Check store state for unsaved changes (dirty state detection)

**FR-3.9: Single Session Save Wiring**
- On Save: validate all fields
- Call `SessionService.addSession()` with validated data
- Show loading state during save
- On success: success toast, reset form, navigate to history
- On error: error toast with helpful message, keep form data
- Try-catch for comprehensive error handling
- Auto-save to localStorage for error recovery

**FR-3.10: Bulk Session Save Wiring (< 50 sessions)**
- Validate all rows before save
- Always use progressive save (per requirements)
- Show minimal progress bar: "Saving... X%"
- Call `SessionService.addBulkSessions()` or `ProgressiveSaveService.saveInChunks()`
- On success: "X sessions saved" toast, reset form
- On partial failure: "X of Y sessions saved" + retry option for failed sessions
- Show detailed error messages for failed sessions
- Keep form data for retry capability

**FR-3.11: Progressive Bulk Save (50+ sessions)**
- Always use `ProgressiveSaveService.saveInChunks()` for large batches
- Show minimal progress bar with percentage
- UI remains responsive during save (no blocking)
- On completion: success toast with total saved count
- On interruption: state saved for resume, show resume prompt
- Support cancellation during save with state preservation
- Estimate completion time based on batch size

**FR-3.12: Interrupted Save Resume Prompt**
- On form open, check for interrupted save state in `sessionFormState`
- Show prompt: "Resume save? X sessions remaining"
- On "Resume": call `ProgressiveSaveService.resumeInterruptedSave()`
- On "Discard": clear interrupted state, start fresh form
- Allow user to choose between resuming and starting over
- Clear state after successful resume or discard

#### Story 6.4: Session History UI

**FR-4.1: sessionHistoryStore Implementation**
- State: sessions array, groupedByDate object, loading flag, error state
- Actions: loadSessions(), groupByDate(), refresh()
- Use Dexie liveQuery for reactive updates (auto-update on changes)
- Support infinite scroll or pagination for large datasets
- Handle loading and error states gracefully
- Group sessions by time period (per requirements)

**FR-4.2: SessionHistoryList Component**
- Pull-to-refresh functionality (mobile gesture)
- Infinite scroll or pagination for large datasets
- Empty state: "No sessions yet - start practicing!"
- Loading state during initial load with spinner
- Error state with retry option and helpful error message
- Mobile-optimized list with 44x44px touch targets
- Dark mode support with high contrast compliance

**FR-4.3: Session Grouping by Time Period**
- Group sessions under date headers: "Today", "Yesterday", "This Week", "Older"
- Sessions sorted by timestamp within each group (newest first)
- Show session count per group: "This Week (12 sessions)"
- Collapse/expand groups for better navigation
- Auto-collapse old groups when many sessions exist
- Efficient grouping algorithm for large datasets

**FR-4.4: SessionCard Component**
- Display: zikr name (bold), count (e.g., "33 dhikr"), time (e.g., "7:30 AM")
- Source badge: 📱 App, ✏️ Manual, 📿 Physical
- Edit button (if within 3-day window) with 44x44px touch target
- Delete button (if within 3-day window) with 44x44px touch target
- View-only mode (if outside 3-day window) with explanation
- Truncate long zikr names with ellipsis
- Show full zikr name on long-press or tooltip
- Keyboard navigation support (Enter to view, Delete to remove)

**FR-4.5: Deleted Zikr Reference Handling**
- If zikr not found (deleted), show "Zikr Name (deleted)"
- Style with muted colors (gray text, dimmed opacity)
- Still show count, time, source badge for data integrity
- Preserve session data even when zikr is deleted
- Allow viewing historical sessions from deleted zikrs

**FR-4.6: LiveQuery Integration**
- Subscribe to Dexie liveQuery on sessions store
- Auto-update when sessions added/edited/deleted
- Unsubscribe on component unmount (cleanup)
- Update grouping reactively when sessions change
- Maintain scroll position during reactive updates
- Handle errors gracefully with retry option

#### Story 6.5: Edit and Delete Sessions

**FR-5.1: Edit Session Flow**
- Tap Edit on session card (if within 3-day window)
- Load session into SessionEntryForm (single mode, pre-filled)
- User modifies count, zikr, or date/time
- Real-time validation with inline errors
- On Save: call `SessionService.updateSession()`
- Show success toast, return to history
- On cancel: return to history without changes
- Preserve form state for retry on validation failure

**FR-5.2: Delete Session with Confirmation**
- Tap Delete on session card (if within 3-day window)
- Show confirmation dialog: "Delete this session?"
- Include session details in confirmation (zikr, count, date)
- On confirm: call `SessionService.deleteSession()`
- Show success toast
- On cancel: return to history
- Show helpful error message if delete fails
- Maintain data integrity (cascade updates to goals/streaks)

#### Story 6.6: Integration Services

**FR-6.1: GoalProgressService.recalculateForSession**
- Accept session object (added, updated, or deleted)
- Find active goals for session's zikr
- Recalculate goal progress including new session data
- Update goal status to 'completed' if target reached
- Handle session edit: delta recalculation (remove old, add new)
- Handle session delete: subtract from progress, update status
- Query goals by date range for period-based goals
- Maintain goal accuracy across all session operations

**FR-6.2: StreakService.updateForSession**
- Accept session object (added, updated, or deleted)
- Recalculate streak based on all session dates for zikr
- Update current streak and longest streak accordingly
- Handle session add: increment if consecutive day
- Handle session edit: adjust if date changed significantly  
- Handle session delete: recalculate without deleted session
- Use set of unique dates for streak calculation
- Maintain same-day prevention (lastProcessedDate)

**FR-6.3: Integration Triggering in SessionService**
- `addSession`: triggers goal and streak updates
- `updateSession`: triggers goal and streak recalculation  
- `deleteSession`: triggers goal and streak recalculation
- `addBulkSessions`: batch updates for efficiency
- All triggers use transactions for atomicity
- Error handling maintains data consistency

**FR-6.4: Last Count Storage in SessionService**
- On successful session save: store count in `zikrLastCount` store
- Upsert operation (put) with updatedAt timestamp
- Fire-and-forget operation (non-blocking)
- Used by SessionEntryForm for smart defaults
- Improve data entry speed for frequent practitioners

**FR-6.5: Last Count Retrieval**
- Method: `getLastCount(zikrId)` in SessionService
- Returns count from `zikrLastCount` or 0 if not found
- Used by SessionEntryForm for smart defaults
- Async query with error handling
- Return 0 for missing zikrId (graceful degradation)

#### Story 6.7: Polish & Error Handling

**FR-7.1: Dark Mode Support for Session Entry**
- Form colors adapt to dark mode (backgrounds, inputs, text)
- Input borders visible in both themes (high contrast)
- Validation errors readable in dark mode
- No visual glitches on theme switch
- Test with system dark mode toggle

**FR-7.2: Dark Mode Support for Session History**
- Session cards, badges, buttons render properly in dark mode
- Proper contrast maintained (4.5:1 minimum)
- Date headers visible in dark mode  
- Group sections maintain visual hierarchy
- Test dark mode with real device/system settings

**FR-7.3: ARIA Labels and Screen Reader Support**
- All form inputs have descriptive aria-label or aria-labelledby
- Error messages announced to screen reader via aria-live
- "Form has X errors" announcement on submit attempt
- Progress updates announced during bulk save ("Saved 25 of 100 sessions")
- Session cards announced with zikr name, count, and action buttons
- Keyboard navigation support (Enter, Escape, Arrow keys)

**FR-7.4: Keyboard Navigation**
- Logical tab order through form fields (top to bottom, left to right)
- Enter key submits form, Escape cancels (with confirmation if dirty)
- Arrow keys work in zikr dropdown and date/time pickers
- Space bar toggles checkboxes and radio buttons (if added)
- Tab and Shift+Tab navigate between form sections
- Focus indicators clearly visible

**FR-7.5: IndexedDB Quota Exceeded Error Handling**
- Catch quota exceeded error in all session operations
- Show toast: "Storage full - delete old sessions or clear browser data"  
- Link to session history for cleanup (provide button)
- Suggest export/import for data preservation
- Prevent data loss with clear guidance
- Log error for debugging (no sensitive data)

**FR-7.6: Corrupted Session Recovery**
- Catch parsing errors when loading session history
- Log corrupted session id to console (for debugging)
- Skip corrupted session, show valid ones (fail gracefully)
- Don't crash entire session history list
- Show error message: "Some sessions couldn't be loaded. Try refreshing or exporting your data."
- Offer export/import as recovery option

**FR-7.7: Future Date Warning**
- If selected date/time is in future, show warning: "⚠️ This session is in the future"
- Allow save (not an error, just a warning)
- Help users avoid accidental future date selection
- Clear warning when date/time corrected
- Show on both single and bulk entry modes

**FR-7.8: Offline Functionality Verification**
- All operations work offline (no network calls, per requirements)
- Session save, edit, delete work in airplane mode
- History loads and updates offline
- Progressive save works without network
- Test with network throttling and airplane mode
- Ensure no network requests in session management

#### Story 6.8: Testing (Deferred to Epic 5)

**Note:** Comprehensive testing infrastructure established in Epic 5. Epic 6 will be tested as part of Epic 5 implementation.

### Non-Functional Requirements

#### Performance

**Test Execution Speed:**
- Session CRUD operations < 100ms per operation
- Bulk save of 100 sessions < 10 seconds total
- Session history load < 2 seconds for 1000 sessions
- Real-time validation < 50ms per validation check
- Progressive save chunk processing < 1 second per 10 sessions

**Database Performance:**
- Efficient indexed queries (editableUntil, date, zikrId)
- Migration v1 → v2 < 5 seconds for 1000 existing sessions
- liveQuery updates < 100ms for UI reactivity
- Bulk operations use transactions for atomicity

**UI Performance:**
- Session entry form load < 300ms (mobile target)
- Progressive save progress updates < 100ms (smooth UI)
- Session history scroll < 16ms (60fps target)
- Form state updates < 50ms (real-time validation)

#### Security

**Data Privacy:**
- Local-only processing (no data leaves device, per requirements)
- No cloud sync or external API calls for session data
- Export files contain only user's own session data
- All processing happens client-side

**Data Integrity:**
- Transaction-based operations prevent partial updates
- Migration v1 → v2 uses try-catch per session (skip corrupt, continue)
- Cascade updates to goals/streaks use same transaction
- Error recovery with helpful messages and suggested fixes

**Input Validation:**
- Count: positive integer, min 1, max 10000
- Date/time: valid Date object, future dates allowed with warning
- Zikr selection: required field, must exist in database
- Real-time validation with immediate feedback

#### Scalability

**Data Volume:**
- Support unlimited sessions (no hard limit, per requirements)
- Support unlimited zikrs for session entry
- Efficient pagination/infinite scroll for history
- Progressive save handles 1000+ sessions in batches

**User Growth:**
- No backend scaling required (local-only architecture)
- Database size limited by browser IndexedDB quota (typically 50-100MB)
- Export/import supports data migration between devices
- No server costs ($0/month operational)

#### Maintainability

**Code Organization:**
- Feature-based structure: `src/features/sessions/`
- Service layer separation (SessionService, ValidationService, ProgressiveSaveService)
- Component modularity (SessionRow, SessionCard, SessionEntryForm)
- Store modularity (sessionFormStore, sessionHistoryStore)

**Documentation:**
- Update docs/architecture.md with v2 schema and migrations
- Add session management patterns to developer docs
- Document 3-day edit window rationale
- Explain progressive save chunking strategy

### UI/UX Requirements

**Session Entry Form Flows:**
1. **Single Entry**: Select zikr → Enter count → Choose date/time → Save
2. **Multi-Zikr Bulk**: Add session rows (different zikrs) → Validate all → Save
3. **Quick Repeat Bulk**: Select zikr → Add rows (counts/times) → Validate → Save

**Session History Navigation:**
- Grouped by time periods with expand/collapse
- Pull-to-refresh for latest data
- Infinite scroll for large datasets
- Tap session card for details, edit, delete options

**Error Presentation:**
- Inline validation errors with field-level highlighting
- Toast notifications for save success/failure
- Helpful error messages with suggested fixes
- Confirmation dialogs for destructive actions (delete, cancel)

**Accessibility Requirements:**
- Complete keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Touch targets ≥ 44x44px (WCAG 2.1 AA compliance)
- Color contrast ≥ 4.5:1 for all text
- Screen reader support (ARIA labels, live regions)
- Focus indicators clearly visible

**Dark Mode Support:**
- All components adapt to system dark mode
- High contrast maintained (4.5:1 minimum)
- Smooth transitions between themes
- Tested visual appearance in both modes

**Mobile Responsiveness:**
- Thumb-zone interaction design
- Haptic feedback for actions (save, delete, edit)
- Swipe gestures where appropriate (consider future enhancement)
- Responsive layouts for all screen sizes

### Data & Integration

**Data Models Involved:**

**Session v2 Schema:**
```typescript
interface Session {
  id?: number;
  zikrId: number;
  count: number;
  source: 'app' | 'manual' | 'physical';
  timestamp: Date;
  date: Date;  // denormalized for queries
  editableUntil: Date;  // timestamp + 3 days
  createdAt: Date;
  updatedAt: Date;
}
```

**New Stores:**
- `sessionFormState`: { id, sessions, currentIndex, createdAt }
- `zikrLastCount`: { zikrId, count, updatedAt }

**Migration Impact:**
- v1 → v2 migration required for existing users
- Existing sessions gain editableUntil, createdAt, updatedAt
- Existing sessions get source = 'app' (default)
- Blocking migration with progress indicator

**Integration Points:**
- SessionService triggers GoalProgressService and StreakService
- SessionEntryForm integrates with sessionFormStore and zikrLastCount
- SessionHistoryList uses liveQuery for reactive updates
- ProgressiveSaveService uses sessionFormState for resume capability

### Impact Analysis

**Affected Features:**
- **ManualEntryModal.tsx** - Will be enhanced/replaced by SessionEntryForm
- **sessionService.ts** - Will be extended with new methods
- **Progress.tsx** - Will be enhanced with session history
- **Session interface** - Will gain new fields (v2 schema)
- **Database schema** - Will migrate from v1 to v2

**Breaking Changes:**
- **Schema v1 → v2** - Requires migration (blocking, one-time)
- **ManualEntryModal enhancement** - Existing component enhanced, not replaced
- **Service method signatures** - Extended, not broken (backward compatible)

**New Dependencies:**
- No new external dependencies
- Reuses existing Dexie.js, Zustand, React patterns
- Progressive save uses existing setTimeout (no new libs)

**Migration Required:**
- **Yes**, v1 → v2 database migration on app open
- **Blocking migration** with progress indicator
- **Per-session error handling** (skip corrupt, continue)
- **Estimated duration**: < 5 seconds for 1000 sessions

### Edge Cases to Handle

1. **3-Day Edit Window Expiry**: Show view-only mode with explanation
2. **Deleted Zikr References**: Show "Zikr Name (deleted)" in session cards
3. **Empty Zikr List**: Disable session entry, guide to zikr creation
4. **Bulk Save Errors**: Skip invalid sessions, save valid ones, report errors
5. **Interrupted Progressive Saves**: Resume from checkpoint or discard and start fresh
6. **Future Date/Time**: Show warning but allow save (user might want to pre-log)
7. **IndexedDB Quota Exceeded**: Clear error message, link to cleanup, suggest export
8. **Corrupted Session Data**: Skip corrupted sessions, show error, offer recovery
9. **Migration Failures**: Skip corrupt sessions, log errors, continue migration
10. **No Zikrs Available**: Show empty state, guide to zikr creation
11. **Large Bulk Operations**: Progressive save with minimal progress bar, UI remains responsive
12. **Session Edit During Delete**: Handle race conditions with transaction locking
13. **Streak Calculation Edge Cases**: Same-day prevention, timezone handling, gap detection
14. **Goal Recalculation During Bulk**: Efficient batch updates, prevent redundant recalculation
15. **Network Disconnection**: All operations work offline (no network calls)

### Success Criteria

**Functional Success:**
- ✅ Database v2 schema implemented and working
- ✅ Migration v1 → v2 completes successfully for all existing data
- ✅ All CRUD operations work (add, update, delete, query)
- ✅ Bulk entry modes functional (Multi-Zikr, Quick Repeat)
- ✅ Session history displays grouped by time period
- ✅ Edit/delete works within 3-day window
- ✅ Progressive save handles 1000+ sessions without blocking
- ✅ Smart defaults populate from last count per zikr
- ✅ Goals and streaks update correctly for all session operations

**Performance Success:**
- ✅ Migration completes in < 5 seconds for 1000 sessions
- ✅ Bulk save of 100 sessions completes in < 10 seconds
- ✅ Session history loads in < 2 seconds for 1000 sessions
- ✅ Real-time validation < 50ms per field
- ✅ Progressive save maintains UI responsiveness

**Quality Success:**
- ✅ All operations work offline (no network calls)
- ✅ Dark mode support across all components
- ✅ Complete keyboard navigation (WCAG 2.1 AA)
- ✅ Touch targets ≥ 44x44px throughout
- ✅ Screen reader support with ARIA labels
- ✅ Helpful error messages with suggested fixes
- ✅ Data export/import works for backup/restore

**User Experience Success:**
- ✅ Session entry is fast and efficient (smart defaults)
- ✅ Bulk entry modes significantly reduce data entry time
- ✅ Session history provides meaningful progress insights
- ✅ Edit window balances flexibility with data integrity
- ✅ Progressive save handles large batches gracefully
- ✅ Error recovery prevents data loss
- ✅ Clear visual feedback for all operations

### Assumptions & Constraints

**Technical Assumptions:**
- Dexie.js handles v1 → v2 migration reliably with upgrade() pattern
- IndexedDB quota sufficient for typical user data (months/years of sessions)
- Browser supports fake-indexeddb for testing (Epic 5)
- Device performance adequate for bulk operations (1000+ sessions)
- Date/time manipulation works consistently across timezones (local time per requirements)

**Business Constraints:**
- **$0/month operational cost** - All data local, no backend services
- **Mobile-first design** - Optimize for touch, small screens, offline use
- **Offline-first architecture** - No network calls in session management
- **Local-only processing** - No data leaves device (privacy requirement)

**Timeline Considerations:**
- Epic 6 is substantial (42 tasks, 7 stories) - requires careful planning
- Migration must be tested thoroughly before deployment
- Progressive save adds complexity but necessary for large batches
- Balance feature richness with implementation time

**Platform Constraints:**
- iOS limitations: No background tasks (already documented)
- PWA storage limits: IndexedDB quota varies by device
- Browser compatibility: Target modern browsers (Chrome, Firefox, Safari, Edge)

### Implementation Notes

**Database Migration Strategy:**
1. User opens app after Epic 6 deployment
2. App detects database v1, shows migration screen with progress bar
3. Migration runs atomically with per-session try-catch
4. For each existing session:
   - Add editableUntil = timestamp + 3 days
   - Add source = 'app' (default)
   - Add createdAt and updatedAt timestamps
5. Show migration completion, unlock app
6. User can now use enhanced session features

**Progressive Save Algorithm:**
1. User saves 100+ sessions in bulk mode
2. System detects large batch, enables progressive save
3. Chunk into batches of 10 sessions
4. For each chunk:
   - Save chunk to IndexedDB transaction
   - Update progress bar (minimal, per requirements)
   - Save state to sessionFormState (for resume)
   - Yield to UI thread (setTimeout 0)
5. On completion or interruption:
   - Clean up sessionFormState
   - Show success toast with final count

**Edit Window Enforcement:**
1. User tries to edit session from history
2. System checks `editableUntil` field (timestamp + 3 days)
3. If `now < editableUntil`: Enable edit controls
4. If `now >= editableUntil`: Show view-only mode with explanation
5. Explanation: "Cannot edit sessions older than 3 days. This maintains data integrity for streaks and goals."

**Cascade Delete Behavior:**
1. User deletes zikr from zikr list
2. System checks for associated sessions
3. If sessions exist, show confirmation dialog:
   - "Keep sessions: Zikr name shows as 'Deleted Zikr' in history"
   - "Delete all: Removes zikr and all associated sessions"
4. User choice preserved, data integrity maintained

**Smart Defaults Flow:**
1. User selects zikr in session entry form
2. System queries `zikrLastCount` store asynchronously
3. If last count exists, pre-fill count field
4. If no last count, leave empty for manual entry
5. On successful save, update `zikrLastCount` for future sessions

---

## Requirements Summary

**Epic 6 delivers:**
1. ✅ Database v2 schema with 3-day edit window and source tracking
2. ✅ Comprehensive session service layer with full CRUD operations
3. ✅ Bulk entry modes (Multi-Zikr and Quick Repeat) for efficiency
4. ✅ Session history with grouping, edit/delete, and search
5. ✅ Progressive save for large batches (50+ sessions)
6. ✅ Smart defaults (last count per zikr) for rapid entry
7. ✅ Enhanced error recovery and data safety features

**Key Differentiators:**
- **3-day edit window** balances flexibility with data integrity
- **Bulk entry modes** significantly reduce data entry time for devoted practitioners
- **Session history** provides meaningful progress insights
- **Progressive save** handles large batches without blocking UI
- **Smart defaults** improve efficiency for frequent practitioners

**Quality Gates:**
- All operations work offline (local-only processing)
- WCAG 2.1 AA accessibility compliance
- Migration completes safely for all existing users
- Progressive save maintains UI responsiveness
- Data export/import ensures backup/restore capability

**Next Phase:** Architecture design for session management system with v2 schema, service layer, and UI components.

---

*Requirements collected through informed interview and codebase analysis*  
*Incorporates project constraints: $0/month cost, mobile-first, offline-first, local data storage*  
*Aligns with existing architecture: React + Vite + Zustand + Dexie.js + Tailwind CSS*  
*Addresses user needs: bulk entry efficiency, mistake correction, progress insights, data safety*
