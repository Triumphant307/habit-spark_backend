import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';

/**
 * Handles POST /api/auth/register.
 *
 * Delegates user creation to the auth service and responds
 * with 201 and the generated JWT token + user data.
 * Errors (e.g. duplicate email) are forwarded to the
 * centralized error-handling middleware via next().
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /api/auth/login.
 *
 * Delegates credential verification to the auth service and
 * responds with 200 and the generated JWT token + user data.
 * Invalid credentials or other errors are forwarded to the
 * centralized error-handling middleware via next().
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
