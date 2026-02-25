import { createHabit, calculateStreak } from "../domain/habit.js";
import * as habitRepository from "../repositories/habitRepository.js";
import { AppError } from "../utils/errors.js";

// List all habits
export const listHabits = async () => {
  return await habitRepository.getAll();
};

// Get a single habit by id
export const getHabit = async (id) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);
  return habit;
};

// Add a new habit
export const addHabit = async (data) => {
  // Domain validates fields and builds the habit object
  const habit = createHabit(data);
  return await habitRepository.save(habit);
};

// Mark habit as completed / uncompleted for a given date
export const completeHabit = async (id, date) => {
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

// Update a habit's editable fields
export const updateHabit = async (id, data) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  // Define which fields a client is permitted to update
  const allowedFields = [
    "title",
    "icon",
    "category",
    "target",
    "reminderEnabled",
    "reminderTime",
    "frequency",
    "customFrequency",
  ];

  // Build the update payload with only fields that were explicitly provided.
  // This prevents undefined values from reaching Prisma, making the intent
  // explicit rather than relying on Prisma's implicit undefined-ignoring behaviour.
  const payload = allowedFields.reduce((acc, field) => {
    if (data[field] !== undefined) {
      acc[field] = data[field];
    }
    return acc;
  }, {});

  return await habitRepository.update({ id, ...payload });
};

// Delete a habit
export const deleteHabit = async (id) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  await habitRepository.remove(id);
  return { habitId: habit.id, message: "Habit deleted successfully" };
};
