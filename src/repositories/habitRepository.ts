import type { Habit, HabitEntry, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { HabitData } from '../domain/habit.js';

// Convenience type used across layers — Habit with its completion history
export type HabitWithHistory = Habit & { history: HabitEntry[] };

// ── Habit queries ────────────────────────────────────────────────────────────

export const getAll = async (userId: string): Promise<HabitWithHistory[]> => {
  return await prisma.habit.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      history: {
        where: { deletedAt: null },
      },
    },
    orderBy: { order: 'asc' },
  });
};

export const getById = async (id: string): Promise<HabitWithHistory | null> => {
  return await prisma.habit.findFirst({
    where: { id, deletedAt: null },
    include: {
      history: {
        where: { deletedAt: null },
      },
    },
  });
};

// Upserts on [userId, slug] to handle duplicate names gracefully on retry
export const save = async (habit: HabitData): Promise<Habit> => {
  const { userId, slug, ...rest } = habit;
  return await prisma.habit.upsert({
    where: { userId_slug: { userId, slug } },
    create: habit,
    update: {
      ...rest,
      deletedAt: null, // Reactivate if it was soft-deleted
    },
  });
};

// Accepts pre-filtered payload from service.
export const update = async (
  id: string,
  data: Record<string, unknown>,
): Promise<HabitWithHistory> => {
  return await prisma.habit.update({
    where: { id },
    data: data as Prisma.HabitUpdateInput,
    include: {
      history: {
        where: { deletedAt: null },
      },
    },
  });
};

/**
 * Performs a soft delete by setting deletedAt.
 */
export const remove = async (id: string): Promise<Habit> => {
  return await prisma.habit.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const updateStreak = async (
  habitId: string,
  streak: number,
): Promise<HabitWithHistory> => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: { streak },
    include: {
      history: {
        where: { deletedAt: null },
      },
    },
  });
};

/**
 * Resets the habit streak to zero.
 */
export const resetStreak = async (id: string): Promise<Habit> => {
  return await prisma.habit.update({
    where: { id },
    data: { streak: 0 },
  });
};

/**
 * Updates the order of habits in bulk.
 */
export const reorderHabits = async (idArray: string[]) => {
  return await prisma.$transaction(
    idArray.map((id, index) =>
      prisma.habit.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );
};

// ── HabitEntry queries ───────────────────────────────────────────────────────

export const findEntry = async (
  habitId: string,
  date: Date,
): Promise<HabitEntry | null> => {
  return await prisma.habitEntry.findUnique({
    where: {
      habitId_date: { habitId, date },
    },
  });
};

export const addEntry = async (
  habitId: string,
  date: Date,
): Promise<HabitEntry> => {
  // If a soft-deleted entry exists for this date, restore it
  const existing = await findEntry(habitId, date);
  if (existing) {
    return await prisma.habitEntry.update({
      where: { id: existing.id },
      data: { deletedAt: null },
    });
  }
  return await prisma.habitEntry.create({ data: { habitId, date } });
};

export const removeEntry = async (id: string): Promise<HabitEntry> => {
  return await prisma.habitEntry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const getEntries = async (habitId: string): Promise<HabitEntry[]> => {
  return await prisma.habitEntry.findMany({
    where: {
      habitId,
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
  });
};
