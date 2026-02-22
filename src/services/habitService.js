import { createHabit, toggleCompletion } from "../domain/habit.js";
import * as habitRepository from "../repositories/habitRepository.js";
import { AppError } from "../utils/errors.js";

// List all habits
export const listHabits = async () => {
  //fetch habits from the database
  const habits = await habitRepository.getAll();
  return habits;
};

// Get a single habit by id
export const getHabit = async (id) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);
  return habit;
};

// Add a new habit
export const addHabit = async (data) => {
  //use domain logic to create habit
  const habit = createHabit(data);

  //save to DB
  const savedHabit = await habitRepository.save(habit);
  return savedHabit;
};

// Mark habit as completed/uncompleted for a date
export const completeHabit = async (id, date) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  // Convert string to Date object
  const completionDate = new Date(date);
  completionDate.setUTCHours(0, 0, 0, 0);

  const { isNowCompleted, streak } = await toggleCompletion(
    habit.id,
    completionDate,
  );

  const updatedHabit = await habitRepository.getById(id);

  return { habit: updatedHabit, isNowCompleted, streak };
};

// Update a habit's editable fields
export const updateHabit = async (id, data) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  // Only allow user-editable fields
  const {
    title,
    icon,
    category,
    target,
    reminderEnabled,
    reminderTime,
    frequency,
    customFrequency,
  } = data;

  const updated = await habitRepository.update({
    id,
    title,
    icon,
    category,
    target,
    reminderEnabled,
    reminderTime,
    frequency,
    customFrequency,
  });

  return updated;
};

// Delete a habit
export const deleteHabit = async (id) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new AppError("Habit not found", 404);

  await habitRepository.remove(id);

  return { habitId: habit.id, message: "Habit deleted successfully" };
};
