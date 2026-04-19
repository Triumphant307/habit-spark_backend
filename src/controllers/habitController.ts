import { Request, Response, NextFunction } from 'express';
import * as habitService from '../services/habitService.js';

// Shorthand type for standard Express async controller functions
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// Express 5 types req.params values as string | string[].
// Route params defined as /:id are always a single string — this helper narrows safely.
const param = (req: Request, key: string): string => String(req.params[key]);

// Get all habits
export const getAllHabits: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habits = await habitService.listHabits(userId);
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// Get a single habit by id
export const getHabitById: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habit = await habitService.getHabit(param(req, 'id'), userId);

    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Add a new habit
export const createNewHabit: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habit = await habitService.addHabit({ ...req.body, userId });
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// Toggle habit completion for a date
export const toggleHabitCompletion: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');
    const { date } = req.body as { date: string };

    const result = await habitService.completeHabit(habitId, date, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update a habit's details
export const updateHabitDetails: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');

    const updated = await habitService.updateHabit(habitId, req.body, userId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete a habit
export const deleteHabitById: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');

    const result = await habitService.deleteHabit(habitId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /habits/:id/reset.
 */
export const resetHabit: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');
    const habit = await habitService.resetHabitStreak(habitId, userId);
    res.json(habit);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /habits/:id/stats.
 */
export const getStats: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');
    const stats = await habitService.getHabitStats(habitId, userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /habits/reorder.
 */
export const reorder: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const { idArray } = req.body as { idArray: string[] };
    const result = await habitService.reorderHabits(idArray, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
