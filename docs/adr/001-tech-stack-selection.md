# ADR 001: Tech Stack Selection

**Status:** Accepted
**Date:** 2026-06-15
**Deciders:** Project Lead

## Context

Zikr is a Progressive Web App (PWA) for Islamic dhikr practice. Key constraints:
- **$0/month operational cost** - No backend infrastructure
- **Offline-first** - Must work without network
- **Mobile-first** - Thumb-zone interaction, haptic feedback
- **Bundle size target** - < 200KB gzipped for PWA installs
- **Personal project** - Maintainability and ease of development

## Decision

Chosen tech stack:
- **Framework:** React + Vite + TypeScript
- **State Management:** Zustand
- **Data Persistence:** Dexie.js (IndexedDB wrapper)
- **UI:** Tailwind CSS
- **PWA:** vite-plugin-pwa

## Consequences

### Positive
- **Ecosystem maturity** - React has largest ecosystem, easy to find solutions
- **Developer familiarity** - Common stack, easy to hire/maintain
- **Type safety** - TypeScript prevents runtime errors
- **Fast development** - Vite HMR, Tailwind utility classes
- **PWA support** - vite-plugin-pwa handles service worker and manifest

### Negative
- **Bundle size** - React runtime ~40KB, requires tree-shaking vigilance
- **Over-engineering risk** - Zustand may be overkill for this scale (could use React Context)
- **Tailwind size** - Full Tailwind is ~80KB, needs purge configuration

### Risks
- **Bundle size creep** - Must monitor and optimize to stay under 200KB target
- **React re-renders** - Need React.memo on counter to prevent lag

## Alternatives Considered

### 1. Svelte + Vite
**Pros:**
- Smallest bundle (~20KB runtime)
- Better performance (no VDOM)
- Built-in reactivity

**Cons:**
- Smaller ecosystem
- Less familiar to most developers
- Fewer PWA examples

**Why not chosen:** Ecosystem maturity and familiarity were prioritized over bundle savings

### 2. Vue + Vite
**Pros:**
- Smaller than React (~30KB runtime)
- Good reactivity system
- Simpler learning curve

**Cons:**
- Less familiar than React
- Smaller job market

**Why not chosen:** React chosen for ecosystem and familiarity

### 3. Vanilla + Vite
**Pros:**
- Smallest possible bundle
- Full control, no framework overhead

**Cons:**
- No component reusability
- Manual state management
- Harder to maintain

**Why not chosen:** Development speed and maintainability prioritized

### 4. Redux instead of Zustand
**Pros:**
- Larger ecosystem, more middleware
- More familiar to many

**Cons:**
- More boilerplate
- Overkill for this app's complexity
- Larger bundle size

**Why not chosen:** Zustand provides same benefits with less boilerplate

### 5. Custom CSS instead of Tailwind
**Pros:**
- Zero dependencies
- Full control
- Smallest possible CSS

**Cons:**
- Slower development
- Need to build design system from scratch

**Why not chosen:** Development speed prioritized, Tailwind can be purged

## Related Decisions

- ADR 002: Offline-First Architecture with IndexedDB
- ADR 003: PWA Strategy with iOS Limitations

## Implementation Notes

- Configure `vite-plugin-pwa` with auto-update strategy
- Set up Tailwind purge in `tailwind.config.js`
- Use React.memo on Counter component
- Monitor bundle size with `npm run build`
