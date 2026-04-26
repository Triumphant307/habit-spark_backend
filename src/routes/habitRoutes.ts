import { Router } from 'express';
import {
  getAllHabits,
  getHabitById,
  createNewHabit,
  toggleHabitCompletion,
  updateHabitDetails,
  deleteHabitById,
  resetHabit,
  getStats,
  reorder,
} from '../controllers/habitController.js';
import { validate } from '../middleware/validate.js';
import {
  createHabitSchema,
  updateHabitSchema,
  completeHabitSchema,
} from '../validators/habitValidators.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Secure all habit routes with authentication
router.use(authenticate);

/**
 * @openapi
 * /habits:
 *   get:
 *     tags: [Habits]
 *     summary: List all active habits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of habits
 */
router.get('/', getAllHabits);

/**
 * @openapi
 * /habits/{id}:
 *   get:
 *     tags: [Habits]
 *     summary: Get habit by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Habit data
 *       404:
 *         description: Habit not found
 */
router.get('/:id', getHabitById);

/**
 * @openapi
 * /habits:
 *   post:
 *     tags: [Habits]
 *     summary: Create a new habit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, icon, category]
 *             properties:
 *               title: { type: string }
 *               icon: { type: string }
 *               category: { type: string }
 *               target: { type: number, default: 7 }
 *     responses:
 *       201:
 *         description: Habit created successfully
 */
router.post('/', validate(createHabitSchema), createNewHabit);

/**
 * @openapi
 * /habits/{id}/complete:
 *   post:
 *     tags: [Habits]
 *     summary: Toggle habit completion for a date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date: { type: string, format: date, example: "2026-04-26" }
 *     responses:
 *       200:
 *         description: Completion toggled successfully
 */
router.post(
  '/:id/complete',
  validate(completeHabitSchema),
  toggleHabitCompletion,
);

/**
 * @openapi
 * /habits/{id}/reset:
 *   post:
 *     tags: [Habits]
 *     summary: Reset habit streak to zero
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Streak reset successfully
 */
router.post('/:id/reset', resetHabit);

/**
 * @openapi
 * /habits/{id}/stats:
 *   get:
 *     tags: [Habits]
 *     summary: Get habit analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Analytic data
 */
router.get('/:id/stats', getStats);

/**
 * @openapi
 * /habits/reorder:
 *   post:
 *     tags: [Habits]
 *     summary: Save drag-and-drop habit order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idArray]
 *             properties:
 *               idArray: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Order saved successfully
 */
router.post('/reorder', reorder);

/**
 * @openapi
 * /habits/{id}:
 *   patch:
 *     tags: [Habits]
 *     summary: Update habit details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               icon: { type: string }
 *               target: { type: number }
 *     responses:
 *       200:
 *         description: Habit updated successfully
 */
router.patch('/:id', validate(updateHabitSchema), updateHabitDetails);

/**
 * @openapi
 * /habits/{id}:
 *   delete:
 *     tags: [Habits]
 *     summary: Soft-delete a habit
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Habit deleted successfully
 */
router.delete('/:id', deleteHabitById);

export default router;
