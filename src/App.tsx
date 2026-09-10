import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Counter } from './pages/Counter';
import { Goals } from './pages/Goals';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { Navigation } from './core/components/Navigation';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import { useZikrStore } from './core/stores/zikrStore';
import { useSessionStore } from './core/stores/sessionStore';
import { useGoalStore } from './core/stores/goalStore';
import { useStreakStore } from './core/stores/streakStore';
import { useSettingsStore } from './core/stores/settingsStore';
import { db } from './core/db/db';
import { seedZikrs } from './core/db/seed';
import { useEffect, useState } from 'react';

// V2 Pages
import WelcomeV2 from '../src-v2/components/Welcome';
import HomeV2 from '../src-v2/pages/Home';
import CounterV2 from '../src-v2/pages/Counter';
import GoalsV2 from '../src-v2/pages/Goals';
import ProgressV2 from '../src-v2/pages/Progress';
import SettingsV2 from '../src-v2/pages/Settings';

// V2 Toggle Button Component
function VersionToggle() {
  const [version, setVersion] = useState<'v1' | 'v2'>(
    () => (localStorage.getItem('appVersion') as 'v1' | 'v2') || 'v1'
  );

  const toggleVersion = () => {
    const newVersion = version === 'v1' ? 'v2' : 'v1';
    setVersion(newVersion);
    localStorage.setItem('appVersion', newVersion);
    // Force reload to apply version change
    window.location.reload();
  };

  return (
    <button
      onClick={toggleVersion}
      className="fixed top-4 right-4 z-[100] bg-surface-variant/80 backdrop-blur px-3 py-2 rounded-lg text-xs font-mono border border-outline-variant/50 hover:bg-surface-variant transition-colors"
      title="Toggle between V1 and V2 designs"
    >
      {version.toUpperCase()}
    </button>
  );
}

function App() {
  const [storesInitialized, setStoresInitialized] = useState(false);
  const [appVersion, setAppVersion] = useState<'v1' | 'v2'>(
    () => (localStorage.getItem('appVersion') as 'v1' | 'v2') || 'v1'
  );

  useEffect(() => {
    // Seed predefined zikrs on first launch
    seedZikrs(db).catch(err => {
      console.error('Failed to seed zikrs:', err);
    });

    const zikrUnsubscribe = useZikrStore.getState().initialize();
    const sessionUnsubscribe = useSessionStore.getState().initialize();
    const goalUnsubscribe = useGoalStore.getState().initialize();
    const streakUnsubscribe = useStreakStore.getState().initialize();

    // Initialize dark mode
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

    initializeDarkMode();

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

    // Listen for version changes
    const handleVersionChange = () => {
      const newVersion = localStorage.getItem('appVersion') as 'v1' | 'v2' || 'v1';
      setAppVersion(newVersion);
    };

    window.addEventListener('storage', handleVersionChange);

    return () => {
      zikrUnsubscribe();
      sessionUnsubscribe();
      goalUnsubscribe();
      streakUnsubscribe();
      mediaQuery.removeEventListener('change', handleSystemPrefChange);
      window.removeEventListener('storage', handleVersionChange);
    };
  }, []);

  if (!storesInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  // V1 Routes
  const v1Routes = (
    <>
      <Route path="/" element={<Counter />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/settings" element={<Settings />} />
    </>
  );

  // V2 Routes
  const v2Routes = (
    <>
      <Route
        path="/"
        element={
          localStorage.getItem('hasSeenWelcome') ? (
            <HomeV2 />
          ) : (
            <Navigate to="/welcome" replace />
          )
        }
      />
      <Route path="/welcome" element={<WelcomeV2 />} />
      <Route path="/home" element={<HomeV2 />} />
      <Route path="/counter" element={<CounterV2 />} />
      <Route path="/goals" element={<GoalsV2 />} />
      <Route path="/progress" element={<ProgressV2 />} />
      <Route path="/settings" element={<SettingsV2 />} />
    </>
  );

  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen">
          <VersionToggle />
          <Routes>
            {appVersion === 'v1' ? v1Routes : v2Routes}
          </Routes>
          {appVersion === 'v1' && <Navigation />}
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
