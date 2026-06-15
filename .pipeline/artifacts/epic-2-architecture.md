# Architecture: Epic 2 - Core Features - Zikrs & Sessions

**Epic**: Epic 2: Core Features - Zikrs & Sessions
**Date**: 2026-06-15
**Status**: Draft
**Based on**: `.pipeline/artifacts/epic-2-requirements.md`
**Builds on**: Epic 1 (Foundation & Infrastructure)

---

## Architecture Overview

This epic extends the Epic 1 foundation with user-facing core functionality. The architecture follows Epic 1 patterns:
- **Feature-based structure**: Components grouped by story
- **Shared core infrastructure**: Reuses Epic 1 services/stores
- **State management**: Zustand stores with liveQuery
- **Data layer**: Dexie.js with TypeScript interfaces
- **No new architectural decisions**: Builds on existing ADR 001, 002, 003

---

## Component Architecture

### High-Level Structure

```
src/
├── components/
│   ├── ZikrList.tsx          # Story 2.1: View and manage zikrs
│   ├── AddZikrModal.tsx      # Story 2.1: Create custom zikrs
│   ├── EditZikrModal.tsx     # Story 2.1: Edit custom zikrs
│   └── ManualEntryModal.tsx   # Story 2.3: Manual session logging
├── pages/
│   ├── Counter.tsx            # Story 2.2: Main counter screen (update placeholder)
│   ├── Goals.tsx              # Placeholder (Epic 3)
│   ├── Progress.tsx           # Placeholder (Epic 4)
│   └── Settings.tsx           # Placeholder (Epic 4)
├── hooks/
│   └── useHaptic.ts           # Story 2.2: Haptic feedback hook
└── utils/
    └── validation.ts          # Story 2.1: Input validation utilities
```

### Component Hierarchy

```
App.tsx
└── HashRouter
    ├── Navigation (existing)
    └── Routes
        ├── / → Counter.tsx (NEW: full implementation)
        ├── /goals → Goals.tsx (placeholder)
        ├── /progress → Progress.tsx (placeholder)
        └── /settings → Settings.tsx (placeholder)
```

---

## Data Flow Architecture

### Story 2.1: Zikr Management Flow

```
User Action → Component → Service → IndexedDB → liveQuery → Store Update → UI Refresh
```

**Detailed Flow**:
1. **User opens ZikrList**: Component loads from `zikrStore.zikrs`
2. **User adds zikr**: `AddZikrModal` → `zikrService.add()` → IndexedDB → liveQuery → zikrStore → ZikrList updates
3. **User edits zikr**: `EditZikrModal` → `zikrService.update()` → IndexedDB → liveQuery → zikrStore → ZikrList updates
4. **User deletes zikr**: Confirmation → `zikrService.softDelete()` OR cascade → IndexedDB → liveQuery → zikrStore → ZikrList updates

**State Sources**:
- Primary: `useZikrStore` (reactive via liveQuery)
- Services: `zikrService` (from Epic 1)

---

### Story 2.2: Counter Flow

```
User Tap → Component → Counter Update → Haptic → Auto-Save Check → Session Save → Streak Update
```

**Detailed Flow**:
1. **User opens Counter**: Load current zikr from `zikrStore`, load count from `sessionStore`
2. **User taps**: Increment count → Call `useHaptic()` → Update `sessionStore` → Check auto-save targets
3. **Target reached (33, 100)**: `sessionService.add()` → IndexedDB → `streakService.update()` → Reset counter
4. **User long-presses**: Show confirmation → Reset counter to 0
5. **App closes**: window 'blur' → Save current count → Clear `sessionStore` current session

**State Sources**:
- Primary: `useSessionStore` (current count), `useZikrStore` (zikr list)
- Services: `sessionService`, `streakService` (from Epic 1)
- UI State: `useUiStore` (counter restoration)

---

### Story 2.3: Manual Entry Flow

```
User fills form → Validation → Service → IndexedDB → Streak Update → Success Toast
```

**Detailed Flow**:
1. **User opens modal**: `ManualEntryModal` loads zikrs from `zikrStore`
2. **User fills form**: Real-time validation
3. **User submits**: `sessionService.add()` with source='manual' → IndexedDB → `streakService.update()` → Toast + Close
4. **No zikrs exist**: Show empty state + link to zikr creation

