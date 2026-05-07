/**
 * Authentication and Security Utilities
 *
 * This module provides helper functions for password hashing (via bcrypt)
 * and JSON Web Token (JWT) management (via jsonwebtoken).
 */
import { env } from '../config/env.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param password - The plain-text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
};

/**
 * Compares a plain-text password against a hashed password.
 *
 * @param password - The plain-text password to check.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generates a signed Access Token (short-lived).
 */
export const generateAccessToken = (userId: string): string => {
  const secret = env.JWT_SECRET;
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Generates a signed Refresh Token (long-lived).
 */
export const generateRefreshToken = (userId: string): string => {
  const secret = env.REFRESH_TOKEN_SECRET;
  const expiresIn =
    env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'];

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Verifies an Access Token.
 */
export const verifyAccessToken = (token: string) => {
  const secret = env.JWT_SECRET;
  return jwt.verify(token, secret) as { userId: string };
};

/**
 * Verifies a Refresh Token.
 */
export const verifyRefreshToken = (token: string) => {
  const secret = env.REFRESH_TOKEN_SECRET;
  return jwt.verify(token, secret) as { userId: string };
};

/**
 * Legacy support for backward compatibility.
 * @deprecated Use generateAccessToken instead.
 */
export const generateToken = generateAccessToken;

/**
 * Legacy support for backward compatibility.
 * @deprecated Use verifyAccessToken instead.
 */
export const verifyToken = verifyAccessToken;
