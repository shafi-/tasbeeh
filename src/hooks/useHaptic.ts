import { useCallback } from 'react';

export function useHaptic() {
  const triggerHaptic = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(10); // 10ms pulse
      }
    } catch (error) {
      // Silent fail on unsupported devices
    }
  }, []);

  return { triggerHaptic };
}