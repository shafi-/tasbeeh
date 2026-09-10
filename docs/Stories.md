# Zikr PWA - User Stories

**Status:** Active | **Last Updated:** 2026-06-22

---

## Epic: Core Zikr Management

### Story 1: Create Custom Zikr
**As a** user  
**I want to** add a new zikr with name, translation, target count, and optional notes  
**So that** I can personalize my dhikr practice with spiritual remembrances that matter to me

**Acceptance Criteria:**
- User can enter zikr name (required, max 50 chars, Arabic/English letters, hyphens, spaces only)
- User can enter translation/meaning (required, max 100 chars)
- User can set target count (required, 1-10000, default 33)
- User can optionally add notes (max 200 chars)
- User sees validation errors for invalid input
- New zikr appears in zikr list immediately after creation
- Zikr is marked as custom (different from predefined zikrs)

**Priority:** High | **Epic:** Zikr Management | **Story Points:** 5

---

### Story 2: Edit Existing Zikr
**As a** user  
**I want to** edit my custom zikr's name, translation, target count, or notes  
**So that** I can correct mistakes or update my practice preferences

**Acceptance Criteria:**
- User can edit custom zikrs only (not predefined ones)
- All fields from creation are editable
- Predefined zikrs cannot be edited (read-only)
- Changes are saved immediately
- User can cancel edits without saving

**Priority:** Medium | **Epic:** Zikr Management | **Story Points:** 3

---

### Story 3: Delete Zikr
**As a** user  
**I want to** delete a custom zikr I no longer use  
**So that** my zikr list stays organized and relevant

**Acceptance Criteria:**
- User sees delete option for custom zikrs only
- Delete requires confirmation (with warning about losing history)
- Predefined zikrs cannot be deleted
- Soft delete: zikr marked as deleted but retained in database
- Hard delete option available (removes all associated data)
- Related sessions, goals, streaks are handled appropriately

**Priority:** Medium | **Epic:** Zikr Management | **Story Points:** 5

---

### Story 4: View Zikr List
**As a** user  
**I want to** see all my zikrs (predefined and custom) in a list  
**So that** I can quickly select which dhikr to practice

**Acceptance Criteria:**
- List shows both predefined and custom zikrs
- Each item shows: name, translation, target count
- List is searchable/filterable
- Empty state shown when no zikrs exist
- Predefined zikrs are visually distinct from custom ones

**Priority:** High | **Epic:** Zikr Management | **Story Points:** 3

---

## Epic: Dhikr Counter

### Story 5: Interactive Counter
**As a** user  
**I want to** tap a large button to increment my dhikr count  
**So that** I can easily keep track while focusing on my practice

**Acceptance Criteria:**
- Large, thumb-friendly tappable area (minimum 56px)
- Visual feedback on tap (scale animation, ripple effect)
- Current count displayed prominently (large font)
- Target progress shown (circular or linear indicator)
- Haptic feedback on tap (if device supports it)
- Counter works offline
- Auto-saves count in background

**Priority:** High | **Epic:** Counter | **Story Points:** 8

---

### Story 6: Counter with Arabic Text
**As a** user  
**I want to** see the Arabic text of the zikr I'm practicing  
**So that** I can connect with the spiritual meaning of my dhikr

**Acceptance Criteria:**
- Arabic text displayed prominently above counter
- Use Noto Serif or similar Arabic font
- Translation shown below Arabic text
- Text is RTL (right-to-left) aligned properly
- User can tap/hover to see full transliteration (optional)

**Priority:** High | **Epic:** Counter | **Story Points:** 3

---

### Story 7: Complete Dhikr Session
**As a** user  
**I want to** mark my dhikr session as complete  
**So that** my progress is tracked and goals are updated

**Acceptance Criteria:**
- "Complete Session" button visible when count > 0
- On complete: session saved to history
- Goals updated with progress
- Streak recalculated if threshold met
- Success feedback (visual, haptic)
- Option to start another session or return home

**Priority:** High | **Epic:** Counter | **Story Points:** 5

---

### Story 8: Reset Counter
**As a** user  
**I want to** reset my current count to zero  
**So that** I can start over if I made a mistake

**Acceptance Criteria:**
- Reset button visible (subtle, not prominent)
- Requires confirmation or single tap (no double confirmation)
- Haptic feedback on reset
- Count returns to zero
- No session is created (reset ≠ complete)

**Priority:** Low | **Epic:** Counter | **Story Points:** 2

