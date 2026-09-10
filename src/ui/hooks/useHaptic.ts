/**
 * useHaptic Hook
 * Provides haptic feedback patterns for mobile interactions
 */

import { useCallback, useState } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

interface HapticPatterns {
  light: number | number[];
  medium: number | number[];
  heavy: number | number[];
  success: number[];
  warning: number[];
}

const DEFAULT_PATTERNS: HapticPatterns = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [30, 30, 30],
  warning: [50, 50],
};

export const useHaptic = (enabled: boolean = true) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Check if vibration is supported
  const isSupported = useCallback(() => {
    return 'vibrate' in navigator;
  }, []);

  const trigger = useCallback((type: HapticType) => {
    if (!isEnabled || !isSupported()) return;

    const pattern = DEFAULT_PATTERNS[type];
    navigator.vibrate(pattern);
  }, [isEnabled, isSupported]);

  // Test haptic feedback
  const test = useCallback(() => {
    trigger('medium');
  }, [trigger]);

  return {
    trigger,
    test,
    isEnabled,
    setIsEnabled,
    isSupported: isSupported(),
  };
};

export default useHaptic;
