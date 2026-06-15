# Zikr PWA - Requirements Specification

**Version**: 1.0
**Status**: Final
**Last Updated**: 2026-06-15
**Project**: Zikr - Islamic Dhikr Progressive Web App

---

## 1. Project Overview

### 1.1 Purpose

Zikr is a Progressive Web App (PWA) designed to help Muslims practice dhikr (remembrance of Allah) with customizable goals, progress tracking, and reminders. The app differentiates itself through three core features:

1. **Custom Zikr Lists** - Users can create personalized dhikr collections
2. **Manual Progress Entry** - Track sessions done with physical tasbeeh or offline
3. **Personalized Goals** - Set and track individual spiritual targets

### 1.2 Problem Statement

Existing tasbeeh/dhikr applications have three critical gaps:

1. **No Customization** - Users are limited to predefined zikr lists
2. **App-Only Tracking** - Progress only counts in-app taps, not physical tasbeeh use
3. **Generic Goals** - One-size-fits-all approach without personalization

Zikr addresses all three gaps while maintaining a $0/month operational cost through local-only data storage.

### 1.3 Target Users

**Mixed Audience Approach**: The app adapts to different practitioner levels:

- **Casual Practitioners** - Need reminders, simple tracking, encouragement
- **Devoted Practitioners** - Track high volume, detailed analytics, minimal friction
- **New Converts/Learners** - Guided content (future feature, v2+)

---

## 2. Feature Scope and Boundaries

### 2.1 In Scope (v1 Core)

| Feature | Priority | Description |
|---------|----------|-------------|
| Custom Zikrs | P0 | Add, edit, delete personal zikr lists |
| Manual Progress Entry | P0 | Log sessions from physical tasbeeh or offline practice |
| Tasbeeh Counter | P0 | Interactive counter with haptic feedback |
| Goal Setting | P0 | Daily, weekly, monthly, or custom date range goals |
| Streak Tracking | P0 | Consecutive day tracking for habit formation |
| Progress Visualization | P1 | Simple charts showing growth over time |
| In-App Reminders | P1 | Cross-platform reminder system (iOS + Android) |
| Dark Mode | P1 | System-wide dark theme support |
| Data Export/Import | P1 | JSON backup for data portability |

### 2.2 Out of Scope (v1)

- Community/social features
- Audio/tasbeeh sounds
- Educational content for new learners
- Cloud sync or data backup to server
- Push notifications (deferred to v1.1 due to iOS limitations)
- Home screen widgets
- Background reminders (platform limitation)

### 2.3 Feature Boundaries

**Custom Zikrs**:
- Maximum: No hard limit (reasonable use expected < 50)
- Character limit: 50 characters per zikr name
- Predefined zikrs cannot be edited/deleted

**Manual Progress Entry**:
- Count range: 1-10,000 per session
- Date range: Cannot enter future dates
- Quick-add buttons (33, 100) deferred to v1.1

**Goals**:
- Period types: daily, weekly, monthly, custom date range
- One active goal per zikr per period type
- Goals cannot overlap (conflicting periods)

**Streaks**:
- Consecutive calendar days (not 24-hour periods)
- Streak freeze deferred to v1.1
- Streak breaks when gap > 1 day

---

## 3. User Needs and Pain Points

### 3.1 Primary User Needs

| User Need | Feature Solution |
|-----------|-----------------|
| "I want to track my physical tasbeeh use" | Manual Progress Entry |
| "I prefer dhikr not in the predefined list" | Custom Zikrs |
| "I need motivation to practice daily" | Streak Tracking + Reminders |
| "I want to see my progress over time" | Progress Visualization |
| "I have different goals for different dhikr" | Personalized Goal Setting |
| "I practice at night, not in the morning" | Flexible Scheduling |
| "I don't want to lose my data" | Export/Import + IndexedDB |
| "I use iOS and can't get notifications" | In-App Reminders (cross-platform) |

### 3.2 Pain Points Addressed

1. **Data Loss Anxiety** - Local persistence with export capability
2. **Platform Inequality** - In-app reminders work on both iOS and Android
3. **Rigid Tracking** - Manual entry accommodates all practice modes
4. **Lack of Customization** - Fully editable zikr lists
5. **No Progress Visibility** - Charts and streaks provide feedback

### 3.3 User Personas

**Persona 1: The Devoted Practitioner**
- Practices multiple times daily
- Uses physical tasbeeh primarily
- Values minimal friction
- Needs: Manual entry, streak tracking, detailed progress

**Persona 2: The Casual Practitioner**
- Practices when reminded
- Uses app counter exclusively
- Values encouragement and reminders
- Needs: Simple counter, reminders, streak gamification

