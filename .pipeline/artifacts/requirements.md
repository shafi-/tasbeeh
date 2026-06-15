# Requirements: Epic 1 - Foundation & Infrastructure

**Epic**: Foundation & Infrastructure
**Source**: docs/Tasks.md (Epic 1, Stories 1.1-1.4)
**Status**: Ready for Architecture Design
**Date**: 2026-06-15

---

## Overview

Epic 1 establishes the foundational infrastructure for the Zikr PWA, including project setup, data layer, state management, and routing. This epic is a prerequisite for all subsequent epics.

---

## User Stories

### Story 1.1: Project Setup

**As a** developer
**I want** a properly configured React + Vite project
**So that** the team can start building features

**Acceptance Criteria**:
- React + Vite project created with TypeScript
- Tailwind CSS integrated and configured
- ESLint + Prettier configured
- PWA configured with vite-plugin-pwa
- Bundle size monitoring configured
- Git repository initialized

**Technical Requirements**:
- Use `create-vite` with TypeScript template
- Tailwind dark mode: `'class'` for manual toggle
- PWA: `registerType: 'autoUpdate'`
- Bundle threshold: 200KB gzipped
- ADR 003: Cross-platform PWA strategy
- ADR 001: Bundle size CI check
- Browser compatibility: Chrome/Edge 90+, Safari 14+, Firefox 88+ (last 18 months)
- Code splitting: Enables lazy loading for performance targets (FCP <1.5s verified in Epic 4)
- Responsive design: Desktop experience uses max-width container (640px), functional but not optimized in v1

---

### Story 1.2: Data Layer (IndexedDB + Dexie.js)

**As a** developer
**I want** a properly configured IndexedDB database
**So that** user data persists locally

**Acceptance Criteria**:
- Dexie.js configured with all stores
- TypeScript interfaces defined
- Database versioning strategy in place
- Migration timing specified (on app open with progress indicator)
- Error handling documented

**Technical Requirements**:
- Database name: `zikr-db` version 1
- Stores: `zikrs`, `sessions`, `goals`, `streaks`, `settings`
- ADR 002: IndexedDB as primary data store
- Migrations run on app open before UI renders
- Progress bar if migration takes >100ms
- Handle `quotaExceededError` with user guidance
- Memory-only fallback with persistent warning banner
  - **Banner Content**:
    - Error explanation (in simple terms): "Browser storage is not available. Your progress will be lost if you close the app."
    - Data risk warning: "All your data is temporary and will be deleted when you close this browser."
    - Action steps: "Try: 1) Use a different browser (Chrome/Firefox), 2) Clear browser storage, 3) Check browser permissions"
    - Link to platform strategy: See docs/Idea.md for browser recommendations
- Streak interface includes `lastProcessedDate` field (architecture review fix)
- Migration rollback: Migrations are transactional; failure rolls back to previous schema version, user notified to refresh app

---

### Story 1.3: State Management (Zustand)

**As a** developer
**I want** Zustand stores for app state
**So that** UI reacts to data changes

**Acceptance Criteria**:
- Core stores created and typed
- Integration with Dexie.js for live queries
- Sync pattern documented

**Technical Requirements**:
- Stores: zikrs, sessions, goals, UI state
- Use Dexie's `liveQuery()` for reactive updates
- Update store state when query returns new data
- Handle errors gracefully
- liveQuery error recovery: If liveQuery fails, retry up to 3 times with exponential backoff (1s, 2s, 4s), then show error state with retry button
- Architecture review fix: State synchronization pattern defined

---

### Story 1.4: Routing & Layout

**As a** user
**I want** to navigate between screens
**So that** I can access all features

**Acceptance Criteria**:
- React Router configured
- Bottom navigation bar (mobile)
- Screen components created

**Technical Requirements**:
- Use HashRouter for PWA compatibility
- Pages: Counter, Goals, Progress, Settings
- Bottom nav: 4 tabs with icons
- Touch targets ≥ 44x44px
- Fixed position at bottom (mobile-safe)
- Navigation structure enables accessibility (semantic HTML, ARIA labels added in Epic 4)
- Desktop experience: Uses max-width container (640px), functional but not optimized

---

## Implementation Order

**Recommended sequence** (per dependency chain):
1. Story 1.1 → Story 1.2 → Story 1.3 → Story 1.4
2. Within stories, complete tasks in dependency order

**Critical Path**:
```
1.1.1 → 1.1.2 → 1.1.3 → 1.1.4 → 1.2.1 → 1.2.2 → 1.2.3 → 1.2.4 → 1.3.1 → 1.3.2 → 1.3.3 → 1.4.1 → 1.4.2
```

---

## Constraints & Considerations

**Technical Constraints**:
- $0/month operational cost (no backend)
- Mobile-first design
- Offline-first (PWA service worker)
- All data local (IndexedDB)

**Platform Limitations**:
- iOS has no scheduled local notifications
- Safari Alarm API limitations (documented in settings)

**Internationalization**:
- v1 is English-only
- RTL (right-to-left) support for Arabic text deferred to v2+
- Layout structure enables future i18n (semantic HTML, no hardcoded strings in components)

**Architecture Decisions**:
- ADR 001: Bundle size monitoring (200KB threshold)
- ADR 002: IndexedDB over localStorage
- ADR 003: Cross-platform PWA strategy

---

## Existing Documentation

This epic leverages existing project documentation:
- `docs/architecture.md` - Complete data schema and service patterns
- `docs/Idea.md` - Problem statement and feature breakdown
- `CLAUDE.md` - Tech stack and development notes
- `docs/Tasks.md` - Detailed task breakdown (Tasks 1.1.1-1.4.2)

---

## Success Criteria

Epic 1 is complete when:
1. ✅ Development server runs on localhost:5173
2. ✅ All stores defined in IndexedDB
3. ✅ Zustand stores react to IndexedDB changes
4. ✅ Navigation works between 4 screens
5. ✅ PWA installable on mobile
6. ✅ Build passes and bundle < 200KB gzipped
7. ✅ All ADR requirements satisfied

---

## Notes from Reviews

**Architecture Review**:
- ✅ Streak calculation: Added `lastProcessedDate` to prevent same-day increments
- ✅ State sync: Use Dexie liveQuery pattern
- ✅ Migration timing: On app open with progress indicator
- ✅ Memory fallback: Persistent warning banner designed

**ADR Review**:
- ✅ Bundle size CI: Task 1.1.4 + Task 4.4.3
- ✅ Migration timing: Task 1.2.3 with progress
- ✅ Memory fallback: Task 1.2.4 warning UX

**Requirements Review - Iteration 1 (2026-06-15)**:
- ✅ Browser compatibility targets added (Story 1.1)
- ✅ Memory-only fallback UX detailed (Story 1.2)
- ✅ liveQuery error recovery strategy added (Story 1.3)
- ✅ Migration rollback plan specified (Story 1.2)
- ✅ Responsive design clarified (Stories 1.1, 1.4)
- ✅ i18n/RTL considerations documented
- ✅ Accessibility note added (Story 1.4)

---

## Open Questions

None - all questions resolved in prior reviews.

---

*Requirements synthesized from docs/Tasks.md Epic 1*
*All architecture review feedback integrated*
