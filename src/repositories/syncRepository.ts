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

      // Prepare habit data with Date objects and mandatory fields
      const habitData = {
        ...habit,
        startDate: new Date(habit.startDate),
        updatedAt: new Date(habit.updatedAt),
        userId,
        slug: habit.title.toLowerCase().replace(/ /g, '-'),
      };

      await tx.habit.upsert({
        where: { id: habit.id },
        create: habitData,
        update: { ...habitData, deletedAt: null },
      });
    }

    // 2. Process Entry Upserts
    for (const entry of data.entries) {
      const entryData = {
        ...entry,
        date: new Date(entry.date),
        updatedAt: new Date(entry.updatedAt),
      };

      await tx.habitEntry.upsert({
        where: { id: entry.id },
        create: entryData,
        update: { ...entryData, deletedAt: null },
      });
    }

    // 3. Process Soft Deletes
    if (data.deletedIds.length > 0) {
      const now = new Date();
      await tx.habit.updateMany({
        where: { id: { in: data.deletedIds }, userId },
        data: { deletedAt: now },
      });

      // Also soft-delete entries associated with these habits
      await tx.habitEntry.updateMany({
        where: { habitId: { in: data.deletedIds } },
        data: { deletedAt: now },
      });
    }

    return { success: true };
  });
};
