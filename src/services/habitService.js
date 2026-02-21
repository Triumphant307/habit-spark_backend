import { createHabit, toggleCompletion } from "../domain/habit.js";
import * as habitRepository from "../repositories/habitRepository.js";

// List all habits
export const listHabits = async () => {
  //fetch habits from the database
  const habits = await habitRepository.getAll();
  return habits;
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
  if (!habit) throw new Error("Habit not found");

  // Convert string to Date object
  const completionDate = new Date(date);
  completionDate.setUTCHours(0, 0, 0, 0);

  const isNowCompleted = await toggleCompletion(habit.id, completionDate);

  const updatedHabit = await habitRepository.getById(id);

  return { habit: updatedHabit, isNowCompleted };
};

// Delete a habit
export const deleteHabit = async (id) => {
  const habit = await habitRepository.getById(id);
  if (!habit) throw new Error("Habit not found");

  await habitRepository.remove(id);

  return { habitId: habit.id, message: "Habit deleted successfully" };
};
