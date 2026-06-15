# ADR 003: PWA Strategy with iOS Limitations

**Status:** Accepted
**Date:** 2026-06-15
**Deciders:** Project Lead

## Context

Zikr is designed as a Progressive Web App (PWA) for broad platform support without app store approval. Target platforms:
- **Android** - Full PWA and Web Push API support
- **iOS** - PWA support but limited notification capabilities
- **Desktop** - Secondary use case, mainly for testing

Key requirements:
- **Reminders** - Users want to be reminded to practice
- **Offline capability** - Must work without network
- **Installability** - "Add to Home Screen" on mobile

## Decision

**Chosen approach: PWA with platform-specific mitigation**

### Android Strategy (Full PWA)
- Use Web Push API for notifications
- Service worker for offline caching
- Full PWA installability

### iOS Strategy (Fallback)
- In-app notification center for reminders
- Transparent communication about limitations
- No background tasks or scheduled notifications
- Service worker still enables offline mode

### Cross-Platform
- PWA manifest for installability
- Service worker for asset caching
- IndexedDB for data persistence (same on all platforms)

## Consequences

### Positive
- **No app store approval** - Instant updates, no review process
- **Cross-platform** - Single codebase for all platforms
- **Zero distribution cost** - No app store fees
- **Web technology** - Familiar stack, easy maintenance

### Negative
- **iOS reminder limitation** - Cannot deliver scheduled notifications on iOS
- **No home screen widget** - PWA limitations on iOS
- **Discoverability** - PWAs less visible than native apps
- **iOS background tasks** - Cannot run in background on iOS

### Risks
- **iOS user experience** - Reminders significantly worse than Android
- **User confusion** - iOS users may expect native-like notifications
- **PWA adoption** - Users unfamiliar with "Add to Home Screen"

## Alternatives Considered

### 1. Native Apps (React Native / Capacitor)
**Pros:**
- Full notification support on iOS
- Home screen widgets
- Better discoverability (app stores)

**Cons:**
- App store approval process (time, cost, rejection risk)
- Separate codebases (iOS + Android) or WebView limitations
- App store fees ($99/year Apple, $25 one-time Google)
- Update delays (app store review)

**Why not chosen:** Violates spirit of $0/month and simple distribution. Time and cost of app store maintenance not justified for personal project.

### 2. Hybrid: PWA + Capacitor
**Pros:**
- PWA wrapped as native app
- App store distribution
- Native notification access

**Cons:**
- Still requires app store process
- Adds Capacitor complexity
- Updates still go through review (can't update PWA independently once wrapped)

**Why not chosen:** Adds complexity without solving core issue (app store dependency)

### 3. Electron for Desktop + PWA for Mobile
**Pros:**
- Native desktop experience

**Cons:**
- Multiple codebases to maintain
- Desktop is not primary use case

**Why not chosen:** Desktop is secondary use case, not worth separate build

### 4. Server-Side Reminder Push (for Android)
**Pros:**
- Reliable scheduled notifications

**Cons:**
- Requires backend infrastructure
- Violates $0/month constraint
- Over-engineering for v1

**Why not chosen:** Deferred to v1.1 or v2. In-app approach sufficient for MVP.

## Related Decisions

- ADR 001: Tech Stack Selection (vite-plugin-pwa for PWA)
- ADR 002: Offline-First Architecture (service worker for caching)

## Implementation Notes

### PWA Configuration (vite-plugin-pwa)
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zikr - Dhikr Counter',
        short_name: 'Zikr',
        description: 'Track your dhikr practice',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        icons: [/* icon definitions */]
      },
      workbox: {
        // Cache strategy for offline mode
        runtimeCaching: [/* cache rules */]
      }
    })
  ]
})
```

### iOS Mitigation Strategy
```typescript
// Notification service
export const notificationService = {
  async requestPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  },

  scheduleReminder(time: Date) {
    if (this.isIOS()) {
      // Store in in-app notification center
      this.storeInAppReminder(time);
    } else {
      // Use Web Push API (future v1.1)
      this.subscribeToPush(time);
    }
  },

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  showiOSLimitationNotice() {
    // Transparent communication
    return 'iOS limits background reminders. Check the app for reminders.';
  }
};
```

### In-App Notification Center
- Simple list of scheduled reminders
- "Snooze" functionality using browser Alarm API if available
- Clear visual indication when reminder is due

### User Communication
- On first open on iOS: show gentle notice about limitations
- In settings: clear explanation of platform differences
- Never hide limitations - transparent communication

### Testing Strategy
- Test on real iOS device
- Test on Android device
- Verify service worker caching
- Test offline mode on both platforms
