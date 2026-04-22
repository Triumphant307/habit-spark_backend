import { prisma } from '../config/database.js';
import { SignupInput } from '../validators/authValidators.js';

/**
 * Finds a user in the database by their email address.
 * Includes preferences by default for a complete user profile.
 */
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  });
};

/**
 * Finds a user in the database by their ID.
 */
export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: { preferences: true },
  });
};

/**
 * Creates a new user and their default preferences in a transaction.
 */
export const createUser = async (
  data: SignupInput & { passwordHash: string },
) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.nickname,
      // Create empty preferences record immediately
      preferences: {
        create: {},
      },
    },
    include: { preferences: true },
  });
};

/**
 * Updates a user's basic profile (e.g., name/nickname).
 */
export const updateUser = async (id: string, data: { name?: string }) => {
  return await prisma.user.update({
    where: { id },
    data,
    include: { preferences: true },
  });
};

/**
 * Updates a user's preferences.
 */
export const updatePreferences = async (
  userId: string,
  data: Record<string, string | boolean | number>,
) => {
  return await prisma.userPreference.update({
    where: { userId },
    data,
  });
};
