import { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

/**
 * Controller for user registration.
 *
 * Flow:
 * 1. Validate the body against the Zod schema.
 * 2. Send 400 Bad Request if validation fails.
 * 3. Call the auth service to perform business logic.
 * 4. Respond with 201 Created and the token/user data.
 * 5. Handle specific service errors (like email already exists).
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Stage 1: Validation
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
      return;
    }

    // Stage 2: Business Logic execution
    const result = await authService.register(validation.data);

    // Stage 3: Success Response
    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error: any) {
    // Stage 4: Error Handling
    const status = error.message.includes('exists') ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
};

/**
 * Controller for user login.
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Stage 1: Validation
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
      return;
    }

    // Stage 2: Business Logic execution
    const result = await authService.login(validation.data);

    // Stage 3: Success Response
    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error: any) {
    // Stage 4: Error Handling
    const status = error.message.includes('Invalid') ? 401 : 500;
    res.status(status).json({ error: error.message });
  }
};
