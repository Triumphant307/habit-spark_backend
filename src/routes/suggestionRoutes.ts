import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  suggestionQuerySchema,
  toggleFavoriteSchema,
} from '../validators/suggestionValidators.js';
import * as suggestionController from '../controllers/suggestionController.js';

const router = Router();

// Suggestions are available to authenticated users
router.use(authenticate);

/**
 * Route: GET /suggestions
 * Supports query params: page, limit, q, category
 */
router.get(
  '/',
  validate(suggestionQuerySchema, 'query'),
  suggestionController.getSuggestions,
);

/**
 * Route: POST /suggestions/fav
 * Payload: { tipId: string, isFavorite: boolean }
 */
router.post(
  '/fav',
  validate(toggleFavoriteSchema),
  suggestionController.toggleFavorite,
);

/**
 * Route: GET /suggestions/categories
 */
router.get('/categories', suggestionController.getCategories);

export default router;
