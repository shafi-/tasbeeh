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

    setStoresInitialized(true);

    return () => {
      zikrUnsubscribe();
      sessionUnsubscribe();
      goalUnsubscribe();
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