**State Sources**:
- Primary: `useZikrStore` (zikr dropdown)
- Services: `sessionService`, `streakService` (from Epic 1)

---

## File Structure & Implementation

### Story 2.1: Zikr Management (5 files)

#### 1. `src/components/ZikrList.tsx`
**Purpose**: Display and manage zikrs with swipe actions

**Component Structure**:
```typescript
interface ZikrListProps {
  onZikrSelect?: (zikr: Zikr) => void;
}

export function ZikrList({ onZikrSelect }: ZikrListProps) {
  const zikrs = useZikrStore(state => state.zikrs);
  const loading = useZikrStore(state => state.loading);
  
  // Swipe handlers
  const handleEdit = (zikr: Zikr) => { /* open EditZikrModal */ };
  const handleDelete = (zikr: Zikr) => { /* show confirmation */ };
  
  return (
    <div>
      {/* Predefined zikrs first */}
      {/* Custom zikrs with swipe actions */}
    </div>
  );
}
```

**Key Features**:
- Sort: predefined first (fixed order), then custom (alphabetical)
- Swipe gestures: left to edit, right to delete
- Badge display: "Custom" for user-created zikrs
- Touch targets: ≥ 44x44px

**Dependencies**: `useZikrStore`, `EditZikrModal`, `AddZikrModal`

---

#### 2. `src/components/AddZikrModal.tsx`
**Purpose**: Create custom zikrs with validation

**Component Structure**:
```typescript
interface AddZikrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddZikrModal({ isOpen, onClose }: AddZikrModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validateName = (value: string) => {
    // Validation logic
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await zikrService.add({ name, custom: true, createdAt: new Date() });
      onClose();
      // Show success toast
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Input, validation, buttons */}
    </Modal>
  );
}
```

**Validation Rules**:
- Not empty (min 1 character)
- Max 50 characters
- No duplicates (case-insensitive check against zikrStore)
- Letters, spaces, hyphens only (regex: `^[a-zA-Z\s\-]+$`)

**UI Elements**:
- Text input with character counter
- Inline error messages
- Save/Cancel buttons
- Loading state

---

#### 3. `src/components/EditZikrModal.tsx`
**Purpose**: Edit existing custom zikrs

**Implementation**: Reuse `AddZikrModal` with edit mode

```typescript
interface EditZikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  zikr: Zikr;
}

export function EditZikrModal({ isOpen, onClose, zikr }: EditZikrModalProps) {
  const [name, setName] = useState(zikr.name);
  
  const handleSave = async () => {
    await zikrService.update(zikr.id!, { name });
    onClose();
  };
  
  return <AddZikrModal isOpen={isOpen} onClose={onClose} mode="edit" initialValues={{ name }} />;
}
```

**Constraints**: Cannot edit predefined zikrs (custom: false)

---

#### 4. Delete Confirmation Modal (inline in ZikrList)
**Purpose**: Handle cascade delete options

```typescript
export function DeleteConfirmationModal({ zikr, onConfirm }: Props) {
  const [option, setOption] = useState<'keep' | 'delete-all'>('keep');
  
  const handleConfirm = async () => {
    if (option === 'keep') {
      await zikrService.softDelete(zikr.id!); // Set deletedAt
    } else {
      await zikrService.hardDelete(zikr.id!); // Cascade delete
    }
    onConfirm();
  };
  
  return (
    <Modal>
      <h2>Delete Zikr?</h2>
      <p>What should we do with your sessions for this zikr?</p>
      
      <RadioGroup value={option} onChange={setOption}>
        <Option value="keep">Keep sessions (recommended)</Option>
        <Option value="delete-all">Delete all data</Option>
      </RadioGroup>
      
      {option === 'delete-all' && <Warning>This will permanently delete all related data</Warning>}
      
      <Buttons>Confirm / Cancel</Buttons>
    </Modal>
  );
}
```

**Cascade Logic**:
- **Keep**: `zikrService.softDelete()` sets `deletedAt` timestamp
- **Delete all**: `zikrService.cascadeDelete()` removes zikr + sessions + goals + streaks

---

