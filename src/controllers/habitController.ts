import { Request, Response, NextFunction } from "express";
import {
  addHabit,
  listHabits,
  getHabit,
  updateHabit,
  completeHabit,
  deleteHabit,
} from "../services/habitService.js";

// Shorthand type for standard Express async controller functions
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// Get all habits
export const getAllHabits: AsyncHandler = async (req, res, next) => {
  try {
    const habits = await listHabits();
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// Get a single habit by id
export const getHabitById: AsyncHandler = async (req, res, next) => {
  try {
    const habit = await getHabit(req.params.id);
    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Add a new habit — body is validated by createHabitSchema middleware
export const createNewHabit: AsyncHandler = async (req, res, next) => {
  try {
    const habit = await addHabit(req.body);
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// Toggle habit completion for a date — body is validated by completeHabitSchema middleware
export const toggleHabitCompletion: AsyncHandler = async (req, res, next) => {
  try {
    const { date } = req.body as { date: string };
    const result = await completeHabit(req.params.id, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update a habit's details — body is validated by updateHabitSchema middleware
export const updateHabitDetails: AsyncHandler = async (req, res, next) => {
  try {
    const updated = await updateHabit(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a habit
export const deleteHabitById: AsyncHandler = async (req, res, next) => {
  try {
    const result = await deleteHabit(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
