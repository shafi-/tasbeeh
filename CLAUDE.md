# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**Zikr** is a Progressive Web App (PWA) for Islamic dhikr practice. Core differentiators: custom zikr lists, manual progress entry (for physical tasbeeh), and personalized goals.

## Key Constraints

- **$0/month operational cost** - No backend, all local data (IndexedDB)
- **Mobile-first design** - Thumb-zone interaction, haptic feedback, dark mode
- **Offline-first** - Service worker, no network calls in v1

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **State:** Zustand + Dexie.js (IndexedDB)
- **UI:** Tailwind CSS
- **PWA:** vite-plugin-pwa

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:5173)
npm run build           # Production build
npm run preview         # Preview production build

# Testing (when implemented)
npm run test            # Run Vitest tests
npm run test:ui         # Vitest UI mode

# Linting
npm run lint            # ESLint
```

## Architecture & Data Model

See **docs/architecture.md** for:
- Complete data schema (IndexedDB stores: zikrs, sessions, goals, streaks, settings)
- Service layer patterns (Dexie.js + Zustand integration)
- Streak calculation logic
- Notification architecture (PWA constraints)

## Implementation Tasks

See **docs/Tasks.md** for the complete v1 task breakdown across 5 epics.

## Project Context

See **docs/Idea.md** for:
- Problem statement and target users
- Feature breakdown (v1 core vs future)
- Platform strategy and tradeoffs

## Development Notes

- All data persists locally via IndexedDB (Dexie.js)
- Stores use Dexie's `liveQuery()` for reactive updates
- Streaks track consecutive days - critical for retention
- Manual progress entry is a core differentiator (users track physical tasbeeh)
- iOS has no scheduled local notifications - mitigation: in-app notification center
