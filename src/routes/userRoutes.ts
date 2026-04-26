import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  onboardingSchema,
  updatePreferencesSchema,
} from '../validators/userValidators.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /user/onboarding:
 *   post:
 *     tags: [User]
 *     summary: Complete the 5-step onboarding wizard
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nickname, goal, commitment, firstHabit]
 *             properties:
 *               nickname: { type: string }
 *               goal: { type: string }
 *               commitment: { type: string }
 *               firstHabit:
 *                 type: object
 *                 required: [title, icon, category]
 *                 properties:
 *                   title: { type: string }
 *                   icon: { type: string }
 *                   category: { type: string }
 *                   target: { type: number, default: 7 }
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 */
router.post(
  '/onboarding',
  validate(onboardingSchema),
  userController.finishOnboarding,
);

/**
 * @openapi
 * /user/preferences:
 *   get:
 *     tags: [User]
 *     summary: Get user UI preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preference data
 */
router.get('/preferences', userController.getPreferences);

/**
 * @openapi
 * /user/preferences:
 *   patch:
 *     tags: [User]
 *     summary: Update user UI preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme: { type: string, enum: [light, dark] }
 *               sidebarCollapsed: { type: boolean }
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.patch(
  '/preferences',
  validate(updatePreferencesSchema),
  userController.updatePreferences,
);

export default router;
