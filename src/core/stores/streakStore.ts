import { create } from 'zustand';
import { db } from '../db/db';
import { Streak } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface StreakState {
  streaks: Streak[];
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streaks: [],
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = createRetryableSubscription(
      () => db.streaks.toArray(),
      (streaks) => set({ streaks, loading: false, error: null }),
      (_error) => set({
        error: 'Failed to load streaks. Please check browser storage permissions.',
        loading: false
      })
    );

    return unsubscribe;
  }
}));