**Persona 3: The Goal-Oriented User**
- Sets specific targets (e.g., 100 SubhanAllah daily)
- Tracks progress toward goals
- Values progress visualization
- Needs: Goal setting, progress charts, completion tracking

---

## 4. Acceptance Criteria

### 4.1 Epic 1: Foundation & Infrastructure

**Story 1.1: Project Setup**
- [ ] Vite dev server runs on localhost:5173
- [ ] TypeScript compiles without errors
- [ ] Tailwind classes work and are purged in production
- [ ] PWA is installable on mobile (manifest configured)
- [ ] Service worker is registered and caches assets
- [ ] Build fails if bundle exceeds 200KB gzipped

**Story 1.2: Data Layer**
- [ ] Database opens successfully on first app load
- [ ] All stores (zikrs, sessions, goals, streaks, settings) are defined
- [ ] TypeScript types exist for all entities
- [ ] Migrations run on app open before UI renders
- [ ] IndexedDB errors are handled gracefully
- [ ] Memory-only fallback shows persistent warning banner

**Story 1.3: State Management**
- [ ] Zustand stores update when IndexedDB changes
- [ ] liveQuery pattern is implemented for reactivity
- [ ] All CRUD operations are typed and tested

**Story 1.4: Routing & Layout**
- [ ] Navigation works between all 4 screens
- [ ] Bottom navigation bar is fixed at bottom (mobile-safe)
- [ ] Active tab is highlighted
- [ ] All touch targets are ≥ 44x44px

### 4.2 Epic 2: Core Features - Zikrs & Sessions

**Story 2.1: Zikr Management**
- [ ] Predefined zikrs appear on first launch (SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah)
- [ ] Users can add custom zikrs (character limit: 50)
- [ ] Custom zikrs show "custom" badge
- [ ] Custom zikrs can be edited and deleted
- [ ] Delete shows cascade prompt: "Keep sessions or delete all?"
- [ ] Predefined zikrs cannot be edited/deleted
- [ ] Duplicate zikr names are prevented

**Story 2.2: Tasbeeh Counter**
- [ ] Large count display centered on screen
- [ ] Tapping lower half increments counter
- [ ] Haptic feedback on each tap (mobile only)
- [ ] Long-press (1s) shows reset confirmation
- [ ] Reset only clears current session, not saved sessions
- [ ] Session auto-saves when target reached (33, 100) OR app closes
- [ ] Counter state restores on app open if not saved
- [ ] Zikr selector shows all active zikrs

**Story 2.3: Manual Progress Entry**
- [ ] Modal opens with zikr selector, count input, date/time pickers
- [ ] Date/time defaults to current moment
- [ ] Future dates cannot be selected
- [ ] Count range is 1-10,000
- [ ] Session saves with `source: 'manual'`
- [ ] All dates use device local time (no timezone conversion)
- [ ] Empty state shows "Create a zikr first" if no zikrs exist

### 4.3 Epic 3: Goals & Streaks

**Story 3.1: Goal Management**
- [ ] Goals can be created with period: daily, weekly, monthly, custom
- [ ] Custom goals allow start/end date selection
- [ ] Progress bar shows current count vs target
- [ ] Status badge shows: active, paused, completed
- [ ] Goals can be paused/resumed
- [ ] Goals auto-mark completed when target reached
- [ ] Celebration animation shows on completion

**Story 3.2: Streak Tracking**
- [ ] Current streak shows on counter and progress screens
- [ ] Streak badge format: "🔥 5 day streak" (or "🔥 5")
- [ ] Long-press shows longest streak
- [ ] Streak increments only when date changes (not same day)
- [ ] Streak resets when gap > 1 day
- [ ] Longest streak updates if current streak exceeds it
- [ ] Streak updates after every session save

### 4.4 Epic 4: Progress, Settings & Polish

**Story 4.1: Progress Visualization**
- [ ] Progress screen shows daily summary with total count
- [ ] Weekly bar chart shows last 7 days
- [ ] Today's bar is highlighted
- [ ] Active goals show with progress bars
- [ ] Empty state shows "Start practicing to see your progress"
- [ ] Charts use simple HTML/CSS (no external library)

**Story 4.2: Settings & Configuration**
- [ ] Dark mode toggle persists in settings
- [ ] Dark mode applies `dark` class to HTML element
- [ ] Export button downloads JSON with all data
- [ ] Import button accepts .json files
- [ ] Import validates JSON structure before loading
- [ ] Import clears existing data with confirmation
- [ ] Platform limitations section explains iOS reminder constraints
- [ ] App info section shows version

