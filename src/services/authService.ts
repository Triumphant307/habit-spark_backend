import * as userRepository from '../repositories/userRepository.js';
import { hashPassword, comparePassword, generateToken } from '../lib/auth.js';
import { RegisterInput, LoginInput } from '../validators/authValidators.js';
import { AppError } from '../utils/errors.js';

/**
 * Handles the registration of a new user.
 *
 * Logic:
 * 1. Check if the user already exists to provide a clean error message.
 * 2. Hash the password for security (never store plain text).
 * 3. Save the new user via the repository.
 * 4. Return a JWT so the user is "logged in" immediately after signing up.
 */
export const register = async (data: RegisterInput) => {
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    ...data,
    password: hashedPassword,
  });

  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Handles user login.
 *
 * Logic:
 * 1. Retrieve the user by email (includes the hashed password).
 * 2. Verify the password using bcrypt.
 * 3. If valid, return a fresh JWT.
 * 4. Uses generic error messages to prevent "user enumeration" attacks.
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

  const token = generateToken(user.id);

  return { user, token };
};