---

### Story 9: Quick Start from Home
**As a** user  
**I want to** start counting directly from the home screen  
**So that** I can begin my practice with minimal taps

**Acceptance Criteria:**
- Home screen shows "Quick Start" zikr cards
- Each card shows: zikr name, translation, target count
- Tapping card opens counter for that zikr
- Cards are horizontally scrollable (snap to center)
- Most recent zikrs shown first
- Visual indicator if already practiced today

**Priority:** High | **Epic:** Counter | **Story Points:** 5

---

## Epic: Goals & Reminders

### Story 10: Create Daily Goal
**As a** user  
**I want to** set a daily goal for a specific zikr  
**So that** I can track my consistency and progress

**Acceptance Criteria:**
- User selects zikr from list
- User sets target count (1-10000)
- User selects period: daily, weekly, monthly
- User sets optional date range for goal
- Goal shows in active goals list
- Progress calculated from completed sessions

**Priority:** High | **Epic:** Goals | **Story Points:** 5

---

### Story 11: View Goal Progress
**As a** user  
**I want to** see my progress toward each goal  
**So that** I stay motivated and know how much remains

**Acceptance Criteria:**
- Each goal card shows: name, target, current progress, percentage
- Visual progress indicator (circular or linear)
- Days remaining shown (if applicable)
- Motivational message based on progress ("Almost there!", "Keep going!")
- Goal marked complete when 100% reached

**Priority:** High | **Epic:** Goals | **Story Points:** 5

---

### Story 12: Toggle Goal Active State
**As a** user  
**I want to** pause or resume a goal  
**So that** I can focus on specific practices without losing my goal settings

**Acceptance Criteria:**
- Toggle switch on each goal card
- Paused goals don't track progress but remain saved
- Visual distinction between active and paused goals
- No data loss when toggling
- Can toggle from detail view too

**Priority:** Medium | **Epic:** Goals | **Story Points:** 2

---

### Story 13: Edit or Delete Goal
**As a** user  
**I want to** modify or remove a goal I created  
**So that** I can adjust my practice targets

**Acceptance Criteria:**
- Edit opens pre-filled form with current values
- Delete requires confirmation
- Historical progress preserved for deleted goals
- Can archive instead of delete (keeps record, hides from active list)

**Priority:** Medium | **Epic:** Goals | **Story Points:** 3

---

### Story 14: Reminder Notifications
**As a** user  
**I want to** set reminders for my dhikr practice  
**So that** I remember to practice at consistent times

**Acceptance Criteria:**
- User can set time for daily reminder
- Reminder links directly to counter or goal
- Notification shows zikr name and target
- In-app notification center for iOS (no scheduled notifications)
- User can enable/disable per goal
- Respect "Do Not Disturb" system setting

**Priority:** Low (iOS limitations) | **Epic:** Goals | **Story Points:** 5

---

## Epic: Progress & Analytics

### Story 15: View Daily Summary
**As a** user  
**I want to** see a summary of my practice today  
**So that** I know how much I've accomplished

**Acceptance Criteria:**
- Today's total dhikr count shown prominently
- Breakdown by zikr (count per zikr)
- Comparison with yesterday
- Progress toward daily goals
- Streak badge if applicable
- "Practice more" CTA if below target

**Priority:** High | **Epic:** Progress | **Story Points:** 5

---

### Story 16: View Weekly Progress Chart
**As a** user  
**I want to** see my practice over the past week  
**So that** I can identify patterns and maintain consistency

**Acceptance Criteria:**
- Bar chart showing daily counts for last 7 days
- Current day highlighted
- Empty days shown with zero height bar
- Total for week displayed
- Comparison with previous week
- Tap day to see detailed breakdown

**Priority:** Medium | **Epic:** Progress | **Story Points:** 5

---

### Story 17: View Streak Information
**As a** user  
**I want to** see my current and longest streak  
**So that** I can celebrate my consistency

**Acceptance Criteria:**
- Current streak shown on home screen (if > 0)
- Longest streak shown in progress view
- Streak defined as consecutive days with any session
- Fire/streak icon with animation when streak active
- Streak resets on missed day
- Streaks calculated per zikr

**Priority:** Medium | **Epic:** Progress | **Story Points:** 3

---

### Story 18: View Session History
**As a** user  
**I want to** see my past dhikr sessions  
**So that** I can review my practice history

