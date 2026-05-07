import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'none' as const, // Critical for cross-origin cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Handles POST /auth/signup.
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, accessToken, refreshToken } = await authService.signup(
      req.body,
    );

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token: accessToken,
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
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
    );

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      message: 'Login successful',
      user,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /auth/refresh.
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      res.status(401).json({ message: 'No refresh token provided' });
      return;
    }

    const { accessToken, refreshToken } =
      await authService.refresh(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      token: accessToken,
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
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.logout(refreshToken);

    res.clearCookie('refreshToken', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