#### 5. `src/services/db.ts` (update seed function)
**Purpose**: Initialize predefined zikrs

```typescript
export async function seedPredefinedZikrs() {
  const count = await db.zikrs.count();
  if (count > 0) return; // Already seeded
  
  const predefinedZikrs = [
    { name: "SubhanAllah", custom: false, createdAt: new Date() },
    { name: "Alhamdulillah", custom: false, createdAt: new Date() },
    { name: "Allahu Akbar", custom: false, createdAt: new Date() },
    { name: "La ilaha illallah", custom: false, createdAt: new Date() }
  ];
  
  await db.transaction('rw', db.zikrs, () => {
    predefinedZikrs.forEach(zikr => db.zikrs.add(zikr));
  });
}
```

**Call in**: `src/App.tsx` on mount (check empty then seed)

---

### Story 2.2: Tasbeeh Counter (6 files)

#### 1. `src/pages/Counter.tsx` (full implementation)
**Purpose**: Main counter interface

**Component Structure**:
```typescript
export function Counter() {
  const zikrs = useZikrStore(state => state.zikrs);
  const currentSession = useSessionStore(state => state.currentSession);
  const setCurrentSession = useSessionStore(state => state.setCurrentSession);
  const uiStore = useUiStore();
  
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const { triggerHaptic } = useHaptic();
  
  // Tap handler
  const handleTap = () => {
    triggerHaptic();
    const newCount = (currentSession?.count || 0) + 1;
    setCurrentSession({ ...currentSession, count: newCount });
    
    // Auto-save check
    if (newCount === 33 || newCount === 100) {
      handleAutoSave(newCount);
    }
  };
  
  // Long-press handler
  const handleLongPress = () => {
    // Show reset confirmation
  };
  
  // Auto-save handler
  const handleAutoSave = async (count: number) => {
    if (!selectedZikr) return;
    
    await sessionService.add({
      zikrId: selectedZikr.id!,
      count,
      source: 'app',
      timestamp: new Date(),
      date: new Date()
    });
    
    setCurrentSession({ zikrId: selectedZikr.id!, count: 0 });
    // Show toast
  };
  
  // App close handler
  useEffect(() => {
    const handleBlur = async () => {
      if (currentSession?.count > 0) {
        await handleAutoSave(currentSession.count);
      }
    };
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [currentSession]);
  
  // Restore counter state
  useEffect(() => {
    const savedCount = uiStore.counterState;
    if (savedCount > 0) {
      setCurrentSession({ count: savedCount });
    }
  }, []);
  
  return (
    <div className="counter-screen">
      {/* Top: Zikr selector */}
      {/* Middle: Count display */}
      {/* Bottom: Tap area */}
    </div>
  );
}
```

**Layout**:
- Top 20%: Zikr selector (horizontal scroll)
- Middle 50%: Large count display (120px, centered)
- Bottom 30%: Tap area (min-height 200px, thumb zone)

---

#### 2. `src/hooks/useHaptic.ts`
**Purpose**: Haptic feedback hook

```typescript
export function useHaptic() {
  const triggerHaptic = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(10); // 10ms pulse
      }
    } catch (error) {
      // Silent fail on unsupported devices
    }
  }, []);
  
  return { triggerHaptic };
}
```

**Usage**: Call on each counter tap

---

#### 3. `src/components/ZikrSelector.tsx`
**Purpose**: Zikr selection for counter

```typescript
export function ZikrSelector({ zikrs, selectedZikr, onSelect }: Props) {
  return (
    <div className="zikr-selector">
      {zikrs.map(zikr => (
        <button
          key={zikr.id}
          className={selectedZikr?.id === zikr.id ? 'active' : ''}
          onClick={() => onSelect(zikr)}
        >
          {zikr.name}
        </button>
      ))}
    </div>
  );
}
```

**UI**: Horizontal scroll, active state highlighting

---

### Story 2.3: Manual Entry (2 files)

#### 1. `src/components/ManualEntryModal.tsx`
**Purpose**: Manual session logging

