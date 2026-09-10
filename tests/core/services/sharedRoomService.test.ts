import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../../src/core/db/db';
import { createSharedRoomService } from '../../../src/core/services/sharedRoom/service';
import { SharedRoomBackend, SharedRoomError, RoomStatePayload } from '../../../src/core/services/sharedRoom/contract';
import { SharedRoom } from '../../../src/core/db/types';

// ---------- test doubles ----------

const ROOM_CODE = 'ABC234';

function makeRoomState(overrides: Partial<RoomStatePayload['room']> = {}): RoomStatePayload {
  const now = Date.now();
  return {
    room: {
      id: 'room-uuid-1',
      code: ROOM_CODE,
      title: 'Family Khatma',
      zikrName: 'SubhanAllah',
      zikrArabic: 'سُبْحَانَ ٱللَّٰهِ',
      target: 1000,
      total: 100,
      startsAt: new Date(now - 86400_000).toISOString(),
      endsAt: new Date(now + 6 * 86400_000).toISOString(),
      ownerId: 'owner-uid',
      status: 'active',
      ...overrides,
    },
    members: [
      { name: 'Me', joinedAt: new Date().toISOString(), userId: 'uid-1' },
      { name: 'Umm Ayesha', joinedAt: new Date().toISOString(), userId: 'uid-2' },
    ],
    isMember: true,
  };
}

/** Mock backend with programmable contribute behavior + a full call log. */
function makeMockBackend(state: { total: number }) {
  const callLog: Array<{ eventId: string; delta: number }> = [];
  const appliedEvents: Array<{ eventId: string; delta: number }> = [];
  let contributeBehavior: (eventId: string, delta: number) => Promise<{ total: number }> = async (
    eventId,
    delta
  ) => {
    if (appliedEvents.some((e) => e.eventId === eventId)) {
      return { total: state.total }; // idempotent replay
    }
    appliedEvents.push({ eventId, delta });
    state.total += delta;
    return { total: state.total };
  };

  const backend: SharedRoomBackend = {
    name: 'test-double',
    isConfigured: () => true,
    ensureUserId: async () => 'uid-1',
    createRoom: async () => makeRoomState(),
    joinRoom: async () => makeRoomState(),
    getRoomState: async () => makeRoomState({ total: state.total }),
    contribute: async (_code, delta, eventId) => {
      callLog.push({ eventId, delta });
      return contributeBehavior(eventId, delta);
    },
    removeMember: async () => {},
    leaveRoom: async () => {},
    closeRoom: async () => {},
  };

  return {
    backend,
    callLog,
    appliedEvents,
    setBehavior(fn: (eventId: string, delta: number) => Promise<{ total: number }>) {
      contributeBehavior = fn;
    },
  };
}

async function seedRoom(extra: Partial<SharedRoom> = {}) {
  const state = makeRoomState();
  const r = state.room;
  const room: SharedRoom = {
    code: r.code,
    id: r.id,
    title: r.title,
    zikrName: r.zikrName,
    zikrArabic: r.zikrArabic,
    target: r.target,
    total: r.total,
    startsAt: new Date(r.startsAt),
    endsAt: new Date(r.endsAt),
    ownerId: r.ownerId,
    status: r.status,
    joinedAt: new Date(),
    fetchedAt: new Date(),
  };
  await db.sharedRooms.put({ ...room, ...extra });
  return { ...room, ...extra };
}

beforeEach(async () => {
  await Promise.all([
    db.sharedRooms.clear(),
    db.sharedSubmissions.clear(),
    db.syncOutbox.clear(),
    db.identity.clear(),
  ]);
});

// ---------- tests ----------

