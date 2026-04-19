import * as userRepository from '../repositories/userRepository.js';
import { hashPassword, comparePassword, generateToken } from '../lib/auth.js';
import { SignupInput, LoginInput } from '../validators/authValidators.js';
import { AppError } from '../utils/errors.js';

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

  const token = generateToken(user.id);

  return { user, token };
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

  const token = generateToken(user.id);

  return { user, token };
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
 * For stateless JWT, this primarily returns a success response.
 */
export const logout = async () => {
  return { message: 'Logged out successfully' };
};
