# Zikr PWA - UI/UX Design Plan

**Status:** Planning | **Created:** 2026-06-16 | **Type:** Design Vision

## Design Philosophy

### Core Principles

1. **Spiritual Serenity** - The UI should reflect the peaceful, focused nature of dhikr practice. Calm colors, gentle animations, and mindful spacing.

2. **Thumb-Zone First** - All critical actions must be within easy reach of the user's thumb. Primary interaction area: bottom 50% of screen.

3. **Minimal Distraction** - The counter screen should be the most serene space. No clutter, no competing elements. Just the user, their zikr, and the count.

4. **Progressive Disclosure** - Show information gradually. Don't overwhelm users with data. Reveal details on demand.

5. **Cultural Sensitivity** - Use Islamic geometric patterns, calligraphy-inspired typography, and colors that resonate with the spiritual context without being heavy-handed.

### Design Anti-Patterns to Avoid

- ❌ Busy, cluttered interfaces
- ❌ Harsh, high-saturation colors
- ❌ Jarring animations or transitions
- ❌ Generic "tech app" aesthetic
- ❌ Too much data on one screen
- ❌ Inaccessible touch targets (< 44px)
- ❌ Dark mode as an afterthought

---

## Color Palette

### Primary Palette

#### Spiritual Greens (Growth, Peace)
```
Emerald          #10B981    - Primary CTAs, success states  
Sage             #84CC16    - Progress bars, achievements  
Moss             #65A30D    - Secondary actions, accents
```

#### Tranquil Blues (Focus, Calm)
```
Sky              #0EA5E9    - Information, links
Azure            #0284C7    - Active states, focus
Steel            #64748B    - Body text, secondary content
```

#### Warm Neutrals (Grounding)
```
Sand             #F5F5F4    - Light mode backgrounds
Stone            #78716C    - Borders, dividers
Clay             #D6D3D1    - Disabled states
```

### Dark Mode Palette

```
Deep Moss        #064E3B    - Primary dark background (not pure black)
Night Stone      #1C1917    - Card backgrounds
Moon Sand        #292524    - Elevated surfaces
Starlight        #E7E5E4    - Primary text (not pure white)
Mist             #A8A29E    - Secondary text
```

### Semantic Colors

```
Success: Emerald 600      - Goals completed, streaks achieved  
Warning: Amber 600        - Soft reminders, notifications  
Error: Rose 600          - Delete actions, errors  
Info: Sky 600            - Help text, tips
```

### Accent Colors (Special Occasions)

```
Ramadan Gold     #F59E0B    - Special occasions, milestones  
Eid Celebration   #8B5CF6    - Achievement celebrations  
```

### Accessibility Standards

- All color combinations meet WCAG 2.1 AA (4.5:1 contrast minimum)
- Dark mode not inverted—purposefully designed for reduced eye strain
- Color never the only indicator (use icons, patterns, text together)

---

## Typography System

### Font Families

```css
/* Primary - headings, displays */
--font-display: 'Amiri', 'Noto Naskh Arabic', serif;

/* Body - UI text, paragraphs */
--font-body: 'Inter', system-ui, sans-serif;

/* Monospace - numbers, counters */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Rationale:** Amiri brings warmth and cultural relevance without being decorative. Inter ensures UI readability. Monospace for counters prevents jitter as numbers change width.

### Type Scale

```css
/* Counter Display - The hero element */
text-hero:           8rem (128px) - Counter screen count

/* Headings */
text-display-xl:     3rem (48px)  - Screen titles
text-display-lg:     2.25rem (36px) - Section headers
text-display-md:     1.5rem (24px)  - Card titles

/* Body */
text-body-lg:        1.125rem (18px) - Emphasized content
text-body:           1rem (16px)     - Base text
text-body-sm:        0.875rem (14px) - Secondary text

