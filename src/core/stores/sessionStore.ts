import { create } from 'zustand';
import { db } from '../db/db';
import { Session } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface SessionState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = createRetryableSubscription(
      () => db.sessions.toArray(),
      (sessions) => set({ sessions, loading: false, error: null }),
      (_error) => set({
        error: 'Failed to load sessions. Please check browser storage permissions.',
        loading: false
      })
    );

    return unsubscribe;
  }
}));