```typescript
export function ManualEntryModal({ isOpen, onClose }: Props) {
  const zikrs = useZikrStore(state => state.zikrs);
  const [formData, setFormData] = useState({
    zikrId: '',
    count: 0,
    date: new Date(),
    time: new Date()
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Check for empty zikr list
  useEffect(() => {
    if (zikrs.length === 0) {
      // Show empty state
    }
  }, [zikrs]);
  
  const validate = () => {
    const newErrors = {};
    if (!formData.zikrId) newErrors.zikrId = 'Required';
    if (formData.count <= 0) newErrors.count = 'Must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      const timestamp = combineDateTime(formData.date, formData.time);
      
      await sessionService.add({
        zikrId: parseInt(formData.zikrId),
        count: formData.count,
        source: 'manual',
        timestamp,
        date: formData.date
      });
      
      // Show success toast
      onClose();
    } catch (err) {
      // Show error
    } finally {
      setLoading(false);
    }
  };
  
  if (zikrs.length === 0) {
    return <EmptyState message="Create a zikr first" cta="Go to Zikrs" />;
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Zikr dropdown, count input, date/time pickers, save/cancel */}
    </Modal>
  );
}
```

**Validation**:
- Zikr required
- Count > 0
- Date/time required

**Empty State**: If no zikrs exist, show message + link to zikr creation

---

#### 2. `src/utils/dateUtils.ts` (update)
**Purpose**: Date/time utilities

```typescript
export function combineDateTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours());
  combined.setMinutes(time.getMinutes());
  combined.setSeconds(time.getSeconds());
  return combined;
}
```

---

## State Management Integration

### Store Updates (Epic 1 extensions)

#### 1. `sessionStore` (update)
```typescript
interface SessionState {
  sessions: Session[];
  currentSession: { zikrId: number; count: number } | null;
  loading: boolean;
  error: string | null;
  setCurrentSession: (session: { zikrId: number; count: number }) => void;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: null,
  loading: true,
  error: null,
  
  setCurrentSession: (session) => set({ currentSession: session }),
  clearCurrentSession: () => set({ currentSession: null }),
  
  // Existing liveQuery initialization
}));
```

#### 2. `uiStore` (update)
```typescript
interface UiState {
  darkMode: boolean;
  counterState: number; // NEW: for counter restoration
  setCounterState: (count: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  darkMode: false,
  counterState: 0,
  setCounterState: (count) => set({ counterState: count }),
}));
```

---

## Service Layer Updates (Epic 1 extensions)

#### 1. `zikrService` (add methods)
```typescript
// Add to existing zikrService.ts

export async function softDelete(id: number): Promise<void> {
  await db.zikrs.update(id, { deletedAt: new Date() });
}

export async function cascadeDelete(id: number): Promise<void> {
  await db.transaction('rw', db.zikrs, db.sessions, db.goals, db.streaks, async () => {
    await db.zikrs.delete(id);
    await db.sessions.where('zikrId').equals(id).delete();
    await db.goals.where('zikrId').equals(id).delete();
    await db.streaks.delete(id);
  });
}
```

#### 2. `sessionService` (verify add method)
```typescript
// Verify existing sessionService.add() handles all fields
export async function add(session: Omit<Session, 'id'>): Promise<number> {
  const id = await db.sessions.add({
    ...session,
    timestamp: session.timestamp || new Date(),
    date: session.date || new Date()
  });
  
  // Trigger streak update
  await streakService.updateStreak(session.zikrId, session.date);
  
  return typeof id === 'number' ? id : parseInt(id as string, 10);
}
```

---

## Implementation Order

### Story 2.1: Zikr Management
1. `ZikrList.tsx` → `AddZikrModal.tsx` → `EditZikrModal.tsx` → Delete confirmation → Seed function

### Story 2.2: Tasbeeh Counter
1. `useHaptic.ts` → `ZikrSelector.tsx` → `Counter.tsx` (full implementation) → Auto-save logic → Long-press reset

### Story 2.3: Manual Entry
1. `ManualEntryModal.tsx` → Date/time utilities → Empty state handling

**Critical Path**: 2.1 → 2.2 → 2.3 (sequential dependency)

---

## Integration with Epic 1

### Reuses from Epic 1
- **Stores**: `useZikrStore`, `useSessionStore`, `useUiStore` (with extensions)
- **Services**: `zikrService`, `sessionService`, `streakService` (with extensions)
- **Components**: `Navigation`, `ErrorBoundary`, `LoadingSpinner`
- **Routing**: `HashRouter` setup in `App.tsx`
- **Database**: Dexie schema, interfaces, migration system

