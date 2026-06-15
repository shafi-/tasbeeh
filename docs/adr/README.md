# Architecture Decision Records

Significant architectural decisions made for the Zikr PWA project.

## Format

Each ADR follows the standard format:
- **Status:** Proposed, Accepted, Deprecated, or Superseded
- **Context:** Why the decision was needed
- **Decision:** What was chosen
- **Consequences:** Positive, negative, and risks
- **Alternatives:** What else was considered and why not chosen

## Index

| NBR | Title | Status | Date |
|-----|-------|--------|------|
| 001 | Tech Stack Selection | Accepted | 2026-06-15 |
| 002 | Offline-First Architecture with IndexedDB | Accepted | 2026-06-15 |
| 003 | PWA Strategy with iOS Limitations | Accepted | 2026-06-15 |

## ADR Status Definitions

- **Proposed:** Under consideration, not yet implemented
- **Accepted:** Decision made, implementation in progress or complete
- **Deprecated:** No longer recommended for new solutions
- **Superseded:** Replaced by a newer decision

## When to Create an ADR

**Create ADRs for:**
- ✅ Tech stack choices (frameworks, libraries, tools)
- ✅ Architectural patterns (state management, data flow)
- ✅ Significant trade-offs with clear alternatives
- ✅ Reversible decisions that could be changed
- ✅ Decisions affecting multiple developers

**Don't create ADRs for:**
- ❌ Implementation details
- ❌ Temporary decisions
- ❌ Coding standards (use CLAUDE.md)
- ❌ Obvious choices with no real alternative

## Process

1. **Propose** - Create ADR with "Proposed" status
2. **Discuss** - Review with team/stakeholders
3. **Accept** - Change status to "Accepted"
4. **Implement** - Build according to decision
5. **Review** - Periodically review if still applicable

## Template

```markdown
# ADR {NNN}: {Title}

**Status:** Accepted | Proposed | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** Team/Individual

## Context
{What is the issue that we're seeing?}

## Decision
{What is the change that we're proposing?}

## Consequences
- **Positive:** {What becomes easier?}
- **Negative:** {What becomes more difficult?}
- **Risks:** {What are the potential risks?}

## Alternatives Considered
1. **{Alternative}**
   - {Pros/Cons}
   - {Why not chosen}

## Related Decisions
- ADR XXX: {Related decision}

## Implementation Notes
{Any notes for implementation}
```

## Related Documentation

- **Architecture:** See [../architecture.md](../architecture.md) for full technical architecture
- **Requirements:** See [../Idea.md](../Idea.md) for product requirements
- **Tasks:** See [../Tasks.md](../Tasks.md) for implementation breakdown
