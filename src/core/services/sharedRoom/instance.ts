/**
 * The configured sharedRoomService singleton the app uses.
 * Separate module so syncService can depend on it without an import cycle.
 */

import { createSharedRoomBackend } from './backendFactory';
import { createSharedRoomService } from './service';

export const sharedRoomService = createSharedRoomService(createSharedRoomBackend());
export default sharedRoomService;