/* UI Elements */
text-ui:             0.75rem (12px)  - Buttons, badges, labels
text-ui-xs:          0.625rem (10px) - Fine print
```

### Font Weights

```css
weight-light:        300  - Large counters, decorative text
weight-regular:      400  - Body text
weight-medium:       500  - Emphasized content, card titles
weight-semibold:      600  - Headings, important text
weight-bold:         700  - CTAs, alerts
```

### Line Heights

```css
leading-tight:       1.25  - Headings
leading-normal:      1.5   - Body text
leading-relaxed:     1.75  - Long-form content
```

---

## Component Design System

### 1. Counter Screen (The Heart of the App)

#### Current Issues
- Too much white space feels clinical
- No sense of progression or achievement
- Zikr selector is hidden in modal
- Streak badge placement breaks visual flow

#### Proposed Redesign

**Layout:**
```
┌─────────────────────────────────────┐
│ ☰  SubhanAllah           🔥 5 day   │  ← Top bar (60px)
├─────────────────────────────────────┤
│                                       │
│           [333]  🧿                  │  ← Hero (50% screen)
│     Current count this session        │
│                                       │
├─────────────────────────────────────┤
│                                       │
│      Today: 1,234 total              │  ← Context strip (80px)
│      33% to daily goal               │
│                                       │
├─────────────────────────────────────┤
│                                       │
│                                       │
│                                       │  ← Tap zone (rest)
│         TAP TO COUNT                 │
│      (long press to reset)            │
│                                       │
│                                       │
└─────────────────────────────────────┘
```

**Improvements:**

1. **Top Bar (60px)**
   - Left: Menu icon (hamburger) - opens quick settings
   - Center: Current zikr name (tappable to change)
   - Right: Streak badge with fire animation
   - Background: Subtle gradient (emerald to moss)
   - Pattern: Faint Islamic geometric overlay

2. **Hero Section (50% screen)**
   - Count in monospace font, 128px, dark emerald (light mode) / emerald-300 (dark)
   - Below count: "Current session" in small label
   - Haptic feedback on every tap
   - Micro-animation: Number scales up briefly (0.9s → 1.0s) on increment
   - Progress ring around count (circular SVG) filling as user approaches target

3. **Context Strip (80px)**
   - Today's total: "1,234 dhikr today" in medium weight
   - Mini progress bar: 33% to daily goal
   - Links to Progress screen on tap
   - Background: Subtle tint, separates tap zone

4. **Tap Zone (remaining height)**
   - Large tappable area (entire bottom section)
   - Centered text: "TAP TO COUNT"
   - Subtext: "Long press to reset"
   - Background: Light emerald gradient (subtle)
   - On tap: Ripple effect from touch point

5. **Interactions**
   - Tap: Increment + haptic + number scale animation
   - Long press (1s): Show confirmation modal before reset
   - Swipe up: Quick stats panel (today's breakdown by zikr)
   - Swipe down: Manual entry modal

#### Empty State

If no zikr selected:
```
┌─────────────────────────────────────┐
│        Welcome to Zikr               │
│                                       │
│    🧿                                 │
│  Begin your spiritual practice        │
│                                       │
│  [Select a zikr to start]            │
│                                       │
│  Quick start:                         │
│  • SubhanAllah                        │
│  • Alhamdulillah                      │
│  • Allahu Akbar                       │
└─────────────────────────────────────┘
```

---

### 2. Bottom Navigation

#### Current Issues
- Dark slate (#0f172a) feels too heavy
- Emojis are generic
- Active state is subtle (could be clearer)

#### Proposed Redesign

**Visual Design:**
```
Height: 64px
Background: Glass morphism (backdrop-filter: blur(12px))
Border-top: 1px solid with alpha channel
```

**Tab States:**

1. **Inactive Tab**
   - Icon: Stone color (#78716C)
   - Label: Hidden (show only on hover/tap for cleaner look)
   - No background

2. **Active Tab**
   - Icon: Emerald (#10B981)
   - Label: Visible below icon, medium weight
   - Background: Subtle emerald tint with rounded corners
   - Height: 48px (pill shape)

3. **Manual Entry Button (FAB)**
   - Centered, elevated above nav bar
   - Circle, 56px diameter
   - Icon: Plus sign in emerald
   - Background: Emerald with subtle shadow
   - Animation: Scale up on press

**Tab Icons (Custom SVG, Not Emojis)**

Design custom icons for:
- Counter: Circular progress with arrow
- Goals: Target with arrow
- Progress: Bar chart with upward trend
- Settings: Gear with smooth teeth
- Manual Entry: Plus sign in circle

**Icon Animation:**
- On tap: Scale down (0.9 → 1.0) with spring animation
- On active state: Subtle bounce effect

---

### 3. Goals Screen

#### Current Issues
- Basic list format doesn't inspire action
- Progress bars are generic
- No sense of urgency or achievement

#### Proposed Redesign

**Card-Based Layout:**

Each goal is a card with:

1. **Card Header**
   - Zikr name (bold, 18px)
   - Badge: "Daily" | "Weekly" | "Monthly"
   - Three-dot menu (pause, edit, delete)

2. **Progress Visualization**
   - Large circular progress indicator (not just linear bar)
   - Center of circle: "XX%" with count below
   - Color gradient: Emerald → Sage as it fills

3. **Motivational Message**
   - Below progress: Contextual message
   - Examples:
     - "Almost there! 12 more to reach your goal"
     - "Great start! Keep it going"
     - "You've hit your daily target! 🎉"

4. **Streak Integration**
   - Mini streak badge next to progress
   - "🔥 5 day streak" (compact)

5. **Quick Actions**
   - Tap card: View detailed progress (navigate to breakdown)
   - Long press: Quick menu (pause, edit, delete)

**Empty State:**
```
┌─────────────────────────────────────┐
│        Your Goals                   │
│                                       │
│    Set intentions for your practice  │
│                                       │
│    [Create Your First Goal]         │
│                                       │
│    Goal ideas:                       │
│    • Daily: 100 SubhanAllah          │
│    • Weekly: 500 Alhamdulillah       │
│    • Custom: Choose your target      │
└─────────────────────────────────────┘
```

---

### 4. Progress Screen

#### Current Issues
- Too much data presented at once
- Weekly chart is basic
- No storytelling or narrative

#### Proposed Redesign

**Section-Based Layout:**

1. **Hero Summary (Top 25%)**
   - "Today's Practice" heading
   - Large number: "1,234 dhikr"
   - Subtext: "Across 3 zikrs"
   - Trend indicator: "↑ 15% from yesterday"
   - Background: Subtle gradient

2. **Today's Breakdown (Next 30%)**
   - Horizontal bar chart (not vertical, better for mobile)
   - Each zikr as a colored bar
   - Tappable to see session history for that zikr
   - Percentages next to each bar

3. **Weekly Trend (Next 25%)**
   - Smooth line chart (not bar chart)
   - X-axis: Mon-Sun
   - Y-axis: Total count
   - Today's point highlighted with emerald circle
   - Fill area under line with gradient

4. **Streaks & Achievements (Bottom 20%)**
   - Grid of cards (2 columns)
   - Each card: Zikr name + streak badge
   - Special achievements: "🏆 Best: 33 day streak"

**Interactive Elements:**
- Tap any section: Expand to detailed view
- Long press chart: See exact numbers for each day
- Swipe left: Navigate to next week/month

---

### 5. Settings Screen

#### Current Issues
- Basic list format
- No visual hierarchy
- Important actions (export/import) are buried

#### Proposed Redesign

**Grouped Sections:**

1. **Preferences (Top)**
   - Dark mode toggle (with icon)
   - Haptic feedback toggle
   - Sound effects toggle (future)

2. **Data Management (Middle)**
   - Export data (button, not link)
   - Import data (button, not link)
   - Clear all data (destructive, red text)

3. **About (Bottom)**
   - App version
   - Platform limitations info
   - Acknowledgments

**Visual Design:**
- Grouped by card containers with subtle shadows
- Icons for each setting (custom SVGs)
- Toggle switches with smooth animations
- Destructive actions clearly marked with rose color

---

### 6. Manual Entry Modal

#### Current Issues
- Form is functional but not inviting
- No quick-add buttons
- Date/time pickers are standard HTML

#### Proposed Redesign

**Streamlined Layout:**

1. **Header**
   - "Log Session" title
   - Close button (X) in top-right

2. **Zikr Selector**
   - Large dropdown with search
   - Shows last-used zikr as default
   - Badge: "Last: 33 dhikr"

3. **Quick-Add Buttons**
   - Row of buttons: [33] [100] [500] [1000]
   - Tap to pre-fill count input
   - Active state: Emerald background

4. **Count Input**
   - Large, centered number input
   - Step buttons (-1, +1) on sides
   - Validation: "Must be at least 1"

5. **Date/Time Picker**
   - Two modes: Quick presets | Full picker
   - Quick presets: "Now", "This morning", "Yesterday"
   - Full picker: Native date + time inputs with custom styling

6. **Save Button**
   - Full-width, bottom of modal
   - Text: "Save Session" (or "Save 33 dhikr")
   - Disabled until valid

**Progressive Enhancement:**
- First time: Show tooltips explaining each field
- Subsequent times: Hide tooltips, show clean form
- Power user: Add "Bulk Entry" mode (link to separate flow)

---

## Micro-Interactions & Animations

### Animation Principles

1. **Purposeful Motion** - Every animation has a job (feedback, guidance, delight)
2. **Performance First** - 60fps minimum, prefer CSS transforms
3. **Respect Preferences** - Honor `prefers-reduced-motion`

### Key Animations

#### 1. Counter Increment
```css
@keyframes countPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Apply on each tap */
.count-display {
  animation: countPulse 150ms ease-out;
}
```

#### 2. Streak Badge Fire
```css
@keyframes flameFlicker {
  0%, 100% { transform: scale(1) rotate(-2deg); }
  50% { transform: scale(1.05) rotate(2deg); }
}

