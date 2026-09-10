/**
 * Counter Screen (V2)
 * Main counter screen with Arabic text, circular progress, haptic feedback
 * NOW INTEGRATED WITH ZUSTAND STORES AND SERVICES
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopAppBar from '../components/navigation/TopAppBar';
import CounterCircle from '../components/CounterCircle';
import MaterialIcon from '../components/MaterialIcon';
import OrnamentDivider from '../components/decor/OrnamentDivider';
import PatternBackdrop from '../components/decor/PatternBackdrop';
import useHaptic from '../hooks/useHaptic';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { useSessionStore } from '../../src/core/stores/sessionStore';
import { useSettingsStore } from '../../src/core/stores/settingsStore';
import { sessionService } from '../../src/core/services/sessionService';
import { getZikrDisplayInfo } from '../utils/zikrMapping';
import { Zikr } from '../../src/core/db/types';

const Counter: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const zikrIdParam = searchParams.get('zikrId');

  // Store integrations
  const zikrs = useZikrStore(state => state.zikrs);
  const zikrsLoading = useZikrStore(state => state.loading);
  const currentSession = useSessionStore(state => state.currentSession);
  const setCurrentSession = useSessionStore(state => state.setCurrentSession);
  const clearCurrentSession = useSessionStore(state => state.clearCurrentSession);
  const settings = useSettingsStore(state => state.settings);
  const saveSetting = useSettingsStore(state => state.saveSetting);

  // Local state
  const [localCount, setLocalCount] = useState(0);
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);

  // Load settings
  useEffect(() => {
    useSettingsStore.getState().loadSettings();
  }, []);

  // Determine haptics enabled state
  const hapticsEnabled = settings.hapticsEnabled ?? true;
  const setHapticsEnabled = async (value: boolean) => {
    await saveSetting('hapticsEnabled', value);
  };

  const { trigger: haptic } = useHaptic(hapticsEnabled);

  // Find the zikr to practice
  useEffect(() => {
    if (zikrs.length === 0) return;

    let zikrToUse: Zikr | undefined;

    if (zikrIdParam) {
      // Use the zikr from URL parameter
      zikrToUse = zikrs.find(z => z.id === Number(zikrIdParam));
    } else if (currentSession.zikrId) {
      // Continue with current session
      zikrToUse = zikrs.find(z => z.id === currentSession.zikrId);
    }

    // Default to first zikr if none selected
    if (!zikrToUse && zikrs.length > 0) {
      zikrToUse = zikrs[0];
    }

    if (zikrToUse) {
      setSelectedZikr(zikrToUse);
      // Initialize count from current session or reset
      if (currentSession.zikrId === zikrToUse.id) {
        setLocalCount(currentSession.count);
      } else {
        setLocalCount(0);
        setCurrentSession({ zikrId: zikrToUse.id || null, count: 0 });
      }
    }
  }, [zikrs, zikrIdParam, currentSession, setCurrentSession]);

  const zikrDisplayInfo = selectedZikr ? getZikrDisplayInfo(selectedZikr.name) : null;
  const targetCount = zikrDisplayInfo?.defaultTarget || 33;

  const handleIncrement = () => {
    if (localCount < targetCount) {
      const newCount = localCount + 1;
      setLocalCount(newCount);
      setCurrentSession({
        zikrId: selectedZikr?.id || null,
        count: newCount
      });
    }
  };

  const handleReset = () => {
    setLocalCount(0);
    setCurrentSession({
      zikrId: selectedZikr?.id || null,
      count: 0
    });
    haptic('light');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Space or Enter to increment
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        handleIncrement();
        haptic('light');
      }
      // Escape to reset (with confirmation)
      if (e.key === 'Escape' && localCount > 0) {
        const confirmed = confirm('Reset counter to zero?');
        if (confirmed) {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleIncrement, localCount, haptic, handleReset]);

  const handleComplete = async () => {
    if (!selectedZikr || localCount === 0) return;

    try {
      // Save session using sessionService
      await sessionService.add({
        zikrId: selectedZikr.id!,
        count: localCount,
        source: 'app',
        timestamp: new Date(),
        date: new Date(),
        editableUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Clear current session
      clearCurrentSession();

      // Success feedback
      haptic('success');

      // Navigate back to home
      navigate('/?completed=true');
    } catch (error) {
      console.error('Failed to save session:', error);
      haptic('warning');
    }
  };

  const handleToggleHaptics = () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabled(newValue);
    if (newValue) haptic('light');
  };

  // Loading state
  if (zikrsLoading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  // No zikrs available
  if (!selectedZikr || !zikrDisplayInfo) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col items-center justify-center p-8 text-center">
        <MaterialIcon icon="error_outline" className="text-6xl text-tertiary-container mb-4" />
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
          No Zikrs Available
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Create a zikr to start practicing.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-container text-on-primary rounded-xl h-touch-target-min px-8 font-label-md"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col overflow-hidden relative max-w-md mx-auto">
      {/* Top App Bar */}
      <TopAppBar
        title={selectedZikr.name}
        showClose
        onClose={() => navigate('/')}
        actions={[
          {
            icon: hapticsEnabled ? 'vibration' : 'smartphone',
            onClick: handleToggleHaptics,
            ariaLabel: 'Toggle haptic feedback',
          },
          {
            icon: 'settings',
            onClick: () => navigate('/settings'),
            ariaLabel: 'Settings',
          },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-32 px-container-padding-mobile relative">
        {/* Khatam pattern backdrop */}
        <PatternBackdrop className="absolute inset-0" />

        {/* Zikr Info */}
        <div className="text-center mb-12 z-10 flex flex-col gap-4">
          {zikrDisplayInfo.arabicText && (
            <h1 className="font-display-arabic text-display-arabic text-primary" lang="ar" dir="rtl">
              {zikrDisplayInfo.arabicText}
            </h1>
          )}
          <OrnamentDivider className="w-44 mx-auto" />
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {zikrDisplayInfo.translation}
          </p>
        </div>

        {/* Counter Circle */}
        <CounterCircle
          count={localCount}
          target={targetCount}
          onIncrement={handleIncrement}
          hapticsEnabled={hapticsEnabled}
        />

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="mt-8 text-on-surface-variant flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-variant/50 transition-colors z-10 font-caption text-caption active-scale-95"
        >
          <MaterialIcon icon="refresh" className="text-[18px]" />
          Reset
        </button>
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-container-padding-mobile pb-[calc(env(safe-area-inset-bottom)+24px)] bg-gradient-to-t from-surface via-surface/90 to-transparent z-40">
        <button
          onClick={handleComplete}
          disabled={localCount === 0}
          className="
            w-full h-touch-target-min
            bg-primary-container text-on-primary
            rounded-xl font-label-md text-label-md
            flex items-center justify-center gap-2
            hover:opacity-90 active-scale-98 transition-all shadow-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <MaterialIcon icon="check_circle" className="text-[20px]" />
          Complete Session
        </button>
      </div>
    </div>
  );
};

export default Counter;
