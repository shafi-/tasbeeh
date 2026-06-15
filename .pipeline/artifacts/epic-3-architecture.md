# Architecture: Epic 3 - Goals & Streaks

**Epic**: Epic 3: Goals & Streaks
**Date**: 2026-06-15
**Status**: Draft
**Based on**: `.pipeline/artifacts/epic-3-requirements.md`
**Builds on**: Epic 1 (Foundation) + Epic 2 (Core Features)

---

## Architecture Overview

This epic extends Epic 1 + Epic 2 with motivational and tracking features. The architecture follows established patterns:
- **Feature-based structure**: Components grouped by story
- **Shared infrastructure**: Reuses Epic 1 + Epic 2 services/stores
- **State management**: Zustand stores with liveQuery
- **Data layer**: Dexie.js with existing schema
- **No new architectural decisions**: Builds on existing ADR 001, 002, 003

---

## Component Architecture

### High-Level Structure

```
src/
├── components/
│   ├── GoalList.tsx            # Story 3.1: View and manage goals
│   ├── AddGoalModal.tsx        # Story 3.1: Create goals
│   └── StreakBadge.tsx         # Story 3.2: Display streak with 🔥
├── services/
│   └── goalService.ts          # Story 3.1: Goal progress calculation (update)
├── pages/
│   ├── Goals.tsx                # Story 3.1: Goals screen (update placeholder)
│   ├── Counter.tsx             # Update: Add StreakBadge
│   └── Progress.tsx             # Update: Add goal progress section
└── utils/
    └── goalUtils.ts            # Story 3.1: Goal period calculations
```

### Component Hierarchy

```
App.tsx
└── HashRouter
    ├── Navigation (existing)
    └── Routes
        ├── / → Counter.tsx (update: add StreakBadge)
        ├── /goals → Goals.tsx (update: full implementation)
        ├── /progress → Progress.tsx (update: add goal section)
        └── /settings → Settings.tsx (placeholder)
```

---

## Data Flow Architecture

### Story 3.1: Goal Management Flow

```
User Action → Component → Service → IndexedDB → liveQuery → Store Update → UI Refresh
```

**Detailed Flow**:
1. **User opens Goals page**: Component loads from `goalStore.goals`
2. **User adds goal**: `AddGoalModal` → `goalService.add()` → IndexedDB → liveQuery → goalStore → GoalList updates
3. **Progress calculation**: Component → `goalService.calculateProgress()` → Filters sessions → Returns percentage
4. **User pauses goal**: Toggle → `goalService.updateStatus()` → IndexedDB → liveQuery → goalStore → GoalList updates
5. **Goal completion**: Session save → `goalService.checkCompletion()` → Updates status → Celebration

**State Sources**:
- Primary: `useGoalStore` (reactive via liveQuery)
- Services: `goalService` (from Epic 1, extend for progress)
- Dependencies: `sessionService` sessions for progress

---

### Story 3.2: Streak Visualization Flow

```
Session Save → Streak Update → Store Update → StreakBadge Refresh
```

**Detailed Flow**:
1. **Session created**: Counter or manual entry → `sessionService.add()`
2. **Automatic update**: Service calls `streakService.updateStreak()`
3. **Store update**: streakStore updates via liveQuery
4. **UI refresh**: StreakBadge shows new count
5. **Display**: 🔥 emoji with day count

**State Sources**:
- Primary: `streakStore` (Streak entity for current zikr)
- Services: `streakService` (from Epic 1, already implemented)
- Trigger: `sessionService.add()` automatic call

---

## File Structure & Implementation

### Story 3.1: Goal Management (5 files)

#### 1. `src/utils/goalUtils.ts`
**Purpose**: Goal period calculation utilities

**Functions**:
```typescript
export function getPeriodStart(period: GoalPeriod, date: Date): Date;
export function getPeriodEnd(period: GoalPeriod, date: Date): Date;
export function isPeriodComplete(goal: Goal, date: Date): boolean;
export function filterSessionsByPeriod(sessions: Session[], goal: Goal): Session[];
```

