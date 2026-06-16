import { create } from 'zustand';
import { SessionRow } from '../db/types';
import { sessionValidationService } from '../services/sessionValidationService';

export type FormMode = 'single' | 'bulk';
export type BulkMode = 'multi-zikr' | 'quick-repeat';

interface SessionFormState {
  // Form state
  mode: FormMode;
  bulkMode: BulkMode;
  rows: SessionRow[];
  editingSessionId: number | null;

  // Save state
  isSaving: boolean;
  saveProgress: number;
  errors: Record<string, string>;

  // Actions
  setMode: (mode: FormMode) => void;
  setBulkMode: (mode: BulkMode) => void;
  addRow: (row?: Partial<SessionRow>) => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, updates: Partial<SessionRow>) => void;
  setSaving: (saving: boolean) => void;
  setSaveProgress: (progress: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  loadSessionForEdit: (sessionId: number) => Promise<void>;
}

export const useSessionFormStore = create<SessionFormState>((set, get) => ({
  // Initial state
  mode: 'single',
  bulkMode: 'multi-zikr',
  rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }],
  editingSessionId: null,
  isSaving: false,
  saveProgress: 0,
  errors: {},

  // Actions
  setMode: (mode) => {
    set({ mode });
    // Reset to single row when switching to single mode
    if (mode === 'single') {
      set({ rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }] });
    }
  },

  setBulkMode: (bulkMode) => set({ bulkMode }),

  addRow: (row) => {
    const newRow: SessionRow = {
      zikrId: '',
      count: 0,
      timestamp: new Date(),
      valid: false,
      errors: {},
      ...row
    };
    // Ensure zikrId is always a string
    if (!newRow.zikrId) newRow.zikrId = '';
    set({ rows: [...get().rows, newRow] });
  },

  removeRow: (index) => {
    const rows = [...get().rows];
    rows.splice(index, 1);
    set({ rows });
  },

  updateRow: (index, updates) => {
    const rows = [...get().rows];
    rows[index] = { ...rows[index], ...updates };

    // Validate updated row
    const errors = sessionValidationService.validateRow(rows[index]);
    rows[index].valid = !errors;
    rows[index].errors = errors || {};

    set({ rows });
  },

  setSaving: (isSaving) => set({ isSaving }),

  setSaveProgress: (saveProgress) => set({ saveProgress }),

  setErrors: (errors) => set({ errors }),

  reset: () => {
    set({
      mode: 'single',
      bulkMode: 'multi-zikr',
      rows: [{ zikrId: '', count: 0, timestamp: new Date(), valid: false, errors: {} }],
      editingSessionId: null,
      isSaving: false,
      saveProgress: 0,
      errors: {}
    });
  },

  loadSessionForEdit: async (sessionId) => {
    const sessionService = await import('../services/sessionService');
    const session = await sessionService.getSessionById(sessionId);

    if (session) {
      set({
        mode: 'single',
        rows: [{
          zikrId: String(session.zikrId),
          count: session.count,
          timestamp: session.timestamp,
          valid: true,
          errors: {}
        }],
        editingSessionId: sessionId
      });
    }
  }
}));

// Auto-save to localStorage every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useSessionFormStore.getState();
    if (state.mode === 'bulk' && state.rows.length > 1) {
      localStorage.setItem('sessionFormState', JSON.stringify({
        mode: state.mode,
        bulkMode: state.bulkMode,
        rows: state.rows
      }));
    }
  }, 30000);
}