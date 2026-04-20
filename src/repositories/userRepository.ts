import { prisma } from '../config/database.js';
import { SignupInput } from '../validators/authValidators.js';

/**
 * Finds a user in the database by their email address.
 *
 * @param email - The email to search for.
 * @returns The user object if found, otherwise null.
 */
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Finds a user in the database by their ID.
 *
 * @param id - The user ID to search for.
 * @returns The user object if found, otherwise null.
 */
export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Creates a new user record in the database.
 *
 * @param data - The user signup data (email, nickname, hashed password).
 * @returns The newly created user object.
 */
export const createUser = async (
  data: SignupInput & { passwordHash: string },
) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.nickname,
    },
  });
};