**Story 4.3: Polish & Accessibility**
- [ ] All interactive elements meet WCAG 2.1 AA
- [ ] Touch targets are ≥ 44x44px
- [ ] Icon-only buttons have aria-labels
- [ ] Color contrast is ≥ 4.5:1 for text
- [ ] Animations are smooth and subtle (spiritual app aesthetic)
- [ ] Screen reader can navigate all screens

**Story 4.4: Performance Optimization**
- [ ] First Contentful Paint < 1.5s (mobile 4G)
- [ ] Time to Interactive < 3s (mobile 4G)
- [ ] Bundle size < 200KB gzipped
- [ ] Lighthouse audit passes all performance checks
- [ ] React.memo profiling documented (components needing memo)

### 4.5 Epic 5: Testing & Documentation

**Story 5.1: Testing**
- [ ] Vitest runs successfully
- [ ] All service functions have unit tests
- [ ] Core components have tests
- [ ] Edge cases are covered (empty data, cascade delete, same-day streak)

**Story 5.2: Documentation**
- [ ] README includes setup instructions
- [ ] Architecture doc is updated with final decisions
- [ ] Data flow is documented
- [ ] Migration strategy is specified

---

## 5. Edge Cases to Consider

### 5.1 Data Layer Edge Cases

| Scenario | Handling |
|----------|----------|
| IndexedDB quota exceeded | Show user guidance to clear data or export |
| User denies IndexedDB permission | Memory-only fallback with persistent warning |
| Database version conflict | Run migrations on app open with progress indicator |
| Corrupted data | Export available for manual recovery |
| Import invalid JSON | Validate structure before loading, show error |

### 5.2 User Interaction Edge Cases

| Scenario | Handling |
|----------|----------|
| User deletes zikr with active sessions | Prompt: "Keep sessions or delete all?" |
| User enters future date in manual entry | Prevent selection, show error |
| User sets goal with end date in past | Prevent creation, show error |
| User pauses goal, then completes it | Mark completed, cannot resume |
| Streak gap exactly 24 hours | Use calendar days, not 24-hour periods |
| Multiple sessions same day | Streak increments once (same day check) |
| Counter at 0, user taps | Increment to 1, haptic feedback |

### 5.3 Platform Edge Cases

| Scenario | Handling |
|----------|----------|
| iOS Safari (no background reminders) | In-app reminders only, documented in settings |
| Android (supports Web Push) | Same in-app reminders for v1 consistency |
| PWA not installed | All features work, prompts to install |
| Service worker update failure | Auto-update on next open, user notified |
| Offline mode | All features work, no network calls in v1 |
| Device with no vibration | Haptic feedback fails silently |

### 5.4 Performance Edge Cases

| Scenario | Handling |
|----------|----------|
 | Large zikr list (100+ items) | Virtualized list or pagination |
| Many sessions (10,000+) | Lazy load by date range |
| Slow device | Progressive rendering, show skeleton |
| Bundle size limit exceeded | Build fails, developer notified |

---

## 6. Constraints

### 6.1 Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **$0/month operational cost** | No backend, all local data | IndexedDB for storage, no API calls |
| **PWA platform** | iOS notification limitations | In-app reminder center for all platforms |
| **Offline-first** | No network dependency | All features work offline |
| **Bundle size < 200KB gzipped** | Limited dependencies | Tree-shake, code splitting, minimal libraries |
| **Mobile-first** | Desktop secondary | Thumb-zone design, touch-first UI |
| **IndexedDB storage** | No sync across devices | Export/import for backup only |

### 6.2 Business Constraints

| Constraint | Impact |
|------------|--------|
| **No revenue in v1** | Focus on user value, not monetization |
| **No team scaling planned** | Keep architecture simple, maintainable |
| **Community-driven roadmap** | Future features based on user feedback |

### 6.3 UX Constraints

| Constraint | Impact |
|------------|--------|
| **Spiritual context** | Calm, minimal aesthetic, no gamification overkill |
| **Accessibility (WCAG 2.1 AA)** | Minimum contrast, screen reader support |
| **Touch targets ≥ 44x44px** | Mobile usability requirement |
| **Dark mode required** | System-wide toggle capability |

### 6.4 Platform Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **iOS: No scheduled local notifications** | Cannot do background reminders | In-app reminder center |
| **iOS: Alarm API not supported in Safari** | No reliable snooze | Transparent communication |
| **PWA: No home screen widget** | No at-a-glance progress | Install as app, open to see |
| **PWA: Background tasks limited** | Reminders require app open | Cross-platform in-app system |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse (mobile 4G) |
| Time to Interactive | < 3s | Lighthouse (mobile 4G) |
| Bundle size (gzipped) | < 200KB | bundlesize CI check |
| Counter tap latency | < 50ms | Perceived responsiveness |

### 7.2 Reliability

