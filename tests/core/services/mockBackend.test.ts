import { describe, it, expect, beforeEach } from 'vitest';
import { MockSharedRoomBackend } from '../../../src/core/services/sharedRoom/mockBackend';
import { SharedRoomError } from '../../../src/core/services/sharedRoom/contract';

/**
 * The MockSharedRoomBackend is the swappable "dumb testing class" for the
 * shared-goals feature: same contract, same rules, zero infrastructure.
 * These tests pin the rules it must keep honoring.
 */

describe('MockSharedRoomBackend', () => {
  let backend: MockSharedRoomBackend;
  let roomCode: string;

  beforeEach(async () => {
    backend = new MockSharedRoomBackend();
    backend.reset(); // clear localStorage-persisted state from prior tests
    await backend.ensureUserId(); // the device identity (service does this in the real flow)
    const payload = await backend.createRoom({
      title: 'Family Khatma',
      zikrName: 'SubhanAllah',
      target: 1000,
      startsAt: new Date(Date.now() - 1000),
      endsAt: new Date(Date.now() + 86400_000),
      displayName: 'Owner',
    });
    roomCode = payload.room.code;
  });

  it('creates a room with a 6-char code and the creator as first member', async () => {
    expect(roomCode).toMatch(/^[A-HJ-KMNP-Z2-9]{6}$/);
    const state = await backend.getRoomState(roomCode);
    expect(state.room.total).toBe(0);
    expect(state.members).toHaveLength(1);
    expect(state.isMember).toBe(true);
  });

  it('lets a second device join and contribute to the shared total', async () => {
    backend.actAs('device-2');
    await backend.joinRoom(roomCode, 'Umm Ayesha');

    const { total } = await backend.contribute(roomCode, 33, 'event-1');
    expect(total).toBe(33);

    const state = await backend.getRoomState(roomCode);
    expect(state.room.total).toBe(33);
    expect(state.members.map((m) => m.name)).toContain('Umm Ayesha');
  });

  it('never applies the same event id twice', async () => {
    const first = await backend.contribute(roomCode, 40, 'event-1');
    const replay = await backend.contribute(roomCode, 40, 'event-1');
    expect(first.total).toBe(40);
    expect(replay.total).toBe(40); // unchanged
  });

  it('rejects non-members and honors owner checks', async () => {
    backend.actAs('stranger-device');
    await expect(backend.contribute(roomCode, 10, 'e1')).rejects.toMatchObject({
      code: 'not-a-member',
    });
    await expect(backend.closeRoom(roomCode)).rejects.toMatchObject({ code: 'not-owner' });

    backend.actAs('mock-user-1'); // the creator
    await backend.closeRoom(roomCode);
    const state = await backend.getRoomState(roomCode);
    expect(state.room.status).toBe('closed');
  });

  it('rejects contributions outside the time window', async () => {
    const payload = await backend.createRoom({
      title: 'Not started yet',
      zikrName: 'Salawat',
      target: 100,
      startsAt: new Date(Date.now() + 86400_000),
      endsAt: new Date(Date.now() + 2 * 86400_000),
      displayName: 'Owner',
    });
    await expect(backend.contribute(payload.room.code, 10, 'e1')).rejects.toMatchObject({
      code: 'window-not-started',
    });
  });

  it('round-trips through create → contribute → state with total persisted', async () => {
    await backend.contribute(roomCode, 10, 'e-a');
    await backend.contribute(roomCode, 23, 'e-b');
    const state = await backend.getRoomState(roomCode);
    expect(state.room.total).toBe(33);
  });

  it('produces SharedRoomError instances (not raw errors)', async () => {
    await expect(backend.getRoomState('ZZZ999')).rejects.toBeInstanceOf(SharedRoomError);
  });

  it('issues a stable 12-char device token and records usage events', async () => {
    const token = await backend.ensureDeviceToken();
    expect(token).toHaveLength(12);
    expect(await backend.ensureDeviceToken()).toBe(token); // stable

    await backend.trackEvent('app_opened');
    await backend.trackEvent('room_created', { window: 'week' });

    const events = backend.getTrackedEvents();
    expect(events.map((e) => e.name)).toEqual(['app_opened', 'room_created']);
    expect(events[1].properties).toEqual({ window: 'week' });
  });

  it('persists rooms and totals across instances (reload survival)', async () => {
    await backend.contribute(roomCode, 10, 'persist-e1');
    const firstToken = await backend.ensureDeviceToken(); // issued + persisted

    // A brand-new instance (simulating an app reload) sees the same state.
    const second = new MockSharedRoomBackend();
    await second.ensureUserId(); // service re-establishes identity on boot
    const state = await second.getRoomState(roomCode);
    expect(state.room.total).toBe(10);
    expect(state.isMember).toBe(true);
    expect(await second.ensureDeviceToken()).toBe(firstToken);
  });
});
