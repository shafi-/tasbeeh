import { create } from 'zustand';
import { db } from '../db/db';
import { Zikr } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface ZikrState {
  zikrs: Zikr[];
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
}

export const useZikrStore = create<ZikrState>((set) => ({
  zikrs: [],
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = createRetryableSubscription(
      // Soft-deleted zikrs (deletedAt set in Settings) stay in the DB for
      // their sessions' history but must not appear anywhere in the UI.
      () => db.zikrs.filter(zikr => !zikr.deletedAt).toArray(),
      (zikrs) => set({ zikrs, loading: false, error: null }),
      (_error) => set({
        error: 'Failed to load zikrs. Please check browser storage permissions.',
        loading: false
      })
    );

    return unsubscribe;
  }
}));
