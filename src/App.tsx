import { HashRouter, Routes, Route } from 'react-router-dom';
import { Counter } from './pages/Counter';
import { Goals } from './pages/Goals';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { Navigation } from './core/components/Navigation';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import { useZikrStore } from './core/stores/zikrStore';
import { useSessionStore } from './core/stores/sessionStore';
import { useGoalStore } from './core/stores/goalStore';
import { useSettingsStore } from './core/stores/settingsStore';
import { db } from './core/db/db';
import { seedZikrs } from './core/db/seed';
import { useEffect, useState } from 'react';

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

    return () => {
      zikrUnsubscribe();
      sessionUnsubscribe();
      goalUnsubscribe();
      mediaQuery.removeEventListener('change', handleSystemPrefChange);
    };
  }, []);

  if (!storesInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Counter />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <Navigation />
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
