/**
 * Dumb in-memory backend for Shared Rooms.
 *
 * Two uses:
 *  1. Unit tests — deterministic, no network, inspectable state.
 *  2. Running the UI with no Supabase at all: set
 *     VITE_SHARED_ROOMS_BACKEND=mock and the Group tab works end-to-end
 *     against this class (data lives in memory and resets on reload).
 *
 * It implements the same rules as the production adapter (window checks,
 * idempotent increments, membership, owner checks) so tests exercise the
 * real contract.
 */

import { SharedRoomError } from './contract';
import type {
  CreateRoomInput,
  RoomMemberPayload,
  RoomStatePayload,
  RoomSummary,
  SharedRoomBackend,
} from './contract';

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

interface MockMember {
  userId: string;
  name: string;
  joinedAt: string;
  removed: boolean;
}

interface MockRoom {
  room: RoomSummary;
  members: Map<string, MockMember>;
}

export class MockSharedRoomBackend implements SharedRoomBackend {
  readonly name = 'mock';

  private rooms = new Map<string, MockRoom>();
  private appliedEventIds = new Set<string>();
  private events: Array<{ name: string; properties: Record<string, unknown>; at: Date }> = [];
  private deviceToken: string | null = null;
  private currentUserId: string | null = null;
  private userCounter = 0;
  private roomCounter = 0;

  /** Simulate a different device/member (tests only). */
  actAs(userId: string): void {
    this.currentUserId = userId;
  }

  reset(): void {
    this.rooms.clear();
    this.appliedEventIds.clear();
    this.events = [];
    this.deviceToken = null;
    this.currentUserId = null;
    this.userCounter = 0;
    this.roomCounter = 0;
  }

  /** Test accessor: every tracked usage event, in order. */
  getTrackedEvents(): Array<{ name: string; properties: Record<string, unknown> }> {
    return this.events.map((e) => ({ name: e.name, properties: e.properties }));
  }

  isConfigured(): boolean {
    return true;
  }

  async ensureDeviceToken(): Promise<string> {
    if (!this.deviceToken) {
      this.deviceToken = Array.from(
        { length: 12 },
        () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
      ).join('');
    }
    return this.deviceToken;
  }

  async trackEvent(name: string, properties: Record<string, unknown> = {}): Promise<void> {
    this.events.push({ name, properties, at: new Date() });
  }

  async ensureUserId(): Promise<string> {
    if (!this.currentUserId) {
      this.currentUserId = `mock-user-${++this.userCounter}`;
    }
    return this.currentUserId;
  }

  private requireUser(): string {
    if (!this.currentUserId) throw new SharedRoomError('not-authenticated');
    return this.currentUserId;
  }

  private findRoom(code: string): MockRoom {
    const normalized = (code || '').toUpperCase().trim();
    const room = this.rooms.get(normalized);
    if (!room) throw new SharedRoomError('room-not-found');
    return room;
  }

  private toPayload(mock: MockRoom): RoomStatePayload {
    const members: RoomMemberPayload[] = [...mock.members.values()]
      .filter((m) => !m.removed)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
      .map((m) => ({ name: m.name, joinedAt: m.joinedAt, userId: m.userId }));

    const me = this.currentUserId;
    return {
      room: { ...mock.room },
      members,
      isMember: Boolean(me && mock.members.get(me) && !mock.members.get(me)!.removed),
    };
  }

  async createRoom(input: CreateRoomInput): Promise<RoomStatePayload> {
    const userId = this.requireUser();
    if (input.target < 1 || input.target > 100000000) throw new SharedRoomError('invalid-input');
    if (input.endsAt.getTime() <= input.startsAt.getTime())
      throw new SharedRoomError('invalid-input');
    if (Date.now() > input.endsAt.getTime()) throw new SharedRoomError('window-ended');

    let code = '';
    do {
      code = Array.from(
        { length: 6 },
        () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
      ).join('');
    } while (this.rooms.has(code));

    const mock: MockRoom = {
      room: {
        id: `mock-room-${++this.roomCounter}`,
        code,
        title: input.title,
        zikrName: input.zikrName,
        zikrArabic: input.zikrArabic || null,
        target: input.target,
        total: 0,
        startsAt: input.startsAt.toISOString(),
        endsAt: input.endsAt.toISOString(),
        ownerId: userId,
        status: 'active',
      },
      members: new Map(),
    };
    mock.members.set(userId, {
      userId,
      name: input.displayName,
      joinedAt: new Date().toISOString(),
      removed: false,
    });

    this.rooms.set(code, mock);
    return this.toPayload(mock);
  }

  async joinRoom(code: string, displayName: string): Promise<RoomStatePayload> {
    const userId = this.requireUser();
    const mock = this.findRoom(code);
    if (mock.room.status !== 'active') throw new SharedRoomError('room-closed');
    if (Date.now() > new Date(mock.room.endsAt).getTime())
      throw new SharedRoomError('window-ended');

    const existing = mock.members.get(userId);
    if (existing) {
      existing.name = displayName;
      existing.removed = false;
    } else {
      mock.members.set(userId, {
        userId,
        name: displayName,
        joinedAt: new Date().toISOString(),
        removed: false,
      });
    }
    return this.toPayload(mock);
  }

  async contribute(code: string, delta: number, eventId: string): Promise<{ total: number }> {
    const userId = this.requireUser();
    if (!Number.isInteger(delta) || delta < 1 || delta > 10000)
      throw new SharedRoomError('invalid-delta');

    const mock = this.findRoom(code);
    if (mock.room.status !== 'active') throw new SharedRoomError('room-closed');
    const now = Date.now();
    if (now < new Date(mock.room.startsAt).getTime())
      throw new SharedRoomError('window-not-started');
    if (now > new Date(mock.room.endsAt).getTime()) throw new SharedRoomError('window-ended');

    const member = mock.members.get(userId);
    if (!member || member.removed) throw new SharedRoomError('not-a-member');

    // Idempotent replay: same event id never applies twice.
    if (this.appliedEventIds.has(eventId)) {
      return { total: mock.room.total };
    }
    this.appliedEventIds.add(eventId);
    mock.room.total += delta;
    return { total: mock.room.total };
  }

  async getRoomState(code: string): Promise<RoomStatePayload> {
    return this.toPayload(this.findRoom(code));
  }

  async removeMember(code: string, userId: string): Promise<void> {
    const me = this.requireUser();
    const mock = this.findRoom(code);
    if (mock.room.ownerId !== me) throw new SharedRoomError('not-owner');
    const member = mock.members.get(userId);
    if (member) member.removed = true;
  }

  async leaveRoom(code: string): Promise<void> {
    const userId = this.requireUser();
    const mock = this.findRoom(code);
    const member = mock.members.get(userId);
    if (member) member.removed = true;
  }

  async closeRoom(code: string): Promise<void> {
    const me = this.requireUser();
    const mock = this.findRoom(code);
    if (mock.room.ownerId !== me) throw new SharedRoomError('not-owner');
    mock.room.status = 'closed';
  }
}