### New in Epic 2
- **Components**: `ZikrList`, `AddZikrModal`, `EditZikrModal`, `ManualEntryModal`, `ZikrSelector`
- **Hooks**: `useHaptic`
- **Utils**: `validation.ts`, date utilities (extend existing)

---

## Performance Considerations

### Optimization Strategies
1. **liveQuery**: All store updates reactive, no manual refresh needed
2. **Debouncing**: Counter taps not debounced (< 100ms required)
3. **Lazy loading**: Modals only render when open
4. **Code splitting**: Counter page already lazy-loaded (Epic 1)
5. **Bundle size**: No new dependencies (reuse Epic 1 packages)

### Performance Targets
- Counter tap: < 100ms (instant feedback)
- Haptic trigger: < 50ms (native API call)
- Session save: < 500ms (IndexedDB transaction)
- UI updates: 60fps (React rendering)

---

## Accessibility Strategy

### ARIA Labels
- All buttons have `aria-label`
- Counter tap area: `aria-label="Increment count"`
- Zikr selector: `aria-label="Select zikr"`
- Modals: `role="dialog"`, `aria-modal="true"`

### Keyboard Navigation
- Counter: Space/Enter to tap
- Zikr selector: Arrow keys + Enter
- Modals: Escape to close
- Forms: Tab through fields, Enter to submit

### Screen Reader Announcements
- Toast notifications: `aria-live="polite"`
- Counter updates: `aria-live="polite"` (count changes)
- Success/error messages: Inline announcements

---

## Testing Strategy

### Unit Tests (Epic 5)
- `zikrService` methods (add, update, softDelete, cascadeDelete)
- `useHaptic` hook behavior
- Validation utilities
- Date/time utilities

### Integration Tests
- Zikr management flow (add → edit → delete)
- Counter flow (tap → save → streak update)
- Manual entry flow (fill → validate → save → streak)

### Manual Testing
- Mobile haptic feedback
- Swipe gestures on ZikrList
- Long-press reset on counter
- Auto-save on app close
- Empty state handling

---

## Error Handling

### Component Level
- **ZikrList**: Error boundary + fallback UI
- **Counter**: Store errors + FallbackBanner (Epic 1)
- **Modals**: Try-catch + inline error messages

### Service Level
- **IndexedDB errors**: Existing error recovery (Epic 1)
- **Validation errors**: Inline messages + prevent action
- **Network errors**: N/A (offline-only)

### User Feedback
- **Success**: Toast notifications
- **Error**: Inline errors + toasts for failures
- **Loading**: Spinners during async operations

---

## Migration & Data Changes

### No Schema Changes
Epic 2 uses existing Epic 1 schema without modifications:
- `zikrs` table: existing fields sufficient
- `sessions` table: existing fields sufficient
- No new stores required

### Seed Data
- Predefined zikrs added on first launch
- Idempotent (checks if already seeded)

---

## Deployment Considerations

### Build Process
- No new dependencies required
- Code splitting already configured (Epic 1)
- Bundle size: Expected ~120 kB (adds ~30 kB to Epic 1)

### PWA Update
- Service worker auto-update (Epic 1)
- No cache busting needed (no asset changes)

### Rollback
- If issues: Delete from IndexedDB (users keep data)
- Or: Revert to previous build (PWA auto-update)

---

## Architecture Review Checklist

- [ ] Builds on Epic 1 foundation without breaking changes
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
- User can manage zikrs (view/add/edit/delete)
- User can practice with digital counter (tap/haptic/auto-save)
- User can log manual sessions
- Data persists across app restarts
- Streaks update automatically

### Performance
- Counter tap < 100ms response
- Session save < 500ms
- UI 60fps during animations
- Bundle size < 200KB gzipped

### User Experience
- Intuitive zikr management (clear UI, swipe actions)
- Responsive counter (instant feedback, haptic)
- Quick manual entry (< 30 seconds)
- No data loss scenarios

---

**Status**: ✅ Architecture complete
**Next Phase**: Design Review (Phase 2.1)