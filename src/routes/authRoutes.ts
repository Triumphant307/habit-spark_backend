import { Router } from 'express';
import { signupSchema, loginSchema } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

/**
 * Route: POST /auth/signup
 */
router.post('/signup', validate(signupSchema), authController.signup);

/**
 * Route: POST /auth/login
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * Route: POST /auth/logout
 */
router.post('/logout', authenticate, authController.logout);

/**
 * Route: GET /auth/me
 */
router.get('/me', authenticate, authController.getMe);

export default router;
