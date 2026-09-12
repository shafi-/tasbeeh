/**
 * Shared Room Service — local-first orchestration for shared goals.
 *
 * Depends ONLY on the SharedRoomBackend contract, never on a concrete
 * backend — pass any implementation (Supabase adapter, MockSharedRoomBackend,
 * or your own) to createSharedRoomService.
 *
 * Every write lands in local IndexedDB FIRST (private submission history +
 * outbox), then syncs via the outbox. The backend only ever receives atomic,
 * idempotent increments — it never sees the member's contribution history.
 * See docs/SharedGoals-Design.md
 */

import { db } from '../../db/db';
import {
  SharedIdentity,
  SharedMember,
  SharedRoom,
  SharedSubmission,
  SyncOutboxItem,
} from '../../db/types';
import { backoffDelayMs, isValidDelta, normalizeRoomCode } from '../../utils/sharedRoomUtils';
import {
  CreateRoomInput,
  RoomStatePayload,
  SharedRoomBackend,
  SharedRoomError,
} from './contract';

// ---------- helpers ----------

function makeEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'evt-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface FlushResult {
  applied: number;
  failed: number;
  deferred: number;
}

// ---------- service ----------

export function createSharedRoomService(backend: SharedRoomBackend) {
  let flushPromise: Promise<FlushResult> | null = null;
  let appOpenTracked = false;

  async function saveRoomState(
    payload: RoomStatePayload,
    joinedAt?: Date,
    joinedWithUserId?: string
  ): Promise<SharedRoom> {
    const existing = await db.sharedRooms.get(payload.room.code);
    const r = payload.room;
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
      joinedAt: joinedAt ?? existing?.joinedAt ?? new Date(),
      joinedWithUserId: joinedWithUserId ?? existing?.joinedWithUserId,
      fetchedAt: new Date(),
    };
    await db.sharedRooms.put(room);
    return room;
  }

  return {
    readonlyBackendName: backend.name,

    /** Whether the backend has everything it needs to operate. */
    isConfigured(): boolean {
      return backend.isConfigured();
    },

    /**
     * Get or create the local identity, aligned with the backend's
     * no-login user, including the server-generated 12-char device token
     * used as the usage-metrics key. `displayName` updates the stored name
     * when provided.
     */
    async ensureIdentity(displayName?: string): Promise<SharedIdentity> {
      const userId = await backend.ensureUserId();
      const existing = (await db.identity.toArray())[0] || null;

      let token = existing?.token;
      if (!token) {
        token = await backend.ensureDeviceToken();
      }

      if (existing && existing.userId === userId) {
        if ((displayName && displayName !== existing.displayName) || token !== existing.token) {
          const updated: SharedIdentity = { ...existing, displayName: displayName ?? existing.displayName, token };
          await db.identity.put(updated);
          return updated;
        }
        return existing;
      }

      const identity: SharedIdentity = {
        userId,
        displayName: displayName || existing?.displayName || 'Guest',
        token,
        createdAt: existing?.createdAt || new Date(),
      };
      await db.identity.put(identity);
      return identity;
    },

    /**
     * Best-effort usage event. Never throws, never blocks — metrics are
     * allowed to fail (offline, unconfigured, backend hiccup).
     * Privacy: usage shape only; never contribution amounts.
     */
    async track(name: string, properties?: Record<string, unknown>): Promise<void> {
      try {
        if (!backend.isConfigured()) return;
        let identity = (await db.identity.toArray())[0];
        if (!identity?.token) {
          identity = await this.ensureIdentity();
        }
        await backend.trackEvent(name, properties);
      } catch {
        // intentionally ignored — see contract docs
      }
    },

    /** Fire once per app session. */
    async trackAppOpen(): Promise<void> {
      if (appOpenTracked) return;
      appOpenTracked = true;
      await this.track('app_opened');
    },

    /** Create a room; creator becomes the first member. */
    async createRoom(
      input: Omit<CreateRoomInput, 'displayName'> & { windowType?: string },
      identity: SharedIdentity
    ): Promise<SharedRoom> {
      const payload = await backend.createRoom({ ...input, displayName: identity.displayName });
      const room = await saveRoomState(payload, new Date(), identity.userId);
      await this.track('room_created', { window: input.windowType || 'custom' });
      return room;
    },

    /** Join (or rejoin) a room by code with a display name. */
    async joinRoom(code: string, identity: SharedIdentity): Promise<SharedRoom> {
      const normalized = normalizeRoomCode(code);
      if (!normalized) throw new SharedRoomError('invalid-input', 'Invalid room code');
      const payload = await backend.joinRoom(normalized, identity.displayName);
      const room = await saveRoomState(payload, new Date(), identity.userId);
      await this.track('room_joined');
      return room;
    },

    async leaveRoom(code: string): Promise<void> {
      await backend.leaveRoom(code);
      await db.sharedRooms.delete(normalizeRoomCode(code) || code);
      await this.track('room_left');
    },

    async closeRoom(code: string): Promise<void> {
      await backend.closeRoom(code);
      await db.sharedRooms.update(code, { status: 'closed', fetchedAt: new Date() });
      await this.track('room_closed');
    },

    async removeMember(code: string, userId: string): Promise<void> {
      await backend.removeMember(code, userId);
      await this.track('member_removed');
    },

    /** Fetch fresh goal/total from the server into the local mirror. */
    async refreshRoom(code: string): Promise<SharedRoom | null> {
      const payload = await backend.getRoomState(code);
      return saveRoomState(payload);
    },

    /** Full room state from the backend: mirror + members + my membership. */
    async fetchRoomState(code: string): Promise<{
      room: SharedRoom;
      members: SharedMember[];
      isMember: boolean;
    }> {
      const identity = await this.ensureIdentity();
      let payload: RoomStatePayload;
      try {
        payload = await backend.getRoomState(code);
      } catch (err) {
        // Room gone server-side (purged/deleted) — drop the stale local mirror
        // so it disappears from the list instead of erroring forever.
        if (err instanceof SharedRoomError && err.code === 'room-not-found') {
          await db.sharedRooms.delete(code);
        }
        throw err;
      }

      // Silent rejoin: this room is in the device's list (joined before), so
      // this device is a member — whatever the backend's current books say.
      // Rejoin with the saved name instead of nagging the user to join again.
      if (!payload.isMember && payload.room.status === 'active') {
        const cached = await db.sharedRooms.get(payload.room.code);
        const windowOpen = new Date(payload.room.endsAt) > new Date();
        if (cached && windowOpen) {
          payload = await backend.joinRoom(payload.room.code, identity.displayName);
        }
      }

      const room = await saveRoomState(payload, undefined, identity.userId);
      const members: SharedMember[] = payload.members.map((m) => ({
        name: m.name,
        joinedAt: new Date(m.joinedAt),
        userId: m.userId,
      }));
      return { room, members, isMember: payload.isMember };
    },

    async getRoom(code: string): Promise<SharedRoom | undefined> {
      return db.sharedRooms.get(code);
    },

    async listRooms(): Promise<SharedRoom[]> {
      return db.sharedRooms.toArray();
    },

    /** My private contribution history for a room (local only, never synced). */
    async getMySubmissions(code: string): Promise<SharedSubmission[]> {
      const rows = await db.sharedSubmissions.where('roomCode').equals(code).toArray();
      return rows.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    },

    /**
     * Submit a contribution: recorded locally immediately, queued for the
     * server, and flushed in the background. Never throws for network
     * reasons — the outbox owns delivery.
     */
    async submitContribution(
      code: string,
      delta: number,
      options: { autoFlush?: boolean } = {}
    ): Promise<SharedSubmission> {
      if (!isValidDelta(delta)) throw new SharedRoomError('invalid-delta');

      const eventId = makeEventId();
      const submission: SharedSubmission = {
        roomCode: code,
        delta,
        submittedAt: new Date(),
        eventId,
        syncState: 'pending',
      };
      const item: SyncOutboxItem = {
        eventId,
        roomCode: code,
        delta,
        attempts: 0,
        nextAttemptAt: new Date(),
        createdAt: new Date(),
      };

      await db.transaction('rw', db.sharedSubmissions, db.syncOutbox, async () => {
        await db.sharedSubmissions.add(submission);
        await db.syncOutbox.add(item);
      });

      // Usage event — deliberately WITHOUT the amount (privacy model).
      await this.track('contribution_submitted');

      if (options.autoFlush !== false) {
        // Fire-and-forget: the UI observes results via the store/poll.
        void this.flushOutbox();
      }

      return submission;
    },

    /**
     * Best-effort: add this count to every joined ACTIVE room that counts
     * the same zikr. Individual room failures (not a member, room closed)
     * are skipped — used by the counter's "count towards goals & groups".
     */
    async propagateToRooms(zikrName: string, delta: number): Promise<number> {
      let applied = 0;
      const rooms = await this.listRooms();
      for (const room of rooms) {
        if (room.status !== 'active' || room.zikrName !== zikrName) continue;
        if (new Date(room.endsAt) <= new Date()) continue;
        try {
          await this.submitContribution(room.code, delta);
          applied++;
        } catch {
          // one room failing must not block the others
        }
      }
      return applied;
    },

    /**
     * Flush the outbox: apply due increments atomically and idempotently.
     * Single-flight — concurrent calls share one run.
     */
    flushOutbox(): Promise<FlushResult> {
      if (flushPromise) return flushPromise;
      flushPromise = (async () => {
        const result: FlushResult = { applied: 0, failed: 0, deferred: 0 };
        if (!backend.isConfigured()) {
          result.deferred = await db.syncOutbox.count();
          return result;
        }

        const now = new Date();
        const due = await db.syncOutbox.where('nextAttemptAt').belowOrEqual(now).sortBy('createdAt');

        for (const item of due) {
          try {
            const { total } = await backend.contribute(item.roomCode, item.delta, item.eventId);
            await db.transaction('rw', db.sharedSubmissions, db.syncOutbox, db.sharedRooms, async () => {
              await db.sharedSubmissions.where('eventId').equals(item.eventId).modify({
                syncState: 'synced',
                note: undefined,
              });
              await db.syncOutbox.delete(item.id!);
              const room = await db.sharedRooms.get(item.roomCode);
              if (room) {
                await db.sharedRooms.update(item.roomCode, { total, fetchedAt: new Date() });
              }
            });
            result.applied++;
          } catch (err) {
            const sre = err instanceof SharedRoomError ? err : new SharedRoomError('unknown');
            const attempts = item.attempts + 1;

            // Permanent server rejections never succeed on retry.
            if (sre.permanent || attempts >= 20) {
              await db.transaction('rw', db.sharedSubmissions, db.syncOutbox, async () => {
                await db.sharedSubmissions.where('eventId').equals(item.eventId).modify({
                  syncState: 'failed',
                  note: sre.code,
                });
                await db.syncOutbox.delete(item.id!);
              });
              result.failed++;
            } else {
              await db.syncOutbox.update(item.id!, {
                attempts,
                nextAttemptAt: new Date(Date.now() + backoffDelayMs(attempts)),
              });
              result.deferred++;
            }
          }
        }
        return result;
      })().finally(() => {
        flushPromise = null;
      });
      return flushPromise;
    },
  };
}

export type SharedRoomService = ReturnType<typeof createSharedRoomService>;