**Acceptance Criteria:**
- List of past sessions with date, time, zikr, count
- Filterable by zikr, date range
- Paginated or infinite scroll
- Shows session source (app vs manual vs physical)
- Edit/delete options for recent sessions (3-day window)
- Export history as JSON

**Priority:** Low | **Epic:** Progress | **Story Points:** 5

---

## Epic: Manual Progress Entry

### Story 19: Log Offline Progress
**As a** user  
**I want to** manually enter dhikr done with physical tasbeeh  
**So that** my progress is tracked even when I don't use the app

**Acceptance Criteria:**
- Form with: zikr selection, count, date, time fields
- Date defaults to today, time to now
- Can log multiple sessions in one entry
- Validation: count between 1-10000
- Session marked as "manual" source
- Updates goals and streaks appropriately

**Priority:** High | **Epic:** Manual Entry | **Story Points:** 5

---

### Story 20: Bulk Entry Form
**As a** user  
**I want to** enter multiple zikr counts in one form  
**So that** I can quickly log a complete practice session

**Acceptance Criteria:**
- Form shows all zikrs with count input
- Optional: show only favorites
- Smart defaults: last used count per zikr
- Validation per row (zikr, count)
- Save all at once or progressive save
- Clear/reset button to start over
- Shows total count being entered

**Priority:** Medium | **Epic:** Manual Entry | **Story Points:** 8

---

### Story 21: Edit Recent Session
**As a** user  
**I want to** edit a session I just created  
**So that** I can fix mistakes in count or time

**Acceptance Criteria:**
- Edit allowed within 3 days of session creation
- Edit shows pre-filled form
- Can change zikr, count, timestamp
- Original session updated (not new entry)
- Goals and streaks recalculated
- Cannot edit after 3-day window

**Priority:** Medium | **Epic:** Manual Entry | **Story Points:** 5

---

### Story 22: Delete Session
**As a** user  
**I want to** remove an incorrectly logged session  
**So that** my records are accurate

**Acceptance Criteria:**
- Delete allowed within 3 days (same as edit)
- Confirmation dialog shows session details
- Goals and streaks recalculated after deletion
- Cannot delete after 3-day window (historical integrity)

**Priority:** Low | **Epic:** Manual Entry | **Story Points:** 3

---

## Epic: Settings & Preferences

### Story 23: Toggle Dark Mode
**As a** user  
**I want to** switch between light and dark themes  
**So that** I can practice comfortably in any lighting

**Acceptance Criteria:**
- Toggle in settings
- Respects system preference by default
- Manual choice overrides system
- Theme persists across sessions
- All pages support both themes
- Smooth transition between themes

**Priority:** Medium | **Epic:** Settings | **Story Points:** 3

---

### Story 24: Toggle Haptic Feedback
**As a** user  
**I want to** enable or disable vibration feedback  
**So that** I can control the tactile response

**Acceptance Criteria:**
- Toggle in settings and counter screen
- Off by default (ask to enable)
- Applies to: counter taps, button presses, completion
- Respects system "Do Not Disturb"
- Setting persists across sessions

**Priority:** Low | **Epic:** Settings | **Story Points:** 2

---

### Story 25: Export/Import Data
**As a** user  
**I want to** backup my data or restore from backup  
**So that** I don't lose my progress

**Acceptance Criteria:**
- Export generates JSON file with all data
- File includes: zikrs, sessions, goals, streaks, settings
- Import validates file format before restoring
- Warning before import (replaces current data)
- Shows file size and date
- Can share export file (for migration)

**Priority:** Low | **Epic:** Settings | **Story Points:** 5

---

### Story 26: Clear All Data
**As a** user  
**I want to** reset the app to start fresh  
**So that** I can clear my practice history completely

**Acceptance Criteria:**
- Option in settings (deeply buried)
- Multiple confirmation steps
- Shows what will be deleted
- Cannot be undone
- Requires password/pattern confirmation (optional)

**Priority:** Low | **Epic:** Settings | **Story Points:** 3

---

## Epic: Onboarding & First Run

### Story 27: Welcome Screen
**As a** new user  
**I want to** be welcomed and guided through the app's purpose  
**So that** I understand how to use Zikr

**Acceptance Criteria:**
- Shown on first launch
- Explains app purpose briefly
- Highlights key features (counter, goals, progress)
- Option to skip welcome
- Multi-screen with "Next" / "Get Started" CTAs
- Shows a quick start zikr to begin immediately

**Priority:** Medium | **Epic:** Onboarding | **Story Points:** 3

---

