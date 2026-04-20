import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';

/**
 * Handles POST /auth/signup.
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.signup(req.body);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /auth/login.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /auth/me.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.getUserProfile(req.userId as string);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /auth/logout.
 */
export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.logout();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
