## What is it?

A PWA that helps users practice zikr (dhikr) with customizable goals, progress tracking, and reminders. Unlike existing apps that only track in-app taps, Zikr allows custom dhikr lists and manual progress entry for offline/physical tasbeeh sessions.

## Problem Statement

Existing tasbeeh apps have three critical gaps:

1. **No customization** - Users can only choose from predefined zikr lists, not add their own preferred dhikr
2. **App-only tracking** - Progress only counts in-app taps, not physical tasbeeh or offline sessions
3. **One-size-fits-all** - No personalized plans that adapt to individual spiritual goals

Zikr solves all three: custom zikrs, manual progress entry, and personalized goal tracking.

## Target Users

**Mixed audience approach:** The app adapts to different practitioner levels:
- **Casual practitioners** - Need reminders, simple tracking, encouragement
- **Devoted practitioners** - Track high volume, detailed analytics, minimal friction
- **New converts/learners** - Guided content, educational context (future feature)

## Features

### v1 Core (P0-P1)

- [ ] **Custom Zikrs** - Add, edit, delete personal zikr lists (core differentiator)
- [ ] **Manual Progress Entry** - Log sessions done with physical tasbeeh or offline (core differentiator)
- [ ] **Tasbeeh Counter** - Interactive counter with haptic feedback
- [ ] **Goal Setting** - Daily, weekly, monthly, or custom date range goals
- [ ] **Streaks** - Track consecutive days for habit formation (retention critical)
- [ ] **Progress Visualization** - See growth over time
- [ ] **Reminders** - Android (Web Push) + in-app notifications for iOS (best-effort)

### v1.1 (P2)

- [ ] **Context Suggestions** - Recommend zikrs based on date, time, special days
- [ ] **Analytics/Trends** - Best day of week, monthly summaries

### Future (v2+)

- [ ] Community/social features
- [ ] Audio/tasbeeh sounds
- [ ] Educational content for new learners
- [ ] Cloud sync (currently local-only)

## Platform Strategy

**PWA (Progressive Web App)** - Chosen for:
- ✅ No app store approval, instant updates
- ✅ Works on any device with a browser
- ✅ Lower development cost

**Tradeoffs accepted:**
- ❌ iOS notification limitations (no scheduled local notifications)
- ❌ No background tasks (must keep browser tab open for reminders)
- ❌ No home screen widget

**Mitigation:** Web Push API (Android) + in-app notification center + transparent communication about iOS limitations
