import * as syncRepo from '../repositories/syncRepository.js';
import { PushSyncInput } from '../validators/syncValidators.js';

/**
 * Calculates the delta (changes) since the last sync.
 */
export const getFullDelta = async (userId: string, sinceStr?: string) => {
  // If no 'since' is provided, we sync from the beginning of time
  const since = sinceStr ? new Date(sinceStr) : new Date(0);
  const now = new Date();

  const [habits, entries] = await Promise.all([
    syncRepo.getHabitDelta(userId, since),
    syncRepo.getEntryDelta(userId, since)
  ]);

  return {
    changes: {
      habits: {
        // Active habits that were created or modified
        updated: habits.filter(h => !h.deletedAt),
        // IDs of habits that the client should remove from its local DB
        deletedIds: habits.filter(h => h.deletedAt).map(h => h.id)
      },
      entries: {
        updated: entries.filter(e => !e.deletedAt),
        deletedIds: entries.filter(e => e.deletedAt).map(e => e.id)
      }
    },
    lastSync: now.toISOString()
  };
};

/**
 * Processes incoming changes from the client and applies them to the database.
 */
export const processPushSync = async (userId: string, data: PushSyncInput) => {
  return await syncRepo.applyPushDelta(userId, data);
};
