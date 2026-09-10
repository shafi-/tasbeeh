# UI Integration Plan - HTML to React Migration

**Created:** 2026-06-20 | **Status:** Draft | **Epic:** UI Redesign

---

## Executive Summary

The HTML files in `src/pages/` represent a polished, production-ready UI design system that needs to be integrated into the React application. This plan outlines the structured approach to migrate these designs while maintaining data connectivity and PWA functionality.

**Files to Integrate:**
- `CounterV2.html` → Enhanced counter screen with ripple effects, haptic feedback
- `HomeV2.html` → Dashboard with streak, daily goal, quick start cards
- `GoalAndReminder.html` → Goals management with toggles, reminder scheduling
- `Progress.html` → Stats overview, weekly charts, manual entry form

---

## Phase 1: Design System Foundation (Priority: High)

### 1.1 Color System Migration

The HTML files use a Material Design 3 inspired color system with semantic naming. This needs to be integrated into Tailwind config.

**Current State:** Basic Tailwind colors
**Target State:** Full semantic color system from HTML designs

**Action:**
Update `tailwind.config.js` with the complete color palette:

```javascript
// Extracted from HTML designs
colors: {
  // Primary (Forest Green)
  primary: '#012d1d',
  'primary-container': '#1b4332',
  'on-primary': '#ffffff',
  'on-primary-container': '#86af99',
  'inverse-primary': '#a5d0b9',

  // Secondary (Sage/Olive)
  secondary: '#5e5f56',
  'secondary-container': '#e4e3d7',
  'on-secondary': '#ffffff',
  'on-secondary-container': '#64655c',

  // Tertiary (Gold/Amber)
  tertiary: '#735c00',
  'tertiary-container': '#cba72f',
  'tertiary-fixed': '#ffe088',
  'tertiary-fixed-dim': '#e9c349',
  'on-tertiary': '#ffffff',
  'on-tertiary-container': '#4e3d00',
  'on-tertiary-fixed': '#241a00',
  'on-tertiary-fixed-variant': '#574500',

  // Surfaces
  surface: '#fcf9f8',
  'surface-container': '#f0eded',
  'surface-container-low': '#f6f3f2',
  'surface-container-high': '#eae7e7',
  'surface-container-highest': '#e4e2e1',
  'surface-dim': '#dcd9d9',
  'surface-bright': '#fcf9f8',
  'surface-variant': '#e4e2e1',

  // Text
  'on-surface': '#1b1c1c',
  'on-surface-variant': '#414844',
  'on-background': '#1b1c1c',

  // Outlines
  outline: '#717973',
  'outline-variant': '#c1c8c2',

  // Error
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',

  // Inverse surfaces (dark mode)
  'inverse-surface': '#303030',
  'inverse-on-surface': '#f3f0f0',
}
```

**Files to Update:**
- `tailwind.config.js`

---

### 1.2 Typography System

**Fonts Used in HTML:**
- `Plus Jakarta Sans` - Headlines, labels (600, 700 weight)
- `Source Sans 3` - Body text (400, 600 weight)
- `Noto Serif` - Arabic display text (500 weight)
- `Material Symbols Outlined` - Icons with FILL variant support

**Action:**
1. Add Google Fonts to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600&family=Noto+Serif:wght@500&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

2. Update `tailwind.config.js` with font families:
```javascript
fontFamily: {
  'headline-lg-mobile': ['Plus Jakarta Sans'],
  'headline-lg': ['Plus Jakarta Sans'],
  'headline-md': ['Plus Jakarta Sans'],
  'body-lg': ['"Source Sans 3"'],
  'body-md': ['"Source Sans 3"'],
  'caption': ['"Source Sans 3"'],
  'display-arabic': ['Noto Serif'],
  'label-md': ['Plus Jakarta Sans'],
}
```

**Files to Update:**
- `index.html`
- `tailwind.config.js`

---

### 1.3 Spacing & Touch Targets

**HTML Design Standards:**
- `touch-target-min: 56px` - Minimum touch target size
- `container-padding-mobile: 24px` - Mobile screen padding
- `gutter: 16px` - Standard spacing unit

**Action:**
Add to `tailwind.config.js`:
```javascript
spacing: {
  'touch-target-min': '56px',
  'container-padding-mobile': '24px',
  'gutter': '16px',
}
```

---

### 1.4 Base CSS Utilities

**Glass Card Effect** (used extensively):
Create `src/index.css` additions:

