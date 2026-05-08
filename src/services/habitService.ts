import { Habit } from '@prisma/client';
import { createHabit, calculateStreak } from '../domain/habit.js';
import * as habitRepository from '../repositories/habitRepository.js';
import { HabitWithHistory } from '../repositories/habitRepository.js';
import { AppError } from '../utils/errors.js';
import logger from '../lib/logger.js';

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

export const listHabits = async (
  userId: string,
): Promise<HabitWithHistory[]> => {
  return await habitRepository.getAll(userId);
};

export const getHabit = async (
  id: string,
  userId: string,
): Promise<HabitWithHistory> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);
  return habit;
};

export const addHabit = async (
  data: Parameters<typeof createHabit>[0],
): Promise<Habit> => {
  const habit = createHabit(data);

  logger.info(
    { title: habit.title, userId: habit.userId },
    'Creating new habit',
  );
  return await habitRepository.save(habit);
};

export const completeHabit = async (
  id: string,
  date: string,
  userId: string,
): Promise<{
  habit: HabitWithHistory;
  isNowCompleted: boolean;
  streak: number;
}> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);

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

  logger.info(
    {
      habitId: habit.id,
      userId: habit.userId,
      action: existing ? 'unmarked' : 'completed',
      date: referenceDate.toISOString().split('T')[0],
      streak,
    },
    'Habit completion toggled',
  );
  return { habit: updatedHabit, isNowCompleted: !existing, streak };
};

export const updateHabit = async (
  id: string,
  data: UpdateHabitData,
  userId: string,
): Promise<HabitWithHistory> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);

  const allowedFields: (keyof UpdateHabitData)[] = [
    'title',
    'icon',
    'category',
    'target',
    'reminderEnabled',
    'reminderTime',
    'frequency',
    'customFrequency',
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

  return await habitRepository.update(id, payload);
};

export const deleteHabit = async (
  id: string,
  userId: string,
): Promise<{ habitId: string; message: string }> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);

  await habitRepository.remove(id);
  return { habitId: habit.id, message: 'Habit deleted successfully' };
};

export const resetHabitStreak = async (
  id: string,
  userId: string,
): Promise<Habit> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);

  return await habitRepository.resetStreak(id);
};

export const reorderHabits = async (
  idArray: string[],
  userId: string,
): Promise<{ message: string }> => {
  // Validate all habits belong to the user
  const habits = await habitRepository.getAll(userId);
  const userHabitIds = new Set(habits.map((h) => h.id));

  const allValid = idArray.every((id) => userHabitIds.has(id));
  if (!allValid) {
    throw new AppError('Invalid habit IDs provided for reordering', 400);
  }

  await habitRepository.reorderHabits(idArray);
  return { message: 'Habits reordered successfully' };
};

export const getHabitStats = async (
  id: string,
  userId: string,
): Promise<{
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}> => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError('Habit not found', 404);
  if (habit.userId !== userId) throw new AppError('Forbidden', 403);

  const entries = await habitRepository.getEntries(id);
  const totalCompletions = entries.length;

  // Longest streak calculation
  let longestStreak = 0;
  if (entries.length > 0) {
    const dates = entries
      .map((e) => e.date)
      .sort((a, b) => b.getTime() - a.getTime());
    let currentCount = 1;
    let maxCount = 1;

    for (let i = 0; i < dates.length - 1; i++) {
      const diffTime = Math.abs(dates[i].getTime() - dates[i + 1].getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentCount++;
      } else {
        maxCount = Math.max(maxCount, currentCount);
        currentCount = 1;
      }
    }
    longestStreak = Math.max(maxCount, currentCount);
  }

  // Completion rate since tracking start date or creation
  const start = habit.trackingStartDate || habit.createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const completionRate = Number((totalCompletions / totalDays).toFixed(2));

  return {
    totalCompletions,
    currentStreak: habit.streak,
    longestStreak,
    completionRate,
  };
};
