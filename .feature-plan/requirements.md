# Requirements: Zikr PWA

## Overview
A Progressive Web App for Islamic dhikr practice with customizable goals, progress tracking, and reminders.

## Core Differentiators
1. **Custom Zikrs** - Users can add, edit, delete personal zikr lists
2. **Manual Progress Entry** - Log sessions from physical tasbeeh or offline
3. **Personalized Goals** - Daily, weekly, monthly, or custom date range targets

## Technical Decisions (Resolved)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React + Vite | Familiar, good PWA support via vite-plugin-pwa |
| State Management | Zustand + Dexie.js | Simple state library with IndexedDB persistence |
| CSS | Tailwind CSS | Fast development, can tree-shake to optimize bundle |
| Predefined Zikrs | Include common ones | SubhanAllah, Alhamdulillah, Allahu Akbar, La ilaha illallah |

## Constraints
- **$0/month operational cost** - No backend in v1
- **Offline-first** - All data local (IndexedDB)
- **PWA requirements** - Service worker, manifest, Web Push API (Android)
- **Bundle size target** - < 200KB gzipped
- **Mobile-first design** - Thumb-zone interaction, haptic feedback

## v1 Features (P0-P1)

### 1. Custom Zikrs
- Add, edit, delete personal zikr lists
- Predefined zikrs included (can be deleted)
- zikr name only (no translation/ transliteration in v1)

### 2. Manual Progress Entry
- Log sessions done with physical tasbeeh
- Enter count manually (e.g., 33, 100)
- Select date/time (default: now)
- Source tracking: 'app' | 'manual' | 'physical'

### 3. Tasbeeh Counter
- Interactive counter with haptic feedback
- Tap to increment (thumb-zone optimized)
- Reset button (long-press or confirmation)
- Minimal friction for devoted practitioners

### 4. Goal Setting
- Daily, weekly, monthly, or custom date range goals
- Per-zikr goals (user can set different targets for different zikr)
- Active/paused/completed status

### 5. Streaks
- Track consecutive days of practice
- Current streak and longest streak
- Streak calculation: broken if gap > 1 day

### 6. Progress Visualization
- See growth over time
- Simple charts/daily summary
- Goal progress indication

### 7. Reminders
- Android: Web Push API notifications
- iOS: In-app notification center (transparent about limitations)
- Best-effort delivery (no background tasks on iOS)

## Data Schema

```javascript
// IndexedDB: zikr-db v1
Zikr { id, name, custom, createdAt, deletedAt }
Session { id, zikrId, count, source, timestamp, date }
Goal { id, zikrId, targetCount, period, startDate, endDate, status, createdAt }
Streak { zikrId, currentStreak, longestStreak, lastSessionDate }
Settings { key, value }
```

## Platform Tradeoffs (Accepted)
- iOS: No scheduled local notifications
- iOS: No background tasks
- No home screen widget
- Mitigation: In-app notification center + transparent communication

## Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Touch targets: 44x44px minimum
- Color contrast: 4.5:1

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 200KB gzipped
- Tap to counter increment: < 50ms perceived latency
