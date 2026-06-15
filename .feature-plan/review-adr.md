# Architecture Review: Zikr PWA ADRs

## Status: APPROVED WITH NOTES

## Decision Summary

Reviewing three ADRs for the Zikr PWA project:
- **ADR 001:** Tech Stack Selection (React + Vite + Zustand + Dexie.js + Tailwind)
- **ADR 002:** Offline-First Architecture with IndexedDB
- **ADR 003:** PWA Strategy with iOS Limitations

---

## Assessment

### Strengths

1. **Well-structured** - All ADRs follow consistent format with clear sections
2. **Context-rich** - Each decision establishes clear context and constraints
3. **Alternatives thoroughly considered** - 4-5 alternatives per ADR with pros/cons
4. **Trade-offs explicit** - Positive and negative consequences well documented
5. **Cross-referenced** - ADRs reference each other appropriately
6. **Implementation notes included** - Concrete examples and code snippets provided

### Concerns

#### Low Severity

1. **ADR 001 - Bundle size monitoring not specific**
   - **Issue:** "Monitor bundle size with npm run build" is vague
   - **Impact:** May exceed 200KB target without automated checks
   - **Suggestion:** Add CI check or bundlephobia threshold in package.json

2. **ADR 001 - React.memo placement**
   - **Issue:** "Use React.memo on Counter component" - Counter only?
   - **Impact:** Other components may also need optimization
   - **Suggestion:** Document profiling approach to identify which components need memo

3. **ADR 002 - Migration timing not specified**
   - **Issue:** Migration strategy shown but not WHEN migrations happen
   - **Impact:** User data could be lost if migration fails mid-process
   - **Suggestion:** Document migration timing (on app open, with progress indicator)

4. **ADR 002 - Memory-only fallback risks**
   - **Issue:** "Fallback to memory-only mode" without clear warning UX
   - **Impact:** Users may not understand data is ephemeral
   - **Suggestion:** Specify persistent warning banner in memory-only mode

5. **ADR 003 - Browser Alarm API support**
   - **Issue:** "Snooze using browser Alarm API" - not supported in Safari
   - **Impact:** Snooze won't work on iOS (already limited)
   - **Suggestion:** Clarify this limitation in implementation notes

6. **ADR 003 - Android Web Push API deferred**
   - **Issue:** Android reminders mentioned as "future v1.1"
   - **Impact:** v1 has no reminders on ANY platform
   - **Suggestion:** Clarify v1 scope: in-app reminders only, cross-platform

### Missing Considerations

1. **Streak calculation timezone** - Not mentioned in ADR 002
   - Local vs UTC time handling affects streak accuracy
   - Recommendation: Specify device local time consistently

2. **Data schema versioning** - Not in ADR 002
   - How to handle schema changes in production
   - Recommendation: Add version increment strategy

### Alternatives to Consider

1. **ADR 001 - Signals API instead of Zustand**
   - Emerging pattern for reactive state
   - Smaller footprint, integrates with Preact/Svelte
   - Could be mentioned as "future consideration"

2. **ADR 002 - OPFS (Origin Private File System)**
   - Newer API for file-like storage
   - Better performance for large datasets
   - Not mentioned (appropriately - too new for production)

3. **ADR 003 - Badging API for iOS**
   - iOS supports app badge updates on PWAs
   - Could show streak count as badge number
   - Small win for user engagement

---

## Long-term Implications

### Maintenance Burden
- **Low** - All choices are mainstream, well-supported
- React, Vite, Dexie.js have active communities
- Tailwind has long-term stability

### Scalability Concerns
- **IndexedDB** - Scales well for text data, unlikely to hit limits
- **Zustand** - No inherent scalability limits
- **Service Worker** - Cache size limits (~50MB on iOS) - monitor

### Migration Complexity
- **IndexedDB migrations** - Can be complex, need careful testing
- **PWA updates** - Service worker update strategy needs user communication
- **Future cloud sync** - Would require new ADR for v2

### Team Impact
- **Onboarding** - Familiar stack reduces learning curve
- **Hiring** - React developers abundant
- **Code reviews** - TypeScript enables easier reviews

---

## Recommendations

### Proceed with Implementation

All three ADRs are **APPROVED**. Address the 6 concerns above before or during implementation:

1. Add bundle size CI check (ADR 001)
2. Document profiling approach for React.memo (ADR 001)
3. Specify migration timing and UX (ADR 002)
4. Design memory-only mode warning banner (ADR 002)
5. Clarify Alarm API limitation on iOS (ADR 003)
6. Clarify v1 reminder scope: in-app only (ADR 003)

### Add to Implementation Notes

```markdown
### Timezone Handling
All dates use device local time consistently. Streaks calculated based on
user's local calendar day, avoiding timezone confusion for travelers.

### Bundle Size CI Check
Add to package.json:
```json
"scripts": {
  "size-check": "bundlesize"
}
```

### Migration Timing
Migrations run on app open before UI renders. Show progress bar if
migration takes >100ms.
```

### Future ADRs to Consider

- **ADR 004:** Cloud sync architecture (for v2)
- **ADR 005:** Analytics and privacy approach
- **ADR 006:** Audio/tasbeeh sounds feature

---

## Summary

**Overall Assessment:** Excellent architectural decisions well-documented.

The three ADRs demonstrate thoughtful consideration of constraints, alternatives, and trade-offs. The tech stack is pragmatic for a personal project, the offline-first approach is sound, and the PWA strategy acknowledges platform limitations honestly.

**Not blocking for implementation** - Address the 6 concerns above as part of implementation or as minor ADR updates.

**Recommended action:** Proceed to task breakdown and implementation.