### Story 28: Seed Predefined Zikrs
**As a** new user  
**I want to** start with common dhikrs pre-loaded  
**So that** I can begin practicing immediately

**Acceptance Criteria:**
- Predefined zikrs loaded on first launch:
  - SubhanAllah (33x)
  - Alhamdulillah (33x)
  - Allahu Akbar (34x)
  - Astaghfirullah (100x)
  - Salawat (10x)
- Marked as predefined (not custom)
- User can delete/hide predefined zikrs
- Shows explanation of each dhikr

**Priority:** High | **Epic:** Onboarding | **Story Points:** 2

---

## Epic: PWA & Offline

### Story 29: Install as App
**As a** user  
**I want to** install Zikr as a standalone app  
**So that** I can launch it from my home screen

**Acceptance Criteria:**
- PWA manifest configured
- Install prompt shown (Chrome/Edge)
- Add to Home Screen works (iOS Safari)
- App launches in standalone mode
- No browser chrome in standalone
- App icon and name configured

**Priority:** High | **Epic:** PWA | **Story Points:** 3

---

### Story 30: Offline Functionality
**As a** user  
**I want to** use Zikr without internet connection  
**So that** I can practice anywhere

**Acceptance Criteria:**
- Service worker caches all assets
- Counter works fully offline
- Can create/edit/delete zikrs offline
- Changes sync when connection restored (if backend added)
- Shows "Offline" badge when no connection
- No functionality lost offline

**Priority:** High | **Epic:** PWA | **Story Points:** 8

---

## Epic: Accessibility & Inclusion

### Story 31: Screen Reader Support
**As a** visually impaired user  
**I want to** use Zikr with a screen reader  
**So that** the app is accessible to everyone

**Acceptance Criteria:**
- All interactive elements have ARIA labels
- Counter count announced on tap
- Progress read as percentage
- Navigation properly announced
- Semantic HTML throughout
- Tested with VoiceOver/TalkBack

**Priority:** High | **Epic:** Accessibility | **Story Points:** 8

---

### Story 32: Keyboard Navigation
**As a** user  
**I want to** navigate the app with keyboard  
**So that** I can use it without touch/mouse

**Acceptance Criteria:**
- All interactive elements reachable via Tab
- Focus rings clearly visible
- Enter/Space activates buttons
- Escape cancels/modals
- Arrow keys for scrollable lists
- Counter can be incremented with keyboard

**Priority:** Medium | **Epic:** Accessibility | **Story Points:** 5

---

### Story 33: Respect Motion Preferences
**As a** user  
**I want to** disable animations if I prefer reduced motion  
**So that** the app doesn't cause dizziness or discomfort

**Acceptance Criteria:**
- Respects `prefers-reduced-motion` system setting
- Animations disabled or reduced when setting is on
- Smooth scrolling disabled
- Ripple effects disabled
- No auto-playing animations
- Falls back to instant state changes

**Priority:** High | **Epic:** Accessibility | **Story Points:** 3

---

## Epic: Social & Sharing (Future)

### Story 34: Share Progress
**As a** user  
**I want to** share my practice milestone  
**So that** I can inspire others or celebrate achievements

**Acceptance Criteria:**
- Share option after completing goal
- Generates shareable image/card
- Shows: streak, total count, achievement
- Share to social media or copy
- Optional: hide personal data
- Shows "shared from Zikr" attribution

**Priority:** Low | **Epic:** Social | **Story Points:** 5

---

### Story 35: Sync Across Devices (Future)
**As a** user  
**I want to** access my data from multiple devices  
**So that** I can practice seamlessly

**Acceptance Criteria:**
- User account system (email/password)
- Cloud sync via backend
- Conflict resolution for simultaneous edits
- Manual sync button
- Last sync timestamp shown
- Works offline with sync on reconnect

**Priority:** Future (requires backend) | **Epic:** Social | **Story Points:** 13

---

## Story Status Legend

- 🟢 **Ready for Development** - Requirements clear, can start implementation
- 🟡 **Needs Refinement** - Requirements unclear or incomplete
- 🔴 **Blocked** - External dependency or technical blocker
- ⚪ **Future** - Planned for later version

## Priority Legend

- **High** - Core functionality, MVP required
- **Medium** - Important but not blocking
- **Low** - Nice to have, can defer

---

**Total Stories:** 35  
**High Priority:** 18  
**Medium Priority:** 12  
**Low Priority:** 5

**Story Points Total:** 153 (estimated)
