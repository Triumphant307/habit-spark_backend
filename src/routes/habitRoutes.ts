import { Router } from 'express';
import {
  getAllHabits,
  getHabitById,
  createNewHabit,
  toggleHabitCompletion,
  updateHabitDetails,
  deleteHabitById,
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

// Get all habits
router.get('/', getAllHabits);

// Get a single habit by id
router.get('/:id', getHabitById);

// Add a new habit
router.post('/', validate(createHabitSchema), createNewHabit);

// Toggle habit completion for a date
router.patch(
  '/:id/complete',
  validate(completeHabitSchema),
  toggleHabitCompletion,
);

// Update a habit's details
router.patch('/:id', validate(updateHabitSchema), updateHabitDetails);

// Delete a habit
router.delete('/:id', deleteHabitById);

export default router;
