/**
 * Shared Room backend factory.
 *
 * Chooses the active SharedRoomBackend implementation:
 *   - VITE_SHARED_ROOMS_BACKEND=mock  → MockSharedRoomBackend (no network)
 *   - otherwise                        → SupabaseSharedRoomBackend
 *
 * This is the single seam of the app where the concrete backend is named.
 */

import type { SharedRoomBackend } from './contract';
import { SupabaseSharedRoomBackend } from './supabaseBackend';
import { MockSharedRoomBackend } from './mockBackend';

export function createSharedRoomBackend(): SharedRoomBackend {
  const mode = import.meta.env.VITE_SHARED_ROOMS_BACKEND;
  if (mode === 'mock') {
    return new MockSharedRoomBackend();
  }
  return new SupabaseSharedRoomBackend();
}