**Implementation**:
- Daily: Start of day to end of day
- Weekly: Monday to Sunday of current week
- Monthly: First to last day of current month
- Custom: goal.startDate to goal.endDate

---

#### 2. `src/components/GoalList.tsx`
**Purpose**: Display goals with progress bars and actions

**Component Structure**:
```typescript
interface GoalListProps {
  onGoalSelect?: (goal: Goal) => void;
}

export function GoalList({ onGoalSelect }: GoalListProps) {
  const goals = useGoalStore(state => state.goals);
  const sessions = useSessionStore(state => state.sessions);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');

  const calculateProgress = (goal: Goal) => {
    // Use goalService.calculateProgress()
  };

  return (
    <div>
      {/* Filter tabs */}
      {/* Goal cards with progress bars */}
    </div>
  );
}
```

**Key Features**:
- Filter tabs: All / Active / Paused / Completed
- Progress bar with percentage
- Pause/Resume button
- Status badges
- Empty state: "No goals yet - set your first target!"

---

#### 3. `src/components/AddGoalModal.tsx`
**Purpose**: Create goals with flexible parameters

**Component Structure**:
```typescript
interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const [formData, setFormData] = useState({
    zikrId: '',
    period: 'daily',
    target: 1,
    startDate: new Date(),
    endDate: new Date()
  });

  const handleSubmit = async () => {
    await goalService.add({
      zikrId: parseInt(formData.zikrId),
      period: formData.period,
      target: formData.target,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'active',
      createdAt: new Date()
    });
    onClose();
  };

  return <Modal>{/* Form fields */}</Modal>;
}
```

**Validation**:
- Zikr required
- Target > 0
- Date range required for Custom period

---

#### 4. `src/services/goalService.ts` (extend)
**Purpose**: Add goal progress and completion checking

**New Functions**:
```typescript
export function calculateProgress(goal: Goal, sessions: Session[]): Progress {
  const sessionsInPeriod = filterSessionsByPeriod(sessions, goal);
  const currentCount = sessionsInPeriod.reduce((sum, s) => sum + s.count, 0);
  const percentage = Math.min((currentCount / goal.target) * 100, 100);
  
  return { currentCount, target: goal.target, percentage };
}

export async function checkCompletion(zikrId: number, sessionDate: Date): Promise<void> {
  const goals = await getGoalsByZikr(zikrId);
  
  for (const goal of goals) {
    if (goal.status !== 'active') continue;
    
    const sessions = await getSessionsByPeriod(goal);
    const progress = calculateProgress(goal, sessions);
    
    if (progress.currentCount >= goal.target) {
      await update(goal.id!, { status: 'completed', completedAt: new Date() });
      // Trigger celebration
    }
  }
}
```

**Integration**:
- Call from sessionService.add() after session save
- Call from Counter auto-save (33, 100 targets)
- Call from ManualEntryModal after manual save

---

#### 5. `src/pages/Goals.tsx` (update placeholder)
**Purpose**: Main goals screen with full implementation

**Layout**:
```
┌─────────────────────────────────┐
│  Goals                          │
├─────────────────────────────────┤
│  [All] [Active] [Paused] [Done]  │
├─────────────────────────────────┤
│  📿 SubhanAllah                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Daily Goal: 100 dhikr           │
│  ████████████░░░░░ 75% (75/100) │
│  [Pause] [Edit] [Delete]         │
├─────────────────────────────────┤
│  📿 Alhamdulillah               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Weekly Goal: 500 dhikr          │
│  █████████████████████░░ 90%     │
│  [Pause] [Edit] [Delete]         │
└─────────────────────────────────┘
│      [+ Set New Goal]            │
└─────────────────────────────────┘
```

---

### Story 3.2: Streak Visualization (3 files)

