/**
 * Authentication and Security Utilities
 *
 * This module provides helper functions for password hashing (via bcrypt)
 * and JSON Web Token (JWT) management (via jsonwebtoken).
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

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
 * Generates a signed JWT for a given user ID.
 *
 * @param userId - The unique identifier of the user to include in the payload.
 * @returns A signed JWT string.
 * @throws Error if JWT_SECRET is not defined in environment variables.
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  // We cast the expiresIn value to the expected type from the jsonwebtoken library.
  // This is necessary because process.env variables are typed as 'string | undefined',
  // and the library expects a specific 'StringValue' type (like '1h' or '7d').
  const expiresIn = (process.env.JWT_EXPIRES_IN ||
    '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Verifies a JWT and decodes its payload.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded payload containing the userId.
 * @throws Error if JWT_SECRET is not defined or the token is invalid/expired.
 */
export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, secret) as { userId: string };
};
