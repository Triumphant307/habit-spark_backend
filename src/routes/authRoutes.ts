import { Router } from 'express';
import { registerSchema, loginSchema } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';

const router = Router();

/**
 * Route: POST /api/auth/register
 * Description: Registers a new user and returns a JWT token.
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * Route: POST /api/auth/login
 * Description: Authenticates a user and returns a JWT token.
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