#### 1. `src/components/StreakBadge.tsx`
**Purpose**: Display streak with 🔥 emoji and count

**Component Structure**:
```typescript
interface StreakBadgeProps {
  zikrId: number;
  compact?: boolean;
}

export function StreakBadge({ zikrId, compact }: StreakBadgeProps) {
  const streak = useStreakStore(state => 
    state.streaks.find(s => s.zikrId === zikrId)
  );
  
  const [showLongest, setShowLongest] = useState(false);

  if (!streak || streak.currentStreak === 0) {
    return null;
  }

  return (
    <div 
      className="streak-badge"
      onClick={() => setShowLongest(!showLongest)}
      onTouchEnd={() => {
        setShowLongest(true);
        setTimeout(() => setShowLongest(false), 3000);
      }}
    >
      {showLongest ? (
        <span>🏆 Best: {streak.longestStreak} days</span>
      ) : (
        <span>🔥 {compact ? '' : `${streak.currentStreak} day `}streak</span>
      )}
    </div>
  );
}
```

**Features**:
- Hide if streak is 0
- Show 🔥 emoji with count
- Tap/long-press to show longest streak
- Auto-hide after 3 seconds
- Scale animation on update

---

#### 2. `src/pages/Counter.tsx` (update)
**Purpose**: Add StreakBadge to counter screen

**Integration Point**: Add to counter screen layout
```typescript
<Counter>
  {/* Top Section: Zikr Selector */}
  <StreakBadge zikrId={selectedZikr.id} />
  
  {/* Middle Section: Count Display */}
  {/* Bottom Section: Tap Area */}
</Counter>
```

---

#### 3. `src/pages/Progress.tsx` (update)
**Purpose**: Add streak summary to progress screen

**Integration Point**: Add to today's summary section
```typescript
<Progress>
  <section>
    <h2>Today's Summary</h2>
    <StreakBadges />
    {/* Rest of summary */}
  </section>
</Progress>
```

---

## State Management Integration

### Store Updates (Epic 1 extensions)

#### 1. `goalStore` (verify Epic 1 has this)
```typescript
interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
}
```

**Verification**: Ensure goalStore exists from Epic 1 Task 1.3.1

---

### Service Layer Updates

#### 1. `goalService` (extend existing)
```typescript
// Add to existing goalService.ts

export function calculateProgress(goal: Goal, sessions: Session[]): Progress {
  // Implementation
}

export async function checkCompletion(zikrId: number, sessionDate: Date): Promise<void> {
  // Implementation
}

export async function updateStatus(goalId: number, status: GoalStatus): Promise<void> {
  await db.goals.update(goalId, { status });
}
```

---

### Integration Points

### With Epic 2 (Session Creation)
- **sessionService.add()**: Already calls `streakService.updateStreak()`
- **Add call to**: `goalService.checkCompletion()` after streak update

### With Epic 1 (Foundation)
- **goalStore**: Use existing store from Task 1.3.1
- **streakStore**: Use existing store from Task 1.3.1
- **sessionStore**: Use for progress calculation
- **Components**: Reuse modal patterns from Epic 2

---

## Implementation Order

### Story 3.1: Goal Management
1. `goalUtils.ts` → `AddGoalModal.tsx` → `goalService.ts` extensions → `GoalList.tsx` → `Goals.tsx` page

### Story 3.2: Streak Visualization
1. Verify `streakService.ts` calculation → `StreakBadge.tsx` → Update `Counter.tsx` → Update `Progress.tsx`

**Critical Path**: 3.1 → 3.2 (sequential dependency)

---

## Performance Considerations

### Optimization Strategies
1. **Progress Calculation**: Filter sessions efficiently using IndexedDB indexes
2. **Completion Check**: Only check active goals for affected zikr
3. **Streak Updates**: Already optimized in Epic 1 (single query)
4. **UI Updates**: liveQuery provides automatic reactivity
5. **Celebration**: Lightweight animations (CSS)

