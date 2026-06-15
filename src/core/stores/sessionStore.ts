import { create } from 'zustand';
import { db } from '../db/db';
import { Session } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface CurrentSession {
  zikrId: number | null;
  count: number;
}

interface SessionState {
  sessions: Session[];
  currentSession: CurrentSession;
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
  setCurrentSession: (session: CurrentSession) => void;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSession: { zikrId: null, count: 0 },
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
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  clearCurrentSession: () => set({ currentSession: { zikrId: null, count: 0 } })
}));
