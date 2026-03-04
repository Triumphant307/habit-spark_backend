import { z } from 'zod';

/**
 * Schema for user registration.
 * Ensures data quality and provides types for the rest of the application.
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
});

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Infer types from the schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
