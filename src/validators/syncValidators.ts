import { z } from 'zod';

/**
 * Validates the Pull Sync request.
 * 'since' is an ISO timestamp of the last successful sync.
 */
export const syncQuerySchema = z.object({
  since: z.string().datetime({ offset: true }).optional(),
});

export type SyncQuery = z.infer<typeof syncQuerySchema>;