```css
.glass-card {
  background: rgba(252, 249, 248, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid theme('colors.outline-variant' / 30%);
}

/* Hide scrollbar but keep functionality */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Subtle background texture */
body {
  background-image: radial-gradient(theme('colors.surface-variant') 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -12px -12px;
}

/* Safe area for iOS notch */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

---

## Phase 2: Component Library Creation (Priority: High)

### 2.1 Icon System

**Requirement:** Material Symbols Outlined with FILL variant support

**Component:** `src/components/MaterialIcon.tsx`

```tsx
interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ icon, filled = false, className }) => {
  const style = filled ? { 'FILL': 1 } : { 'FILL': 0 };
  return (
    <span
      className={`material-symbols-outlined ${className || ''}`}
      style={{ fontVariationSettings: `'FILL' ${style['FILL']}` }}
    >
      {icon}
    </span>
  );
};
```

**Icons Used:**
- Navigation: home, target, trending_up, notifications, settings
- Actions: play_arrow, add_circle, check_circle, close, refresh
- Status: local_fire_department, spa, vibration, edit_document

---

### 2.2 Navigation Components

**Bottom Navigation Bar:**
`src/components/BottomNav.tsx`

Features:
- Active state with `primary-container` background
- Inactive state with hover effect
- Icon + label layout
- 56px touch target height
- iOS safe area support

**Top App Bar:**
`src/components/TopAppBar.tsx`

Features:
- Fixed position, z-50
- Backdrop blur effect
- Left: close/back button
- Center: title
- Right: action button

---

### 2.3 Card Components

**Glass Card:** `src/components/GlassCard.tsx`
```tsx
// Base glassmorphism card wrapper
```

**Zikr Quick Start Card:** `src/components/ZikrCard.tsx`
Features:
- Decorative gradient circle
- Icon + target count badge
- Zikr name + translation
- Start button with ripple

**Goal Card:** `src/components/GoalCard.tsx`
Features:
- Toggle switch for active/inactive
- Schedule display
- Target count
- Period badge (daily/weekly)

---

### 2.4 Progress Components

**Circular Progress:** `src/components/CircularProgress.tsx`
Features:
- SVG circle with stroke-dasharray animation
- Configurable size and color
- Inner content slot

**Progress Ring:** `src/components/ProgressRing.tsx`
Similar to CircularProgress but for counter screen

**Weekly Bar Chart:** `src/components/WeeklyChart.tsx`
Features:
- Rounded bar ends
- Opacity variation for different days
- Current day highlighting
- Soft color palette

---

### 2.5 Form Components

**Toggle Switch:** `src/components/ToggleSwitch.tsx```tsx
// Custom styled checkbox with slider animation
```

**Input Field:** `src/components/InputField.tsx`
Features:
- Icon prefix
- 56px height
- Rounded corners
- Focus ring on primary

---

### 2.6 Counter Screen Components

**Counter Circle:** `src/components/CounterCircle.tsx`
Features:
- Ripple effect on tap
- Scale animation on press
- Progress ring integration
- Haptic feedback

**Ripple Effect:** `src/hooks/useRipple.ts`
```typescript
// Hook to create and manage ripple animations
```

---

## Phase 3: Page Component Migration (Priority: Medium)

### 3.1 Counter Screen

**Source:** `CounterV2.html` → `src/pages/Counter.tsx`

**Features to Integrate:**
- Arabic text display with `display-arabic` typography
- Circular progress ring
- Large counter display (64px)
- Ripple effect on tap
- Haptic feedback integration
- Reset button (subtle placement)
- Complete session button (bottom fixed)
- Haptics toggle in header

**State Connection:**
- Connect to `sessionStore` for count tracking
- Connect to `zikrStore` for zikr name/display
- Connect to `streakStore` for streak badge
- Integrate with `sessionService.add()` on complete

---

### 3.2 Home/Dashboard Screen

**Source:** `HomeV2.html` → `src/pages/Home.tsx`

**Features to Integrate:**
- Welcome message with streak badge
- Daily goal progress circle (75% example)
- Quick start cards (horizontal scroll)
- Snap-to-center card scrolling
- Bottom navigation

**State Connection:**
- Fetch current streak from `streakStore`
- Calculate daily goal progress from `sessionStore`
- Render zikr list from `zikrStore`
- Handle navigation to counter screen

---

### 3.3 Goals & Reminders Screen

**Source:** `GoalAndReminder.html` → `src/pages/Goals.tsx`

**Features to Integrate:**
- Stacked goal cards layout
- Toggle switches for each goal
- Time display for reminders
- Period badges (daily/weekly)
- Create new CTA button
- Mobile bottom nav + Desktop side nav

**State Connection:**
- Fetch goals from `goalStore`
- Handle toggle state (goal activation)
- Connect reminder time to settings
- Integrate with `goalService` for CRUD

---

### 3.4 Progress Screen

**Source:** `Progress.html` → `src/pages/Progress.tsx`

**Features to Integrate:**
- Bento-style stats grid
- Streak card with fire icon
- Total dhikr card
- Weekly progress bar chart
- Offline progress logging form
- Date and count inputs

**State Connection:**
- Fetch streak from `streakStore`
- Calculate total from `sessionStore`
- Build weekly chart data from sessions
- Connect form to `sessionService.add()` with manual source

---

## Phase 4: Interactions & Animations (Priority: Medium)

### 4.1 Haptic Feedback System

**Create:** `src/hooks/useHaptic.ts`

