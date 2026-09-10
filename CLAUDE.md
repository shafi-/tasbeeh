# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**Zikr** is a Progressive Web App (PWA) for Islamic dhikr practice. Core differentiators: custom zikr lists, manual progress entry (for physical tasbeeh), and personalized goals.

## Key Constraints

- **$0/month operational cost** - No backend, all local data (IndexedDB)
- **Mobile-first design** - Thumb-zone interaction, haptic feedback, dark mode
- **Offline-first** - Service worker, no network calls in v1
- **Bundle size limit**: 200KB gzipped (configured in bundlesize)

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **State:** Zustand + Dexie.js (IndexedDB)
- **UI:** Tailwind CSS
- **PWA:** vite-plugin-pwa
- **Testing:** Vitest + happy-dom

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:5173)
npm run build           # Production build (tsc + vite)
npm run preview         # Preview production build

# Testing
npm run test            # Run Vitest tests
npm run test:ui         # Vitest UI mode
npm run test:watch      # Watch mode

# Linting & Quality
npm run lint            # ESLint
npm run size-check      # Verify bundle size against 200KB limit
```

## Architecture

### Data Layer (Dexie.js + IndexedDB)

**Database:** `zikr-db` with versioned schema (currently v2)

**Stores:** zikrs, sessions, goals, streaks, settings, sessionFormState, zikrLastCount

**Type definitions:** `src/core/db/types.ts` - defines all interfaces

**Migrations:** `src/core/db/migrations.ts` - versioned upgrade logic

**Pattern:** Database operations are wrapped in transactions for data integrity:
```typescript
await db.transaction('rw', db.sessions, db.streaks, db.goals, async () => {
  // Multiple operations in single transaction
  await db.sessions.add(session);
  await updateStreak(session.zikrId, session.date);
});
```

### Service Layer

**Location:** `src/core/services/`

**Pattern:** Each domain has a service file with CRUD operations and business logic:

- `zikrService.ts` - Zikr CRUD with soft delete
- `sessionService.ts` - Session CRUD with auto-updating streaks/goals
- `streakService.ts` - Streak calculation and recalculation
- `goalService.ts` - Goal progress tracking
- `migrationService.ts` - Database version migrations
- `progressiveSaveService.ts` - Chunked bulk operations
- `exportService.ts` - JSON backup/restore
- `errorRecovery.ts` - Retryable subscriptions with exponential backoff

**Key pattern:** Services export both named functions and a service object:
```typescript
export async function add(...) { ... }
export const sessionService = { add, update, delete };
```

### State Layer (Zustand)

**Location:** `src/core/stores/`

**Pattern:** Zustand stores with Dexie `liveQuery()` for reactive updates:

```typescript
const unsubscribe = createRetryableSubscription(
  () => db.zikrs.toArray(),
  (zikrs) => set({ zikrs, loading: false }),
  (error) => set({ error, loading: false })
);
```

**Stores:**
- `zikrStore.ts` - Zikr list
- `sessionStore.ts` - Active session state
- `sessionHistoryStore.ts` - Session list with filters
- `sessionFormStore.ts` - Manual entry form state
- `goalStore.ts` - Goal list
- `streakStore.ts` - Streak data
- `settingsStore.ts` - App settings
- `uiStore.ts` - Modal states

**Error recovery:** All liveQuery subscriptions use `createRetryableSubscription()` with configurable retry logic.

### Directory Structure

```
src/
├── core/           # Business logic layer
│   ├── db/         # IndexedDB schema and migrations
│   ├── services/   # Domain services
│   ├── stores/     # Zustand state
│   ├── utils/      # Core utilities (date formatting, etc.)
│   └── components/ # Shared UI components (ErrorBoundary, etc.)
├── features/       # Feature-specific code (sessions/)
├── pages/          # Static HTML design mockups (not part of the build)
├── hooks/          # Custom React hooks
└── utils/          # Shared utilities (validation, etc.)
src-v2/             # The UI layer ("Noor" design system)
├── components/     # navigation/, cards/, progress/, forms/, decor/, modals
├── pages/          # Route pages (Home, Counter, Goals, Progress, Settings)
├── hooks/          # useRipple, useHaptic
├── types/          # Component prop types
└── utils/          # zikrMapping (Arabic text, translations, targets)
```

### UI: "Noor" Design System (src-v2/)

The only UI. Refined Islamic identity: deep emerald + gold on warm parchment (light) / deep green-black (dark).

- **Theme tokens:** CSS variables in `src/index.css` (`--color-*`), mapped in `tailwind.config.js` with `<alpha-value>`; the `.dark` class swaps every token, so semantic classes (`bg-surface`, `text-primary`) are dark-mode aware automatically
- **Typography:** Plus Jakarta Sans (headlines), Source Sans 3 (body), Amiri (`font-display-arabic`) for Arabic script — always pair Arabic text with `lang="ar" dir="rtl"`
- **Signature elements:** `PatternBackdrop` (khatam star pattern), `OrnamentDivider` (gold star divider), arch-topped cards (`rounded-t-full` mihrab niches), gold-on-green active nav pill
- **Buttons:** use `bg-primary-container text-on-primary` (works in both themes); `bg-primary` is a text-grade token in dark mode
- **Dark mode:** `darkMode: 'class'`; `App.tsx` syncs the `.dark` class from the settings store + system preference

## Development Notes

- **Date handling:** Always use `dateUtils.ts` helpers - dates are normalized to midnight for "date" fields
- **Streaks:** Track consecutive days - critical for user retention. Use `streakService.updateForSession()` after any session change
- **Transactions:** Wrap related DB operations in `db.transaction()` to ensure atomicity
- **Soft delete:** Zikrs use `deletedAt` timestamp, never hard delete in production code
- **Session editing:** Sessions are editable for 3 days after creation (`editableUntil` field)
- **iOS limitations:** No scheduled local notifications - use in-app notification center
- **Manual progress:** Core differentiator - users track physical tasbeeh sessions
- **Testing:** Utilities are well-tested. Use happy-dom for DOM tests, keep tests pure unit tests when possible

## Project Context

See **docs/architecture.md** for complete data schema and architecture diagrams.
See **docs/Tasks.md** for v1 task breakdown across 5 epics.
See **docs/Idea.md** for problem statement and target users.
