import { prisma } from '../config/database.js';

/**
 * Fetches all habits for a user that were updated or deleted after the 'since' timestamp.
 */
export const getHabitDelta = async (userId: string, since: Date) => {
  return await prisma.habit.findMany({
    where: {
      userId,
      updatedAt: { gt: since },
    },
    // We don't include history here; it's handled separately to keep the payload flat and efficient
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
