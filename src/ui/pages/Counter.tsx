/**
 * Counter Screen (V2)
 * Main counter screen with Arabic text, circular progress, haptic feedback
 * NOW INTEGRATED WITH ZUSTAND STORES AND SERVICES
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopAppBar from '../components/navigation/TopAppBar';
import CounterCircle from '../components/CounterCircle';
import MaterialIcon from '../components/MaterialIcon';
import OrnamentDivider from '../components/decor/OrnamentDivider';
import PatternBackdrop from '../components/decor/PatternBackdrop';
import useHaptic from '../hooks/useHaptic';
import { useI18n } from '../../core/i18n';
import { useZikrStore } from '../../core/stores/zikrStore';
import { useSessionStore } from '../../core/stores/sessionStore';
import { useSettingsStore } from '../../core/stores/settingsStore';
import { sessionService } from '../../core/services/sessionService';
import { sharedRoomService } from '../../core/services/sharedRoom';
import { getZikrDisplayInfoFromZikr } from '../utils/zikrMapping';
import { Zikr } from '../../core/db/types';

const Counter: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
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
  // Round flow: when the target is hit, the round saves itself and the UI
  // switches to "Another Round / Done" instead of the manual save button.
  const [isRoundSaved, setIsRoundSaved] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTriggeredRef = useRef(false);
  // Sync mirror of isRoundSaved: clearCurrentSession() can re-run the zikr
  // selection effect before the state flip renders, which would reset the
  // achieved count to zero. Refs are synchronous, so this guard cannot race.
  const isRoundSavedRef = useRef(false);

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
    // While a completed round is on screen, keep the achieved count visible;
    // the user picks "Another Round" or "Done" from here.
    if (isRoundSaved || isRoundSavedRef.current) return;

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
  }, [zikrs, zikrIdParam, currentSession, setCurrentSession, isRoundSaved]);

  const zikrDisplayInfo = selectedZikr ? getZikrDisplayInfoFromZikr(selectedZikr, lang) : null;
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
    setIsRoundSaved(false);
    isRoundSavedRef.current = false;
    autoSaveTriggeredRef.current = false;
    setCurrentSession({
      zikrId: selectedZikr?.id || null,
      count: 0
    });
    haptic('light');
  };

  // Persist a round of `countToSave` reps for the selected zikr
  const persistSession = async (countToSave: number) => {
    if (!selectedZikr) return;
    const countToGoals =
      useSettingsStore.getState().settings.countToGoalsAndGroups ?? true;

    await sessionService.add({
      zikrId: selectedZikr.id!,
      count: countToSave,
      source: 'app',
      timestamp: new Date(),
      date: new Date(),
      editableUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      countsToGoals: countToGoals,
    });

    // Best-effort: the same count also goes to every joined active room
    // counting this zikr, unless the user turned that behaviour off.
    if (countToGoals && selectedZikr.name) {
      try {
        await sharedRoomService.propagateToRooms(selectedZikr.name, countToSave);
      } catch {
        // rooms are best-effort; the session itself is already saved
      }
    }
  };

  // When the target is hit the round saves itself — no save button needed.
  // autoSaveTriggeredRef keeps this to one attempt per round (manual
  // "Finish & Save" remains the fallback if the save fails).
  useEffect(() => {
    if (
      targetCount > 0 &&
      localCount >= targetCount &&
      !isRoundSaved &&
      !isAutoSaving &&
      !autoSaveTriggeredRef.current
    ) {
      const autoSave = async () => {
        autoSaveTriggeredRef.current = true;
        setIsAutoSaving(true);
        try {
          await persistSession(targetCount);
          isRoundSavedRef.current = true;
          setIsRoundSaved(true);
          clearCurrentSession();
          haptic('success');
        } catch (error) {
          console.error('Failed to auto-save round:', error);
          haptic('warning');
        } finally {
          setIsAutoSaving(false);
        }
      };
      void autoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCount, targetCount, isRoundSaved, isAutoSaving]);

  const handleAnotherRound = () => {
    isRoundSavedRef.current = false;
    setIsRoundSaved(false);
    autoSaveTriggeredRef.current = false;
    setLocalCount(0);
    setCurrentSession({
      zikrId: selectedZikr?.id || null,
      count: 0
    });
    haptic('light');
  };

  const handleDone = () => {
    navigate('/?completed=true');
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
      if (e.key === 'Escape' && localCount > 0 && !isRoundSaved) {
        const confirmed = confirm(t('counter.resetConfirm'));
        if (confirmed) {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleIncrement, localCount, haptic, handleReset, isRoundSaved]);

  const handleComplete = async () => {
    if (!selectedZikr || localCount === 0) return;

    try {
      // Save session using sessionService
      await persistSession(localCount);

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
        <div className="text-on-surface-variant">{t('common.loading')}</div>
      </div>
    );
  }

  // No zikrs available
  if (!selectedZikr || !zikrDisplayInfo) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col items-center justify-center p-8 text-center">
        <MaterialIcon icon="error_outline" className="text-6xl text-tertiary-container mb-4" />
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
          {t('counter.noZikrs')}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          {t('counter.noZikrsHint')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-container text-on-primary rounded-xl h-touch-target-min px-8 font-label-md"
        >
          {t('counter.goHome')}
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
            ariaLabel: t('common.settings'),
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

        {/* Reset Button — hidden once the round is saved */}
        {!isRoundSaved && (
          <button
            onClick={handleReset}
            className="mt-8 text-on-surface-variant flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-variant/50 transition-colors z-10 font-caption text-caption active-scale-95"
          >
            <MaterialIcon icon="refresh" className="text-[18px]" />
            {t('counter.reset')}
          </button>
        )}
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-container-padding-mobile pb-[calc(env(safe-area-inset-bottom)+24px)] bg-gradient-to-t from-surface via-surface/90 to-transparent z-40">
        {isRoundSaved ? (
          <div className="w-full flex flex-col items-center gap-3">
            {/* Saved confirmation */}
            <div className="flex items-center gap-2 text-tertiary font-label-md text-label-md">
              <MaterialIcon icon="check_circle" filled className="text-[20px]" />
              <span>{t('counter.roundSaved')}</span>
            </div>
            <div className="w-full flex gap-3">
              <button
                onClick={handleDone}
                className="
                  flex-1 h-touch-target-min
                  rounded-xl border border-outline-variant/40 text-on-surface
                  font-label-md text-label-md
                  flex items-center justify-center gap-2
                  hover:bg-surface-variant/40 active:scale-[0.98] transition-all
                "
              >
                <MaterialIcon icon="home" className="text-[18px]" />
                {t('counter.done')}
              </button>
              <button
                onClick={handleAnotherRound}
                className="
                  flex-1 h-touch-target-min
                  bg-primary-container text-on-primary
                  rounded-xl font-label-md text-label-md
                  flex items-center justify-center gap-2
                  hover:opacity-90 active:scale-[0.98] transition-all shadow-sm
                "
              >
                <MaterialIcon icon="replay" className="text-[18px]" />
                {t('counter.anotherRound')}
              </button>
            </div>
          </div>
        ) : (
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
            {t('counter.complete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default Counter;
