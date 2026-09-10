import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import { useZikrStore } from './core/stores/zikrStore';
import { useSessionStore } from './core/stores/sessionStore';
import { useGoalStore } from './core/stores/goalStore';
import { useStreakStore } from './core/stores/streakStore';
import { useSettingsStore } from './core/stores/settingsStore';
import { db } from './core/db/db';
import { seedZikrs } from './core/db/seed';
import { useEffect, useState } from 'react';

// Noor UI (V2)
import WelcomeV2 from '../src-v2/components/Welcome';
import HomeV2 from '../src-v2/pages/Home';
import CounterV2 from '../src-v2/pages/Counter';
import GoalsV2 from '../src-v2/pages/Goals';
import ProgressV2 from '../src-v2/pages/Progress';
import SettingsV2 from '../src-v2/pages/Settings';

// Gate the dashboard on onboarding completion. The flag must be read inside a
// component (keyed by location) so navigation after Welcome sees the fresh value.
function HomeGate() {
  const location = useLocation();
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  return hasSeenWelcome ? (
    <HomeV2 key={location.key} />
  ) : (
    <Navigate to="/welcome" replace />
  );
}

function App() {
  const [storesInitialized, setStoresInitialized] = useState(false);

  useEffect(() => {
    // Seed predefined zikrs on first launch
    seedZikrs(db).catch(err => {
      console.error('Failed to seed zikrs:', err);
    });

    const zikrUnsubscribe = useZikrStore.getState().initialize();
    const sessionUnsubscribe = useSessionStore.getState().initialize();
    const goalUnsubscribe = useGoalStore.getState().initialize();
    const streakUnsubscribe = useStreakStore.getState().initialize();

    // Initialize dark mode — wait for persisted settings first, otherwise a
    // fresh boot races the async load and falls back to the system theme.
    const initializeDarkMode = () => {
      const settingsStore = useSettingsStore.getState();
      const darkModeSetting = settingsStore.getSetting('darkMode');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = darkModeSetting ?? systemPrefersDark;

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    useSettingsStore
      .getState()
      .loadSettings()
      .then(initializeDarkMode)
      .catch(initializeDarkMode);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemPrefChange = (e: MediaQueryListEvent) => {
      const settingsStore = useSettingsStore.getState();
      const darkModeSetting = settingsStore.getSetting('darkMode');
      // Only apply system preference if user hasn't set explicit preference
      if (darkModeSetting === null) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemPrefChange);

    setStoresInitialized(true);

    return () => {
      zikrUnsubscribe();
      sessionUnsubscribe();
      goalUnsubscribe();
      streakUnsubscribe();
      mediaQuery.removeEventListener('change', handleSystemPrefChange);
    };
  }, []);

  if (!storesInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomeGate />} />
            <Route path="/welcome" element={<WelcomeV2 />} />
            <Route path="/home" element={<HomeV2 />} />
            <Route path="/counter" element={<CounterV2 />} />
            <Route path="/goals" element={<GoalsV2 />} />
            <Route path="/progress" element={<ProgressV2 />} />
            <Route path="/settings" element={<SettingsV2 />} />
          </Routes>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