describe('sharedRoomService — local-first contribution flow', () => {
  it('records the submission locally and delivers it via flush', async () => {
    const mock = makeMockBackend({ total: 100 });
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    const submission = await service.submitContribution(ROOM_CODE, 33, { autoFlush: false });

    // Local record exists immediately (device-only history).
    const local = await service.getMySubmissions(ROOM_CODE);
    expect(local).toHaveLength(1);
    expect(local[0].delta).toBe(33);
    expect(local[0].syncState).toBe('pending');

    // Outbox holds the pending increment.
    expect(await db.syncOutbox.count()).toBe(1);
    expect(await db.syncOutbox.toArray()).toEqual([
      expect.objectContaining({ eventId: submission.eventId, delta: 33 }),
    ]);

    const result = await service.flushOutbox();
    expect(result.applied).toBe(1);

    // Submission marked synced; server total mirrored into the room cache.
    const after = await service.getMySubmissions(ROOM_CODE);
    expect(after[0].syncState).toBe('synced');
    expect(await db.syncOutbox.count()).toBe(0);
    const room = await service.getRoom(ROOM_CODE);
    expect(room?.total).toBe(133);
    // The increment used the exact client event id (idempotency key).
    expect(mock.appliedEvents).toEqual([{ eventId: submission.eventId, delta: 33 }]);
  });

  it('keeps the submission queued on network failure and delivers the SAME event id on retry', async () => {
    const mock = makeMockBackend({ total: 100 });
    let attempts = 0;
    mock.setBehavior(async () => {
      attempts++;
      if (attempts === 1) throw new SharedRoomError('network', 'offline');
      return { total: 145 };
    });
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    const submission = await service.submitContribution(ROOM_CODE, 45, { autoFlush: false });
    const first = await service.flushOutbox();
    expect(first.deferred).toBe(1);
    expect((await service.getMySubmissions(ROOM_CODE))[0].syncState).toBe('pending');
    expect(await db.syncOutbox.count()).toBe(1);

    // Force the backoff window open and flush again.
    const item = (await db.syncOutbox.toArray())[0];
    await db.syncOutbox.update(item.id!, { nextAttemptAt: new Date(Date.now() - 1) });
    const second = await service.flushOutbox();
    expect(second.applied).toBe(1);

    const after = await service.getMySubmissions(ROOM_CODE);
    expect(after[0].syncState).toBe('synced');
    // Same eventId both attempts → server-side idempotency prevents double count.
    expect(mock.callLog.filter((e) => e.eventId === submission.eventId)).toHaveLength(2);
    const room = await service.getRoom(ROOM_CODE);
    expect(room?.total).toBe(145);
  });

  it('marks submissions as failed on permanent server rejection (window ended)', async () => {
    const mock = makeMockBackend({ total: 100 });
    mock.setBehavior(async () => {
      throw new SharedRoomError('window-ended');
    });
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    await service.submitContribution(ROOM_CODE, 10, { autoFlush: false });
    const result = await service.flushOutbox();

    expect(result.failed).toBe(1);
    expect(await db.syncOutbox.count()).toBe(0);
    const after = await service.getMySubmissions(ROOM_CODE);
    expect(after[0].syncState).toBe('failed');
    expect(after[0].note).toBe('window-ended');
  });

  it('defers everything when the backend is not configured', async () => {
    const mock = makeMockBackend({ total: 100 });
    mock.backend.isConfigured = () => false;
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    await service.submitContribution(ROOM_CODE, 5, { autoFlush: false });
    const result = await service.flushOutbox();

    expect(result).toEqual({ applied: 0, failed: 0, deferred: 1 });
    expect(await db.syncOutbox.count()).toBe(1);
    expect(mock.appliedEvents).toHaveLength(0);
  });

  it('rejects invalid deltas without recording anything', async () => {
    const mock = makeMockBackend({ total: 100 });
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    await expect(service.submitContribution(ROOM_CODE, 0)).rejects.toMatchObject({
      code: 'invalid-delta',
    });
    await expect(service.submitContribution(ROOM_CODE, 20000)).rejects.toMatchObject({
      code: 'invalid-delta',
    });
    expect(await db.sharedSubmissions.count()).toBe(0);
    expect(await db.syncOutbox.count()).toBe(0);
  });
});

describe('sharedRoomService — rooms', () => {
  it('joins a room and mirrors its state locally', async () => {
    const mock = makeMockBackend({ total: 100 });
    const service = createSharedRoomService(mock.backend);
    const identity = { userId: 'uid-1', displayName: 'Tester', createdAt: new Date() };

    const room = await service.joinRoom(' abc234 ', identity); // normalization: spaces + case

    expect(room.code).toBe(ROOM_CODE);
    expect(room.title).toBe('Family Khatma');
    expect((await service.listRooms())).toHaveLength(1);
  });

  it('refreshes goal/total/members from the server', async () => {
    const mock = makeMockBackend({ total: 250 });
    const service = createSharedRoomService(mock.backend);
    await seedRoom();

    const { room, members, isMember } = await service.fetchRoomState(ROOM_CODE);

    expect(room.total).toBe(250);
    expect(members.map((m) => m.name)).toContain('Umm Ayesha');
    expect(isMember).toBe(true);
    expect((await service.getRoom(ROOM_CODE))?.total).toBe(250);
  });
});
