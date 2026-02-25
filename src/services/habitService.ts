import { Habit } from "@prisma/client";
import { createHabit, calculateStreak } from "../domain/habit.js";
import * as habitRepository from "../repositories/habitRepository.js";
import { HabitWithHistory } from "../repositories/habitRepository.js";
import { AppError } from "../utils/errors.js";

// Input type for updateHabit — all fields are optional since PATCH is partial
interface UpdateHabitData {
  title?: string;
  icon?: string;
  category?: string;
  target?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  frequency?: string;
  customFrequency?: Record<string, unknown>;
  [key: string]: unknown; // allows bracket-notation access in the reduce
}

// ── Service functions ────────────────────────────────────────────────────────

export const listHabits = async (): Promise<HabitWithHistory[]> => {
  return await habitRepository.getAll();
};

export const getHabit = async (id: string): Promise<HabitWithHistory> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);
  return habit;
};

export const addHabit = async (
  data: Parameters<typeof createHabit>[0],
): Promise<Habit> => {
  const habit = createHabit(data);
  return await habitRepository.save(habit);
};

export const completeHabit = async (
  id: string,
  date: string,
): Promise<{
  habit: HabitWithHistory;
  isNowCompleted: boolean;
  streak: number;
}> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  // Normalise to UTC midnight so the DB unique constraint matches consistently
  const completionDate = new Date(date);
  completionDate.setUTCHours(0, 0, 0, 0);

  // Toggle: remove if already completed, add if not
  const existing = await habitRepository.findEntry(id, completionDate);
  if (existing) {
    await habitRepository.removeEntry(existing.id);
  } else {
    await habitRepository.addEntry(id, completionDate);
  }

  // Recalculate streak using pure domain logic
  const entries = await habitRepository.getEntries(id);
  const entryDates = entries.map((e) => e.date); // already Date objects from Prisma

  const referenceDate = new Date(date);
  referenceDate.setUTCHours(0, 0, 0, 0);

  const streak = calculateStreak(entryDates, referenceDate);
  const updatedHabit = await habitRepository.updateStreak(id, streak);
  return { habit: updatedHabit, isNowCompleted: !existing, streak };
};

export const updateHabit = async (
  id: string,
  data: UpdateHabitData,
): Promise<HabitWithHistory> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  const allowedFields: (keyof UpdateHabitData)[] = [
    "title",
    "icon",
    "category",
    "target",
    "reminderEnabled",
    "reminderTime",
    "frequency",
    "customFrequency",
  ];

  // Build payload from only provided fields — avoid sending undefined to Prisma
  const payload = allowedFields.reduce<Record<string, unknown>>(
    (acc, field) => {
      if (data[field] !== undefined) {
        acc[field as string] = data[field];
      }
      return acc;
    },
    {},
  );

  return await habitRepository.update({ id, ...payload });
};

export const deleteHabit = async (
  id: string,
): Promise<{ habitId: string; message: string }> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  await habitRepository.remove(id);
  return { habitId: habit.id, message: "Habit deleted successfully" };
};