| Metric | Target |
|--------|--------|
| Crash-free sessions | > 99% |
| Data persistence | 100% (IndexedDB) |
| Offline functionality | 100% (no network calls) |

### 7.3 Usability

| Metric | Target |
|--------|--------|
| Touch target size | ≥ 44x44px |
| Color contrast ratio | ≥ 4.5:1 (text) |
| Screen reader compatible | 100% of features |
| Learning curve | < 5 minutes to first zikr |

### 7.4 Maintainability

| Metric | Target |
|--------|--------|
| Test coverage | > 80% (services) |
| Code documentation | All public functions documented |
| Type coverage | 100% (TypeScript) |

---

## 8. Data Requirements

### 8.1 Data Storage

**Technology**: IndexedDB (via Dexie.js)
**Database Name**: `zikr-db`
**Version**: 1

### 8.2 Data Entities

**Zikr**
- `id`: string (auto-increment)
- `name`: string (max 50 chars)
- `custom`: boolean
- `createdAt`: Date
- `deletedAt`: Date (optional, soft delete)

**Session**
- `id`: string (auto-increment)
- `zikrId`: string (foreign key)
- `count`: number (1-10,000)
- `source`: 'app' | 'manual' | 'physical'
- `timestamp`: Date
- `date`: Date (denormalized YYYY-MM-DD)

**Goal**
- `id`: string (auto-increment)
- `zikrId`: string (foreign key)
- `targetCount`: number
- `period`: 'daily' | 'weekly' | 'monthly' | 'custom'
- `startDate`: Date
- `endDate`: Date (optional)
- `status`: 'active' | 'completed' | 'paused'
- `createdAt`: Date

**Streak**
- `zikrId`: string (foreign key)
- `currentStreak`: number
- `longestStreak`: number
- `lastSessionDate`: Date
- `lastProcessedDate`: Date (prevents same-day increments)

**Settings**
- `key`: string (primary key)
- `value`: any

### 8.3 Data Privacy

- All data is stored locally on device
- No data transmission to external servers
- Export/import is user-controlled
- No analytics or tracking in v1

---

## 9. Platform Requirements

### 9.1 Supported Platforms

| Platform | Support Level | Notes |
|----------|---------------|-------|
| Android Chrome | Full | All features supported |
| iOS Safari | Full | In-app reminders only |
| Desktop Chrome | Full | Mobile design, desktop usable |
| Desktop Firefox/Safari | Full | PWA installable |

### 9.2 PWA Requirements

- Service worker registered and caching assets
- Web manifest configured with icons, colors, name
- Installable on mobile (add to home screen)
- Works offline (no network calls in v1)
- HTTPS required for production

---

## 10. Success Metrics

### 10.1 v1 Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| PWA installable | Yes | Manual test |
| Offline functional | Yes | Manual test |
| Bundle size < 200KB | Yes | CI check |
| All core features working | Yes | Test coverage |
| Accessibility (WCAG AA) | Yes | Lighthouse audit |
| Performance targets met | Yes | Lighthouse audit |

### 10.2 User Success Indicators (Post-Launch)

| Indicator | Target | Measurement |
|-----------|--------|-------------|
| Users with custom zikrs | > 50% | Analytics (v2) |
| Users with manual entries | > 30% | Analytics (v2) |
| Active streaks (7+ days) | > 20% | Analytics (v2) |
| Return rate (week 2) | > 40% | Analytics (v2) |

---

## 11. Open Questions (Deferred to v1.1)

1. **Reminder frequency**: Daily vs customizable times?
2. **Streak freeze**: Allow pausing streaks for travel/illness?
3. **Analytics granularity**: What level of detail for progress charts?
4. **Quick-add pattern**: Should manual entry have 33/100 buttons?
5. **Onboarding**: Tutorial for first-time users?

---

## 12. Appendix

### 12.1 Predefined Zikrs (v1)

1. **SubhanAllah** ( Glory be to Allah)
2. **Alhamdulillah** ( All praise is due to Allah)
3. **Allahu Akbar** ( Allah is the greatest)
4. **La ilaha illallah** ( There is no deity but Allah)

### 12.2 Target Count Reference

Common tasbeeh targets:
- **33** - After each prayer (sunna)
- **100** - General dhikr
- **1,000** - Extended sessions

### 12.3 Glossary

- **Zikr/Dhikr**: Remembrance of Allah through recitation
- **Tasbeeh**: Prayer beads used for counting recitations
- **Streak**: Consecutive days of practice
- **IndexedDB**: Browser-based database for local storage

---

*This requirements specification incorporates feedback from architecture review, requirements review, and ADR review. All v1 features are defined with clear acceptance criteria and edge case handling.*
