import { create } from 'zustand';

interface UIState {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  counterState: number;
  setCounterState: (count: number) => void;
  clearCounterState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: false,
  setDarkMode: (enabled) => set({ darkMode: enabled }),
  currentPage: '/',
  setCurrentPage: (page) => set({ currentPage: page }),
  counterState: 0,
  setCounterState: (count) => set({ counterState: count }),
  clearCounterState: () => set({ counterState: 0 })
}));