```typescript
export const useHaptic = () => {
  const enabled = useHapticsStore(state => state.enabled);

  const trigger = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning') => {
    if (!enabled || !navigator.vibrate) return;

    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
      success: [30, 30, 30],
      warning: [50, 50]
    };

    navigator.vibrate(patterns[type]);
  };

  return { trigger };
};
```

**Usage:**
- Counter tap: light
- Button press: medium
- Goal complete: success
- Delete action: warning

---

### 4.2 Ripple Effect System

**Create:** `src/hooks/useRipple.ts`

Implementation from HTML:
- Create span element
- Position at touch/click coordinates
- Animate scale 0 → 4
- Remove after animation

---

### 4.3 Page Transitions

**Create:** `src/components/PageTransition.tsx`

Use Framer Motion or CSS transitions:
- Slide from right (200ms)
- Fade out/in
- Preserve scroll position

---

## Phase 5: Dark Mode Support (Priority: Low)

### 5.1 Color Variant Mapping

The HTML designs use `darkMode: 'class'` in Tailwind config.

**Action:**
1. Add dark mode color overrides to `tailwind.config.js`
2. Create `useDarkMode` hook in `src/hooks/useDarkMode.ts`
3. Add dark mode toggle in Settings screen
4. Update all components to use semantic color names (not hardcoded values)

---

## Phase 6: Responsive Design (Priority: Low)

### 6.1 Breakpoints

HTML uses `md:hidden` and `md:flex` for responsive layouts.

**Action:**
- Mobile: Bottom navigation
- Desktop: Side navigation (as shown in GoalAndReminder.html)
- Optimize card layouts for larger screens

---

## Implementation Order

### Week 1: Foundation
1. Update `tailwind.config.js` with colors, typography, spacing
2. Add Google Fonts to `index.html`
3. Create base CSS utilities (glass-card, hide-scrollbar, etc.)
4. Create `MaterialIcon` component

### Week 2: Component Library
1. Create navigation components (BottomNav, TopAppBar)
2. Create card components (GlassCard, ZikrCard, GoalCard)
3. Create progress components (CircularProgress, WeeklyChart)
4. Create form components (ToggleSwitch, InputField)

### Week 3: Page Migration
1. Migrate Counter screen (CounterV2.html)
2. Migrate Home screen (HomeV2.html)
3. Migrate Goals screen (GoalAndReminder.html)
4. Migrate Progress screen (Progress.html)

### Week 4: Polish
1. Add haptic feedback system
2. Add ripple effects
3. Add page transitions
4. Test and refine interactions

---

## File Creation Checklist

### New Components
- [ ] `src/components/MaterialIcon.tsx`
- [ ] `src/components/BottomNav.tsx`
- [ ] `src/components/TopAppBar.tsx`
- [ ] `src/components/GlassCard.tsx`
- [ ] `src/components/ZikrCard.tsx`
- [ ] `src/components/GoalCard.tsx`
- [ ] `src/components/CircularProgress.tsx`
- [ ] `src/components/ProgressRing.tsx`
- [ ] `src/components/WeeklyChart.tsx`
- [ ] `src/components/ToggleSwitch.tsx`
- [ ] `src/components/InputField.tsx`
- [ ] `src/components/CounterCircle.tsx`
- [ ] `src/components/PageTransition.tsx`

### New Hooks
- [ ] `src/hooks/useRipple.ts`
- [ ] `src/hooks/useHaptic.ts`
- [ ] `src/hooks/useDarkMode.ts`

### Updated Files
- [ ] `tailwind.config.js` - Add color system, typography, spacing
- [ ] `index.html` - Add Google Fonts links
- [ ] `src/index.css` - Add base utilities

### Updated Pages
- [ ] `src/pages/Counter.tsx` - Migrate from CounterV2.html
- [ ] `src/pages/Home.tsx` - Migrate from HomeV2.html
- [ ] `src/pages/Goals.tsx` - Migrate from GoalAndReminder.html
- [ ] `src/pages/Progress.tsx` - Migrate from Progress.html

---

## Notes

1. **Icons:** The HTML uses Material Symbols Outlined. Ensure the icon names match when creating the MaterialIcon component.

2. **Arabic Text:** The Counter screen displays Arabic text. Ensure proper RTL support and font rendering.

3. **iOS Safe Areas:** The HTML uses `pb-safe` class for iOS notch support. Add this utility to Tailwind.

4. **Performance:** The glass-card effect uses backdrop-filter which may impact performance. Consider conditional rendering for low-end devices.

5. **Bundle Size:** Monitor bundle size after adding Google Fonts. The 200KB limit is a constraint.

6. **Existing Components:** Some components may already exist (like `ZikrList.tsx`). Evaluate reuse vs replacement.

---

## Next Steps

1. Review this plan with the team
2. Approve design system migration approach
3. Begin Phase 1: Design System Foundation
4. Create branch: `feature/ui-redesign`
5. Start with Phase 1 tasks

---

**Ready to proceed with implementation.** ✨