### Performance Targets
- Progress calculation: < 100ms (10 goals, 1000 sessions)
- Streak update: < 50ms (already achieved)
- UI updates: 60fps (React rendering)
- Goal completion check: < 200ms (after session save)

---

## Accessibility Strategy

### ARIA Labels
- Progress bars: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Pause/Resume buttons: Clear button labels
- StreakBadge: `aria-label="Current streak"`
- Goal status: Screen reader announcements

### Keyboard Navigation
- Goals page: Tab through goals, Enter to pause/resume
- Add Goal modal: Tab through fields, Enter to submit
- StreakBadge: Space/Enter to toggle longest streak

### Screen Reader Announcements
- Goal completion: `aria-live="polite"` regions
- Streak increase: Optional announcement
- Progress updates: Not announced (too frequent)

---

## Testing Strategy

### Unit Tests (Epic 5)
- `goalUtils`: Period calculation correctness
- `goalService.calculateProgress()`: Various scenarios
- `goalService.checkCompletion()`: Boundary conditions
- `streakService`: Already tested in Epic 1

### Integration Tests
- Goal creation → Progress calculation
- Session save → Streak update → Goal completion
- Pause/resume goal → Status persistence
- Streak badge display accuracy

### Manual Testing
- Goal progress accuracy (daily, weekly, monthly, custom)
- Streak visualization (same day, skip day, resume)
- Celebration feedback (haptic, toast)
- Filter functionality (All/Active/Paused/Completed)

---

## Error Handling

### Component Level
- **GoalList**: Error boundary + fallback UI
- **AddGoalModal**: Try-catch + inline errors
- **StreakBadge**: Hide if streak unavailable

### Service Level
- **IndexedDB errors**: Existing error recovery (Epic 1)
- **Progress calculation**: Return 0% on error
- **Completion check**: Log error, don't block session save

### User Feedback
- **Success**: Toast notifications
- **Error**: Inline errors + toasts for failures
- **Loading**: Spinners during async operations

---

## Migration & Data Changes

### No Schema Changes
Epic 3 uses existing Epic 1 schema without modifications:
- `goals` table: Existing fields sufficient
- `streaks` table: Already implemented in Epic 1
- No new stores required

### Data Consistency
- **Goal progress**: Calculated from existing sessions
- **Streak updates**: Already atomic (Epic 1)
- **Completion tracking**: Adds `completedAt` field (optional, soft)

---

## Deployment Considerations

### Build Process
- No new dependencies required
- Code splitting already configured (Epic 1)
- Bundle size: Expected ~120 kB (adds ~20 kB to Epic 2)

### PWA Update
- Service worker auto-update (Epic 1)
- No cache busting needed (incremental changes)

### Rollback
- If issues: Delete from IndexedDB (users keep data)
- Or: Revert to previous build (PWA auto-update)

---

## Architecture Review Checklist

- [ ] Builds on Epic 1 + Epic 2 without breaking changes
- [ ] Reuses existing patterns (stores, services, components)
- [ ] No new architectural decisions (ADR compliance)
- [ ] Performance targets defined and achievable
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Error handling comprehensive
- [ ] Offline functionality maintained
- [ ] Mobile-first design respected
- [ ] Touch targets ≥ 44x44px
- [ ] Integration points documented

---

## Success Metrics

### Functional
- User can create goals with flexible periods
- Goal progress is accurate based on sessions
- Goals mark completed when target reached
- Streak visualization is correct and motivating
- Streak updates automatically on session save

### Performance
- Progress calculation < 100ms
- Streak update < 50ms
- UI 60fps during animations
- Bundle size < 200KB gzipped

### User Experience
- Intuitive goal setting (< 1 minute)
- Clear progress visualization
- Motivating streak display
- Easy pause/resume functionality

---

**Status**: ✅ Architecture complete
**Next Phase**: Design Review (Phase 2.1)
