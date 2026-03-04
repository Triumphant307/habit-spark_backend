import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

/**
 * Route: POST /api/auth/register
 * Description: Registers a new user and returns a JWT token.
 */
router.post('/register', authController.register);

/**
 * Route: POST /api/auth/login
 * Description: Authenticates a user and returns a JWT token.
 */
router.post('/login', authController.login);

export default router;
