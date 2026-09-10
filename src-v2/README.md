# Zikr V2 - Fresh UI Implementation

This directory contains a complete reimplementation of the Zikr app with the new design system from the HTML mockups.

## Directory Structure

```
src-v2/
├── components/          # Reusable UI components
│   ├── navigation/      # Navigation components (TopAppBar, BottomNav)
│   ├── cards/          # Card components (GlassCard, ZikrCard)
│   ├── progress/       # Progress indicators (CircularProgress, WeeklyChart)
│   └── forms/          # Form components (ToggleSwitch, InputField)
├── hooks/              # Custom React hooks (useRipple, useHaptic)
├── pages/              # Page components (Counter, Home, Goals, Progress)
├── styles/             # Global styles and Tailwind config
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── index.ts            # Export barrel file
```

## Design System

### Colors
Material Design 3 inspired semantic color system:
- **Primary**: Forest green (#012d1d)
- **Secondary**: Sage/olive (#5e5f56)
- **Tertiary**: Gold/amber (#735c00)
- **Surfaces**: Warm neutrals (#fcf9f8 base)

### Typography
- **Headlines**: Plus Jakarta Sans (700 weight)
- **Body**: Source Sans 3 (400 weight)
- **Arabic**: Noto Serif (500 weight)
- **Icons**: Material Symbols Outlined

### Spacing
- **Touch target min**: 56px
- **Container padding**: 24px mobile, 64px desktop
- **Gutter**: 16px

## Component Usage

### Navigation

```tsx
import { TopAppBar, BottomNav } from '@/v2';

<TopAppBar
  title="Counter"
  showBack
  onBack={() => navigate(-1)}
  action={{ icon: 'settings', onClick: openSettings, ariaLabel: 'Settings' }}
/>

<BottomNav
  items={navItems}
  activeId="home"
  onNavigate={(path) => navigate(path)}
/>
```

### Cards

```tsx
import { GlassCard, ZikrCard } from '@/v2';

<ZikrCard
  id={1}
  name="SubhanAllah"
  translation="Glory be to Allah"
  targetCount={33}
  icon="cabin"
  onStart={(id) => navigateToCounter(id)}
/>
```

### Progress

```tsx
import { CircularProgress, WeeklyChart } from '@/v2';

<CircularProgress progress={75} size={192}>
  <span>75%</span>
</CircularProgress>

<WeeklyChart
  data={[
    { day: 'M', value: 80 },
    { day: 'T', value: 120, isToday: true },
  ]}
/>
```

### Forms

```tsx
import { InputField, ToggleSwitch } from '@/v2';

<InputField
  label="Date"
  type="date"
  value={date}
  onChange={setDate}
  icon="calendar_today"
/>

<ToggleSwitch
  checked={enabled}
  onChange={setEnabled}
  label="Enable reminders"
/>
```

### Hooks

```tsx
import { useRipple, useHaptic } from '@/v2';

const buttonRef = useRef<HTMLButtonElement>(null);
const { createRipple } = useRipple(buttonRef, true);
const { trigger: haptic } = useHaptic(true);

<button
  ref={buttonRef}
  onMouseDown={createRipple}
  onClick={() => haptic('medium')}
>
  Tap me
</button>
```

## Pages

All pages are currently using mock data. To connect to the existing stores:

1. Import stores from `src/core/stores`
2. Replace mock data with store values
3. Add event handlers for actions

Example for Counter page:

```tsx
// Before (mock)
const [count, setCount] = useState(0);

// After (with store)
const count = useSessionStore(state => state.count);
const increment = useSessionStore(state => state.increment);
```

## Integration Steps

1. **Add fonts to `index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600&family=Noto+Serif:wght@500&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

2. **Update `tailwind.config.js`:**
Use the config from `src-v2/styles/tailwind.config.js`

3. **Add global styles:**
Import `src-v2/styles/global.css` in `main.tsx`

4. **Update routing:**
Add V2 routes to the router configuration

5. **Connect stores:**
Replace mock data with Zustand stores

## Status

- [x] Design system foundation
- [x] Component library (15 components)
- [x] Page implementations (4 pages)
- [x] Hooks (ripple, haptic)
- [ ] Store integration
- [ ] Routing integration
- [ ] Testing
- [ ] Dark mode support

## Notes

- All components use the new semantic color system
- Ripple effects and haptic feedback are built-in
- Touch targets are 56px minimum
- iOS safe areas are supported
- Material Symbols icons use FILL variant for active states
