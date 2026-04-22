import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { onboardingSchema, updatePreferencesSchema } from '../validators/userValidators.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * Route: POST /user/onboarding
 */
router.post('/onboarding', validate(onboardingSchema), userController.finishOnboarding);

/**
 * Route: GET /user/preferences
 */
router.get('/preferences', userController.getPreferences);

/**
 * Route: PATCH /user/preferences
 */
router.patch('/preferences', validate(updatePreferencesSchema), userController.updatePreferences);

export default router;
