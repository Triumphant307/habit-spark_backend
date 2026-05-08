import * as userRepository from '../repositories/userRepository.js';
import * as authRepository from '../repositories/authRepository.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../lib/auth.js';
import { SignupInput, LoginInput } from '../validators/authValidators.js';
import { AppError } from '../utils/errors.js';
import logger from '../lib/logger.js';

/**
 * Handles the signup of a new user.
 */
export const signup = async (data: SignupInput) => {
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    ...data,
    passwordHash: hashedPassword,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in DB
  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  logger.info({ userId: user.id, email: user.email }, 'User signed up');

  return { user, accessToken, refreshToken };
};

/**
 * Handles user login.
 */
export const login = async (data: LoginInput) => {
  const user = await userRepository.findUserByEmail(data.email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in DB
  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  return { user, accessToken, refreshToken };
};

/**
 * Handles token refresh.
 */
export const refresh = async (oldRefreshToken: string) => {
  // 1. Verify the token (JWT signature)
  try {
    verifyRefreshToken(oldRefreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  // 2. Check if token exists in DB
  const storedToken = await authRepository.findRefreshToken(oldRefreshToken);
  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) await authRepository.deleteRefreshToken(oldRefreshToken);
    throw new AppError('Refresh token expired or revoked', 401);
  }

  // 3. Generate new tokens (Rotation)
  const user = storedToken.user;
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  // 4. Update DB (Replace old token with new one)
  await authRepository.deleteRefreshToken(oldRefreshToken);
  await authRepository.createRefreshToken({
    token: newRefreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  logger.info({ userId: user.id, email: user.email }, 'User token rotated');

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Retrieves the current user's profile.
 */
export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

/**
 * Handles user logout.
 */
export const logout = async (refreshToken?: string) => {
  if (refreshToken) {
    try {
      await authRepository.deleteRefreshToken(refreshToken);
    } catch {
      // Token might not exist, ignore
    }
  }
  logger.info({ refreshToken: refreshToken }, 'User logged out successfully');

  return { message: 'Logged out successfully' };
};
