import { z } from 'zod';

/**
 * Validates the Pull Sync request.
 * 'since' is an ISO timestamp of the last successful sync.
 */
export const syncQuerySchema = z.object({
  since: z.string().datetime({ offset: true }).optional(),
});

/**
 * Validates the Push Sync request.
 */
export const pushSyncSchema = z.object({
  habits: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        icon: z.string(),
        target: z.number(),
        category: z.string(),
        startDate: z.string().datetime({ offset: true }), // Required for Upsert Create
        order: z.number().optional(),
        updatedAt: z.string().datetime({ offset: true }),
      }),
    )
    .default([]),

  entries: z
    .array(
      z.object({
        id: z.string(),
        habitId: z.string(),
        date: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      }),
    )
    .default([]),

  deletedIds: z.array(z.string()).default([]),
});

export type SyncQuery = z.infer<typeof syncQuerySchema>;
export type PushSyncInput = z.infer<typeof pushSyncSchema>;
