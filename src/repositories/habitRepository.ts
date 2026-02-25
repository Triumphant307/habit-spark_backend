import { Habit, HabitEntry } from "@prisma/client";
import { prisma } from "../config/database.js";
import { HabitData } from "../domain/habit.js";

// Convenience type used across layers — Habit with its completion history
export type HabitWithHistory = Habit & { history: HabitEntry[] };

// Shape of the update payload: always includes id, plus any editable fields
export interface UpdateHabitPayload {
  id: string;
  title?: string;
  icon?: string;
  category?: string;
  target?: number;
  frequency?: string;
  customFrequency?: Record<string, unknown>;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

// ── Habit queries ────────────────────────────────────────────────────────────

export const getAll = async (): Promise<HabitWithHistory[]> => {
  return await prisma.habit.findMany({
    include: { history: true },
  });
};

export const getById = async (id: string): Promise<HabitWithHistory | null> => {
  return await prisma.habit.findUnique({
    where: { id },
    include: { history: true },
  });
};

// Upserts on slug to handle duplicate names gracefully on retry
export const save = async (habit: HabitData): Promise<Habit> => {
  const { slug, ...rest } = habit;
  return await prisma.habit.upsert({
    where: { slug },
    create: habit,
    update: rest,
  });
};

export const update = async (
  updatedHabit: UpdateHabitPayload,
): Promise<HabitWithHistory> => {
  const { id, ...data } = updatedHabit;
  return await prisma.habit.update({
    where: { id },
    data,
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
    orderBy: { date: "desc" },
  });
};
