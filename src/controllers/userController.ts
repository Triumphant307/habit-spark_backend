import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';

/**
 * Handles POST /user/onboarding.
 */
export const finishOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const result = await userService.completeOnboarding(userId, req.body);
    res.status(200).json({
      message: 'Onboarding completed successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /user/preferences.
 */
export const getPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const preferences = await userService.getUserPreferences(userId);
    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles PATCH /user/preferences.
 */
export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const updated = await userService.updateUserPreferences(userId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
