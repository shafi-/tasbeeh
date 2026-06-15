import { create } from 'zustand';
import { db } from '../db/db';
import { Goal } from '../db/types';
import { createRetryableSubscription } from '../services/errorRecovery';

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  initialize: () => () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: true,
  error: null,

  initialize: () => {
    const unsubscribe = createRetryableSubscription(
      () => db.goals.toArray(),
      (goals) => set({ goals, loading: false, error: null }),
      (_error) => set({
        error: 'Failed to load goals. Please check browser storage permissions.',
        loading: false
      })
    );

    return unsubscribe;
  }
}));
