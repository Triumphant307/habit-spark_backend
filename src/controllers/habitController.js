import {
  addHabit,
  listHabits,
  getHabit,
  updateHabit,
  completeHabit,
  deleteHabit,
} from "../services/habitService.js";

// Get all habits
export const getAllHabits = async (req, res, next) => {
  try {
    const habits = await listHabits();
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// Get a single habit by id
export const getHabitById = async (req, res, next) => {
  try {
    const habit = await getHabit(req.params.id);
    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Add a new habit
export const createNewHabit = async (req, res, next) => {
  try {
    const habit = await addHabit(req.body);
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// Toggle habit completion for a date
export const toggleHabitCompletion = async (req, res, next) => {
  try {
    const { date } = req.body;
    const result = await completeHabit(req.params.id, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update a habit's details
export const updateHabitDetails = async (req, res, next) => {
  try {
    const updated = await updateHabit(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a habit
export const deleteHabitById = async (req, res, next) => {
  try {
    const result = await deleteHabit(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
