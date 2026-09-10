/**
 * Shared Room Store (Zustand)
 * State for the Group tab: identity, joined rooms, the currently open room,
 * my local contribution history, and sync status.
 */

import { create } from 'zustand';
import {
  SharedIdentity,
  SharedMember,
  SharedRoom,
  SharedSubmission,
} from '../db/types';
import { isValidDelta, normalizeRoomCode } from '../utils/sharedRoomUtils';
import sharedRoomService, {
  ensureSharedRoomSync,
  setActiveRoom,
  SharedRoomError,
} from '../services/sharedRoom';

interface SharedRoomState {
  initialized: boolean;
  configured: boolean;
  identity: SharedIdentity | null;
  rooms: SharedRoom[];
  currentRoom: SharedRoom | null;
  currentMembers: SharedMember[];
  isMember: boolean;
  mySubmissions: SharedSubmission[];
  syncing: boolean;
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  openRoom: (code: string) => Promise<void>;
  closeCurrentRoom: () => void;
  refreshCurrentRoom: () => Promise<void>;
  submit: (delta: number) => Promise<void>;
  createRoom: (input: {
    title: string;
    zikrName: string;
    zikrArabic?: string;
    target: number;
    startsAt: Date;
    endsAt: Date;
    windowType?: string;
  }) => Promise<SharedRoom>;
  joinRoom: (code: string) => Promise<SharedRoom>;
  leaveRoom: (code: string) => Promise<void>;
  closeRoom: (code: string) => Promise<void>;
  removeMember: (code: string, userId: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  track: (name: string, properties?: Record<string, unknown>) => Promise<void>;
  flush: () => Promise<void>;
  clearError: () => void;
}

function errorToMessage(err: unknown): string {
  if (err instanceof SharedRoomError) {
    switch (err.code) {
      case 'room-not-found': return 'Room not found. Check the code.';
      case 'room-closed': return 'This room has been closed.';
      case 'room-full': return 'This room is full.';
      case 'window-ended': return 'The time window for this goal has ended.';
      case 'window-not-started': return 'This goal has not started yet.';
      case 'not-a-member': return 'Join the room before contributing.';
      case 'not-owner': return 'Only the room creator can do that.';
      case 'invalid-delta': return 'Enter a count between 1 and 10,000.';
      case 'invalid-input': return 'Please check your input.';
      case 'not-configured': return 'Shared goals are not configured on this device.';
      case 'network': return 'You appear to be offline. Your counts are saved and will sync.';
      case 'not-authenticated': return 'Could not verify this device. Try again.';
      default: return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}

/** Shared with UI components so modals can render the same messages. */
export function sharedRoomErrorMessage(err: unknown): string {
  return errorToMessage(err);
}

export const useSharedRoomStore = create<SharedRoomState>((set, get) => ({
  initialized: false,
  configured: true,
  identity: null,
  rooms: [],
  currentRoom: null,
  currentMembers: [],
  isMember: false,
  mySubmissions: [],
  syncing: false,
  loading: false,
  error: null,

  async init() {
    const configured = sharedRoomService.isConfigured();
    set({ configured });
    if (!configured) {
      set({ initialized: true, rooms: [] });
      return;
    }

    ensureSharedRoomSync();

    try {
      const identity = await sharedRoomService.ensureIdentity(get().identity?.displayName);
      const rooms = await sharedRoomService.listRooms();
      set({ initialized: true, identity, rooms });
      // Deliver anything queued from previous sessions.
      await get().flush();
    } catch (err) {
      set({ initialized: true, error: errorToMessage(err) });
    }
  },

  async refresh() {
    const rooms = await sharedRoomService.listRooms();
    set({ rooms });
  },

  async openRoom(code) {
    const normalized = normalizeRoomCode(code);
    if (!normalized) {
      set({ error: 'Invalid room code.' });
      return;
    }
    set({ loading: true, error: null });
    setActiveRoom(normalized);
    try {
      // Show the cache instantly (deep links may have nothing cached).
      const cached = await sharedRoomService.getRoom(normalized);
      if (cached) set({ currentRoom: cached });

      const { room, members, isMember } = await sharedRoomService.fetchRoomState(normalized);
      const rooms = get().rooms;
      set({
        currentRoom: room,
        currentMembers: members,
        isMember,
        rooms: rooms.some(r => r.code === room.code)
          ? rooms.map(r => (r.code === room.code ? room : r))
          : [...rooms, room],
        mySubmissions: await sharedRoomService.getMySubmissions(normalized),
      });
      void sharedRoomService.track('room_opened');
    } catch (err) {
      set({ error: errorToMessage(err) });
    } finally {
      set({ loading: false });
    }
  },

  closeCurrentRoom() {
    setActiveRoom(null);
    set({ currentRoom: null, currentMembers: [], isMember: false, mySubmissions: [] });
  },

  async refreshCurrentRoom() {
    const code = get().currentRoom?.code;
    if (!code) return;
    try {
      const { room, members, isMember } = await sharedRoomService.fetchRoomState(code);
      const rooms = get().rooms;
      set({
        currentRoom: room,
        currentMembers: members,
        isMember,
        rooms: rooms.some(r => r.code === room.code)
          ? rooms.map(r => (r.code === room.code ? room : r))
          : [...rooms, room],
        mySubmissions: await sharedRoomService.getMySubmissions(code),
      });
    } catch (err) {
      set({ error: errorToMessage(err) });
    }
  },

  async submit(delta) {
    const room = get().currentRoom;
    if (!room) return;
    if (!isValidDelta(delta)) {
      set({ error: 'Enter a count between 1 and 10,000.' });
      return;
    }
    set({ syncing: true, error: null });
    try {
      await sharedRoomService.submitContribution(room.code, delta);
      set({ mySubmissions: await sharedRoomService.getMySubmissions(room.code) });
      // Deliver immediately when online; the poll covers the offline case.
      await get().flush();
    } catch (err) {
      set({ error: errorToMessage(err) });
    } finally {
      set({ syncing: false });
    }
  },

  async flush() {
    set({ syncing: true });
    try {
      await sharedRoomService.flushOutbox();
      const code = get().currentRoom?.code;
      if (code) {
        const room = await sharedRoomService.getRoom(code);
        if (room) set({ currentRoom: room });
        set({ mySubmissions: await sharedRoomService.getMySubmissions(code) });
      }
      await get().refresh();
    } finally {
      set({ syncing: false });
    }
  },

  async createRoom(input) {
    const identity = get().identity;
    if (!identity) throw new Error('Not initialized');
    set({ loading: true, error: null });
    try {
      const room = await sharedRoomService.createRoom(input, identity);
      set({ rooms: [...get().rooms, room] });
      return room;
    } catch (err) {
      set({ error: errorToMessage(err) });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  async joinRoom(code) {
    const identity = get().identity;
    if (!identity) throw new Error('Not initialized');
    set({ loading: true, error: null });
    try {
      const room = await sharedRoomService.joinRoom(code, identity);
      const rooms = get().rooms;
      set({
        rooms: rooms.some(r => r.code === room.code)
          ? rooms.map(r => (r.code === room.code ? room : r))
          : [...rooms, room],
      });
      return room;
    } catch (err) {
      set({ error: errorToMessage(err) });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  async leaveRoom(code) {
    try {
      await sharedRoomService.leaveRoom(code);
      set({
        rooms: get().rooms.filter(r => r.code !== code),
        currentRoom: get().currentRoom?.code === code ? null : get().currentRoom,
      });
    } catch (err) {
      set({ error: errorToMessage(err) });
    }
  },

  async closeRoom(code) {
    try {
      await sharedRoomService.closeRoom(code);
      await get().refresh();
      if (get().currentRoom?.code === code) {
        await get().refreshCurrentRoom();
      }
    } catch (err) {
      set({ error: errorToMessage(err) });
    }
  },

  async removeMember(code, userId) {
    try {
      await sharedRoomService.removeMember(code, userId);
      await get().refreshCurrentRoom();
    } catch (err) {
      set({ error: errorToMessage(err) });
    }
  },

  async updateDisplayName(name) {
    try {
      const identity = await sharedRoomService.ensureIdentity(name);
      set({ identity });
    } catch (err) {
      set({ error: errorToMessage(err) });
    }
  },

  async track(name, properties) {
    // Best-effort by contract — never blocks or throws into the UI.
    await sharedRoomService.track(name, properties);
  },

  clearError() {
    set({ error: null });
  },
}));
