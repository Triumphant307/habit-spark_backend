import { Request, Response, NextFunction } from 'express';
import {
  addHabit,
  listHabits,
  getHabit,
  updateHabit,
  completeHabit,
  deleteHabit,
} from '../services/habitService.js';

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
    const habits = await listHabits(userId);
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// Get a single habit by id
export const getHabitById: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habit = await getHabit(param(req, 'id'));

    // Check ownership if not already handled by service/repository
    if (habit.userId !== userId) {
      res.status(403).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    res.json(habit);
  } catch (error) {
    next(error);
  }
};

// Add a new habit — body validated by createHabitSchema middleware
export const createNewHabit: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habit = await addHabit({ ...req.body, userId });
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// Toggle habit completion for a date — body validated by completeHabitSchema middleware
export const toggleHabitCompletion: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');
    const { date } = req.body as { date: string };

    // Ownership check
    const habit = await getHabit(habitId);
    if (habit.userId !== userId) {
      res.status(403).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const result = await completeHabit(habitId, date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update a habit's details — body validated by updateHabitSchema middleware
export const updateHabitDetails: AsyncHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string;
    const habitId = param(req, 'id');

    // Ownership check
    const habit = await getHabit(habitId);
    if (habit.userId !== userId) {
      res.status(403).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const updated = await updateHabit(habitId, req.body);
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

    // Ownership check
    const habit = await getHabit(habitId);
    if (habit.userId !== userId) {
      res.status(403).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const result = await deleteHabit(habitId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
