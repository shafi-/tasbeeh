import { useState, useEffect } from 'react';
import { useSessionStore } from '../core/stores/sessionStore';
import { useUIStore } from '../core/stores/uiStore';
import { sessionService } from '../core/services/sessionService';
import { useHaptic } from '../hooks/useHaptic';
import { ZikrList } from '../components/ZikrList';
import { Zikr } from '../core/db/types';

export function Counter() {
  const currentSession = useSessionStore(state => state.currentSession);
  const setCurrentSession = useSessionStore(state => state.setCurrentSession);
  const uiStore = useUIStore();
  const { triggerHaptic } = useHaptic();

  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showZikrSelector, setShowZikrSelector] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [countSaving, setCountSaving] = useState(false);

  // Restore counter state on mount
  useEffect(() => {
    if (uiStore.counterState > 0) {
      setCurrentSession({
        zikrId: currentSession?.zikrId || null,
        count: uiStore.counterState
      });
    }
  }, []);

  // Auto-save on app close
  useEffect(() => {
    const handleBlur = async () => {
      if (currentSession?.count > 0 && selectedZikr) {
        await handleAutoSave(currentSession.count, false);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [currentSession, selectedZikr]);

  const handleTap = () => {
    if (!selectedZikr) {
      setShowZikrSelector(true);
      return;
    }

    triggerHaptic();
    const newCount = currentSession.count + 1;

    setCurrentSession({
      zikrId: selectedZikr.id!,
      count: newCount
    });

    uiStore.setCounterState(newCount);

    // Auto-save check
    if (newCount === 33 || newCount === 100) {
      handleAutoSave(newCount, true);
    }
  };

  const handleAutoSave = async (count: number, showNotification: boolean) => {
    if (!selectedZikr || countSaving) return;

    setCountSaving(true);
    try {
      await sessionService.add({
        zikrId: selectedZikr.id!,
        count,
        source: 'app',
        timestamp: new Date(),
        date: new Date()
      });

      // Clear current session
      setCurrentSession({ zikrId: selectedZikr.id!, count: 0 });
      uiStore.setCounterState(0);

      if (showNotification) {
        // Could add toast notification here
        console.log(`Session saved: ${count} dhikr`);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setCountSaving(false);
    }
  };

  const handleLongPressStart = () => {
    const timer = window.setTimeout(() => {
      if (currentSession.count > 0) {
        setShowResetModal(true);
      }
    }, 1000);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleReset = () => {
    setCurrentSession({
      zikrId: selectedZikr?.id || null,
      count: 0
    });
    uiStore.clearCounterState();
    setShowResetModal(false);
  };

  const handleZikrSelect = (zikr: Zikr) => {
    setSelectedZikr(zikr);
    setShowZikrSelector(false);
    setCurrentSession({
      zikrId: zikr.id!,
      count: currentSession.count
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Zikr Selector Modal */}
      {showZikrSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowZikrSelector(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Select a Zikr</h2>
            <ZikrList
              onZikrSelect={handleZikrSelect}
              selectedZikr={selectedZikr}
              showActions={false}
            />
            <button
              onClick={() => setShowZikrSelector(false)}
              className="w-full mt-4 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Reset Counter?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your current count ({currentSession.count}) will be lost. Continue?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium min-h-[44px]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Section: Zikr Selector (20%) */}
      <div className="h-[20%] flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700">
        {selectedZikr ? (
          <div className="text-center">
            <button
              onClick={() => setShowZikrSelector(true)}
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              {selectedZikr.name}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tap to change zikr
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowZikrSelector(true)}
            className="text-xl text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Select a zikr to begin
          </button>
        )}
      </div>

      {/* Middle Section: Count Display (50%) */}
      <div className="h-[50%] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[120px] font-bold text-blue-600 dark:text-blue-400 leading-none">
            {currentSession.count}
          </div>
          {selectedZikr && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {selectedZikr.name}
            </p>
          )}
          {countSaving && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Saving...
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: Tap Area (30%) */}
      <div
        className="h-[30%] flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 cursor-pointer active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors"
        onClick={handleTap}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        role="button"
        aria-label="Increment count"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTap();
          }
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-2">👆</div>
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Tap to count
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Long press to reset
          </p>
        </div>
      </div>
    </div>
  );
}