.streak-fire {
  animation: flameFlicker 2s ease-in-out infinite;
}
```

#### 3. Goal Completion Celebration
```css
@keyframes confettiBurst {
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  100% { transform: scale(1.5) rotate(360deg); opacity: 0; }
}

/* Spawn 10-20 particles on goal completion */
```

#### 4. Progress Ring Fill
```css
/* SVG stroke-dasharray animation */
.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease-out;
}
```

#### 5. Page Transitions
```css
/* Slide from right */
.page-enter {
  animation: slideInRight 200ms ease-out;
}

/* Fade out */
.page-exit {
  animation: fadeOut 150ms ease-in;
}
```

#### 6. Modal Open/Close
```css
/* Scale up from center */
.modal-enter {
  animation: scaleUp 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-exit {
  animation: scaleDown 150ms ease-in;
}
```

### Haptic Feedback Patterns

```javascript
// Light feedback: UI interactions
hapticTap = { duration: 10 }

// Medium feedback: Button presses
hapticPress = { duration: 20 }

// Strong feedback: Goal completion
hapticSuccess = [{ duration: 30 }, { delay: 50, duration: 30 }]

// Warning: Delete actions
hapticWarning = [{ duration: 50 }, { delay: 100, duration: 50 }]
```

---

## Responsive Design Strategy

### Mobile-First Approach

**Base Design (320px - 375px):**
- Single column layouts
- Bottom navigation
- Full-width cards
- 44px minimum touch targets

**Medium Screens (376px - 768px):**
- Two-column grids where appropriate
- Max-width containers (640px) centered
- Larger tap areas (48px)

**Large Screens (769px+):**
- Side-by-side layouts (progress: chart + breakdown)
- Max-width containers maintain focus
- Hover states for touch-inactive devices

### Breakpoints

```css
/* Mobile first (default) */
/* No media query needed */

/* Small phones */
@media (min-width: 375px) {
  .container { max-width: 360px; }
}

/* Large phones */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

/* Tablets */
@media (min-width: 768px) {
  .container { max-width: 720px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
```

---

## Accessibility (A11y) Standards

### WCAG 2.1 AA Compliance

**Color Contrast:**
- All text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum against background

**Touch Targets:**
- Minimum: 44x44px
- Preferred: 48x48px
- Spacing: 8px between targets

**Keyboard Navigation:**
- All interactive elements keyboard-accessible
- Logical tab order
- Visible focus indicators (2px solid emerald)
- Escape key closes modals
- Enter/Space activates buttons

**Screen Reader Support:**
- ARIA labels on all icon-only buttons
- Live regions for dynamic content (count updates, toasts)
- Semantic HTML (headings, lists, landmarks)
- Alt text for all images

**Motion Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode Strategy

### Not an Inversion—A Reinterpretation

Dark mode should feel like a serene night practice, not just inverted colors.

### Key Principles

1. **Backgrounds Not Pure Black**
   - Primary: #1C1917 (deep warm gray)
   - Elevated: #292524 (slightly lighter)
   - Cards: #292524 with subtle border

2. **Text Not Pure White**
   - Primary: #E7E5E4 (warm off-white)
   - Secondary: #A8A29E (muted gray)

3. **Colors Adjusted**
   - Emerald becomes slightly lighter: #34D399
   - Blues desaturated: #0EA5E9 → #38BDF8
   - Avoid neon—aim for muted richness

4. **Shadows Become Glows**
   - Replace box-shadow with subtle border highlights
   - Use inner shadows for depth

### Implementation

```css
/* Light mode (default) */
:root {
  --bg-primary: #F5F5F4;
  --bg-elevated: #FFFFFF;
  --text-primary: #1C1917;
  --text-secondary: #78716C;
}

/* Dark mode */
.dark {
  --bg-primary: #1C1917;
  --bg-elevated: #292524;
  --text-primary: #E7E5E4;
  --text-secondary: #A8A29E;
}
```

---

## Loading & Empty States

### Loading States

**Global Loading (App Start):**
```
┌─────────────────────────────────────┐
│                                       │
│         🧿                            │
│      Zikr                            │
│                                       │
│    [Three dots animation]             │
│    Preparing your practice...        │
│                                       │
└─────────────────────────────────────┘
```

**In-Place Loading:**
- Skeleton screens for lists (cards with gray blocks)
- Spinner for small actions (button-level)
- Progress bar for long operations (data import)

### Empty States

Each screen has a thoughtful empty state:

**Counter:**
- "Welcome to Zikr" + CTA to select zikr

**Goals:**
- "Set your intentions" + CTA to create first goal

**Progress:**
- "Begin your journey" + CTA to go to counter

**Settings:**
- No empty state (always has content)

**Pattern:**
1. Friendly illustration (emoji or simple SVG)
2. Encouraging message
3. Clear CTA button
4. Optional: Quick tips or suggestions

---

## Error Handling & Feedback

### Error Message Design

**Inline Errors:**
- Rose colored text
- Icon: ⚠️
- Below the relevant field
- Clear action: "Enter a number greater than 0"

**Toast Notifications:**
- Slide in from top
- Auto-dismiss after 4s
- Swipe to dismiss
- Success: Emerald background
- Error: Rose background
- Info: Sky background

**Modal Errors:**
- Overlay with dark background
- Clear icon (❌ or ⚠️)
- Explanation in plain language
- Action button: "Try Again" or "Dismiss"

### Feedback Examples

**Success:**
- "Session saved: 33 dhikr"
- "Goal created successfully"
- "Data exported to zikr-backup-2024-06-16.json"

**Error:**
- "Couldn't save session. Please try again."
- "Storage is full. Delete old sessions or clear browser data."
- "Invalid file. Please upload a valid backup."

**Warning:**
- "You have unsaved changes. Are you sure you want to leave?"
- "This will delete all data. This action cannot be undone."

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Design System Setup:**
- [ ] Define Tailwind config with custom colors, fonts, spacing
- [ ] Create global CSS with animations, transitions
- [ ] Build reusable components: Button, Card, Modal, Input
- [ ] Set up dark mode toggle in settings

**Color & Typography:**
- [ ] Apply new color palette to all screens
- [ ] Integrate Amiri font (via Google Fonts or local)
- [ ] Update type scale across all components

### Phase 2: Screen Redesigns (Week 2-3)

**Counter Screen:**
- [ ] Implement new hero layout with progress ring
- [ ] Add context strip (today's total)
- [ ] Redesign tap zone with ripple effect
- [ ] Add swipe gestures (up: stats, down: manual entry)
- [ ] Implement empty state

**Navigation:**
- [ ] Redesign bottom nav with glass morphism
- [ ] Create custom SVG icons (replace emojis)
- [ ] Add FAB for manual entry
- [ ] Implement active state animations

**Goals Screen:**
- [ ] Redesign goal cards with circular progress
- [ ] Add motivational messages
- [ ] Integrate streak badges
- [ ] Implement empty state

**Progress Screen:**
- [ ] Redesign hero summary
- [ ] Create horizontal breakdown chart
- [ ] Implement smooth line chart for weekly trend
- [ ] Add streak cards grid
- [ ] Make charts interactive (tap to expand)

**Settings Screen:**
- [ ] Group into sections with card containers
- [ ] Add icons for each setting
- [ ] Elevate data management actions
- [ ] Improve platform limitations info

### Phase 3: Polish & Animations (Week 4)

**Micro-Interactions:**
- [ ] Implement counter increment animation
- [ ] Add streak badge fire animation
- [ ] Create goal completion celebration
- [ ] Implement progress ring fill animation
- [ ] Add page transition animations

**Haptic Feedback:**
- [ ] Define haptic patterns (tap, press, success, warning)
- [ ] Integrate into all interactions
- [ ] Test on real devices

**Accessibility:**
- [ ] Audit color contrast with axe DevTools
- [ ] Add ARIA labels to all interactive elements
- [ ] Test keyboard navigation
- [ ] Verify screen reader support
- [ ] Honor prefers-reduced-motion

### Phase 4: Testing & Refinement (Week 5)

**User Testing:**
- [ ] Test on real devices (iOS, Android, various screen sizes)
- [ ] Gather feedback on animations (too fast/slow?)
- [ ] Verify dark mode readability
- [ ] Test touch targets with real users
- [ ] Validate accessibility with screen readers

**Performance:**
- [ ] Measure animation frame rates (target: 60fps)
- [ ] Optimize bundle size (new fonts, icons)
- [ ] Test on slow 3G networks
- [ ] Verify Lighthouse score (target: 90+)

**Refinement:**
- [ ] Adjust animation timing based on feedback
- [ ] Fine-tune color contrast
- [ ] Polish empty states
- [ ] Improve error messages clarity

---

## Design Tokens Reference

### Spacing Scale

```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-5: 1.25rem (20px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

### Border Radius

```css
--radius-sm: 0.25rem (4px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-full: 9999px (circle)
```

### Shadows

```css
/* Light mode */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)

/* Dark mode */
--shadow-dark-sm: 0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-dark-md: 0 4px 6px rgba(0, 0, 0, 0.4)
--shadow-dark-lg: 0 10px 15px rgba(0, 0, 0, 0.5)
```

### Z-Index Scale

```css
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

---

## Inspiration & References

### Design Inspirations

- **Headspace** - Calm, playful, spiritual aesthetic
- **Todoist** - Clean productivity with delightful micro-interactions
- **Quran.com** - Islamic design patterns done right
- **Forest app** - Gamification without heavy-handedness
- **Streaks** - Beautiful goal visualization

### Islamic Design Patterns

- **Geometric Patterns:** Subtle background overlays, not overwhelming
- **Calligraphy:** Amiri font for headings, not decorative text
- **Color:** Emerald greens, golds, deep blues (not neon or oversaturated)
- **Balance:** Symmetrical layouts, centered content, generous whitespace

### Mobile UX Patterns

- **Thumb Zone Navigation:** Critical actions in bottom 50% of screen
- **Gestures:** Swipe down to refresh, long press for context menu
- **Progressive Disclosure:** Show details on demand, not all at once
- **Feedback First:** Every interaction has immediate visual/haptic feedback

---

## Measurement & Success Metrics

### UX Metrics to Track

- **Time to First Count:** < 5 seconds from app launch
- **Session Completion Rate:** % of sessions that reach target (33, 100)
- **Streak Retention:** % of users who maintain 7+ day streaks
- **Feature Discovery:** % of users who find manual entry, goals
- **Error Rate:** % of actions that fail (target: < 1%)

### A/B Test Ideas

1. **Counter Layout:** Hero number size (120px vs 144px)
2. **Progress Ring:** Circular vs linear bar chart
3. **Streak Badge:** Fire emoji vs text-only ("5 day streak")
4. **Empty States:** Illustration vs text-only

### User Feedback Methods

- **In-App Feedback:** "How's your experience?" prompt after 10 sessions
- **Settings Link:** "Send feedback" button in settings
- **Analytics:** Track screen flow, feature usage (privacy-first, no PII)

---

## File Structure

```
src/
├── design/
│   ├── tokens/
│   │   ├── colors.ts          # Color palette definitions
│   │   ├── typography.ts      # Type scale, font families
│   │   └── spacing.ts         # Spacing scale
│   ├── components/
│   │   ├── Button.tsx         # Reusable button component
│   │   ├── Card.tsx           # Reusable card component
│   │   ├── Modal.tsx          # Reusable modal component
│   │   └── ProgressRing.tsx   # Circular progress component
│   ├── animations/
│   │   ├── countPulse.ts      # Counter increment animation
│   │   ├── streakFire.ts      # Streak badge animation
│   │   └── pageTransitions.ts # Screen transitions
│   └── icons/
│       ├── CounterIcon.tsx    # Custom SVG icons
│       ├── GoalsIcon.tsx
│       └── ...
├── pages/
│   ├── Counter.tsx            # Redesigned counter screen
│   ├── Goals.tsx              # Redesigned goals screen
│   ├── Progress.tsx           # Redesigned progress screen
│   └── Settings.tsx           # Redesigned settings screen
└── styles/
    ├── global.css             # Global styles, animations
    └── dark-mode.css          # Dark mode overrides
```

---

## Next Steps

1. **Review & Approve** - Stakeholders review this plan
2. **Create Mockups** - Build high-fidelity Figma/Sketch mockups
3. **Prototype** - Create interactive prototype for testing
4. **User Testing** - Validate design decisions with real users
5. **Begin Implementation** - Follow Phase 1-4 roadmap above

---

## Appendix: Design Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Emerald primary color | Spiritual significance in Islamic culture, calming | 2026-06-16 |
| Amiri font for headings | Cultural relevance, excellent Arabic support | 2026-06-16 |
| Circular progress over linear | More visually engaging, works better on mobile | 2026-06-16 |
| Glass morphism for navigation | Modern feel, maintains context with content below | 2026-06-16 |
| Monospace for counter numbers | Prevents jitter as digits change width | 2026-06-16 |
| Dark mode not pure black | Reduces eye strain, feels more premium | 2026-06-16 |

---

*This plan is a living document. Update as decisions are made and user feedback is collected.*
