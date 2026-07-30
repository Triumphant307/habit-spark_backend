import { z } from 'zod';

/**
 * Schema for user signup.
 * Ensures data quality and provides types for the rest of the application.
 */
export const signupSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  nickname: z.string().trim().optional(),
});

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for Google OAuth login.
 */
export const googleLoginSchema = z.object({
  idToken: z.string().trim().min(1, 'ID Token is required'),
});

// Infer types from the schemas
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
