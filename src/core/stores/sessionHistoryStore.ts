import { create } from 'zustand';
import { db } from '../db/db';
import { Session } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface SessionGroup {
  title: string;
  sessions: Session[];
  count: number;
  expanded: boolean;
}

interface SessionHistoryState {
  sessions: Session[];
  groupedByDate: Record<string, SessionGroup>;
  loading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<() => void>;
  groupByDate: () => void;
  refresh: () => Promise<void>;
  toggleGroup: (groupKey: string) => void;
}

export const useSessionHistoryStore = create<SessionHistoryState>((set, get) => ({
  sessions: [],
  groupedByDate: {},
  loading: true,
  error: null,

  loadSessions: async () => {
    const unsubscribe = createRetryableSubscription(
      () => db.sessions
        .orderBy('timestamp')
        .reverse()
        .toArray(),
      (sessions) => {
        set({ sessions, loading: false, error: null });
        get().groupByDate();
      },
      (_error) => set({
        error: 'Failed to load sessions. Please check browser storage permissions.',
        loading: false
      })
    );

    return unsubscribe;
  },

  groupByDate: () => {
    const sessions = get().sessions;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: Record<string, SessionGroup> = {
      today: { title: 'Today', sessions: [], count: 0, expanded: true },  // Default expanded (review feedback)
      yesterday: { title: 'Yesterday', sessions: [], count: 0, expanded: false },
      thisWeek: { title: 'This Week', sessions: [], count: 0, expanded: false },
      older: { title: 'Older', sessions: [], count: 0, expanded: false }
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);

      if (sessionDate >= today) {
        groups.today.sessions.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.sessions.push(session);
      } else if (sessionDate >= thisWeek) {
        groups.thisWeek.sessions.push(session);
      } else {
        groups.older.sessions.push(session);
      }
    });

    // Update counts
    Object.keys(groups).forEach(key => {
      groups[key].count = groups[key].sessions.length;
    });

    set({ groupedByDate: groups });
  },

  refresh: async () => {
    await get().loadSessions();
  },

  toggleGroup: (groupKey: string) => {
    const groups = { ...get().groupedByDate };
    if (groups[groupKey]) {
      groups[groupKey].expanded = !groups[groupKey].expanded;
      set({ groupedByDate: groups });
    }
  }
}));