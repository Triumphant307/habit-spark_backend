import { prisma } from '../config/database.js';
import { PushSyncInput } from '../validators/syncValidators.js';

/**
 * Fetches all habits for a user that were updated or deleted after the 'since' timestamp.
 */
export const getHabitDelta = async (userId: string, since: Date) => {
  return await prisma.habit.findMany({
    where: {
      userId,
      updatedAt: { gt: since },
    },
  });
};

/**
 * Fetches all habit entries for a user that were updated or deleted after the 'since' timestamp.
 */
export const getEntryDelta = async (userId: string, since: Date) => {
  return await prisma.habitEntry.findMany({
    where: {
      habit: {
        userId,
      },
      updatedAt: { gt: since },
    },
  });
};

/**
 * Performs bulk upserts and soft deletes in a single transaction.
 */
export const applyPushDelta = async (userId: string, data: PushSyncInput) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Process Habit Upserts
    for (const habit of data.habits) {
      // Check if habit is already soft-deleted on server
      const existing = await tx.habit.findUnique({ where: { id: habit.id } });
      if (existing?.deletedAt) continue; // Server Wins (Integrity)

      await tx.habit.upsert({
        where: { id: habit.id },
        create: { ...habit, userId, slug: habit.title.toLowerCase().replace(/ /g, '-') },
        update: { ...habit, deletedAt: null },
      });
    }

    // 2. Process Entry Upserts
    for (const entry of data.entries) {
      await tx.habitEntry.upsert({
        where: { id: entry.id },
        create: { ...entry },
        update: { ...entry, deletedAt: null },
      });
    }

    // 3. Process Soft Deletes
    if (data.deletedIds.length > 0) {
      await tx.habit.updateMany({
        where: { id: { in: data.deletedIds }, userId },
        data: { deletedAt: new Date() },
      });
      
      // Also soft-delete entries associated with these habits
      await tx.habitEntry.updateMany({
        where: { habitId: { in: data.deletedIds } },
        data: { deletedAt: new Date() },
      });
    }
    
    return { success: true };
  });
};
