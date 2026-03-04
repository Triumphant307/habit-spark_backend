import { prisma } from '../config/database.js';
import { RegisterInput } from '../validators/authValidators.js';

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
 * Creates a new user record in the database.
 *
 * @param data - The user registration data (email, name, hashed password).
 * @returns The newly created user object.
 */
export const createUser = async (data: RegisterInput) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.password, // This should be already hashed by the service
      name: data.name,
    },
  });
};
