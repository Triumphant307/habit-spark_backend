import type { Habit, HabitEntry, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { HabitData } from '../domain/habit.js';

// Convenience type used across layers — Habit with its completion history
export type HabitWithHistory = Habit & { history: HabitEntry[] };

// ── Habit queries ────────────────────────────────────────────────────────────

export const getAll = async (userId: string): Promise<HabitWithHistory[]> => {
  return await prisma.habit.findMany({
    where: { userId },
    include: { history: true },
  });
};

export const getById = async (id: string): Promise<HabitWithHistory | null> => {
  return await prisma.habit.findUnique({
    where: { id },
    include: { history: true },
  });
};

// Upserts on [userId, slug] to handle duplicate names gracefully on retry
export const save = async (habit: HabitData): Promise<Habit> => {
  const { userId, slug, ...rest } = habit;
  return await prisma.habit.upsert({
    where: { userId_slug: { userId, slug } },
    create: habit,
    update: rest,
  });
};

// Accepts pre-filtered payload from service. Cast to HabitUpdateInput since
// the service already validates field types via Zod before calling this.
export const update = async (
  id: string,
  data: Record<string, unknown>,
): Promise<HabitWithHistory> => {
  return await prisma.habit.update({
    where: { id },
    data: data as Prisma.HabitUpdateInput,
    include: { history: true },
  });
};

export const remove = async (id: string): Promise<Habit> => {
  return await prisma.habit.delete({
    where: { id },
  });
};

export const updateStreak = async (
  habitId: string,
  streak: number,
): Promise<HabitWithHistory> => {
  return await prisma.habit.update({
    where: { id: habitId },
    data: { streak },
    include: { history: true },
  });
};

// ── HabitEntry queries ───────────────────────────────────────────────────────

export const findEntry = async (
  habitId: string,
  date: Date,
): Promise<HabitEntry | null> => {
  return await prisma.habitEntry.findUnique({
    where: { habitId_date: { habitId, date } },
  });
};

export const addEntry = async (
  habitId: string,
  date: Date,
): Promise<HabitEntry> => {
  return await prisma.habitEntry.create({ data: { habitId, date } });
};

export const removeEntry = async (id: string): Promise<HabitEntry> => {
  return await prisma.habitEntry.delete({ where: { id } });
};

export const getEntries = async (habitId: string): Promise<HabitEntry[]> => {
  return await prisma.habitEntry.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
  });
};
