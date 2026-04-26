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
 * @openapi
 * /suggestions:
 *   get:
 *     tags: [Suggestions]
 *     summary: Fetch curated habit tips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         description: Text search for title/description
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of suggestions
 */
router.get(
  '/',
  validate(suggestionQuerySchema, 'query'),
  suggestionController.getSuggestions,
);

/**
 * @openapi
 * /suggestions/fav:
 *   post:
 *     tags: [Suggestions]
 *     summary: Toggle favorite status for a tip
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipId, isFavorite]
 *             properties:
 *               tipId: { type: string }
 *               isFavorite: { type: boolean }
 *     responses:
 *       200:
 *         description: Favorite toggled successfully
 */
router.post(
  '/fav',
  validate(toggleFavoriteSchema),
  suggestionController.toggleFavorite,
);

/**
 * @openapi
 * /suggestions/categories:
 *   get:
 *     tags: [Suggestions]
 *     summary: Get list of available suggestion categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of category strings
 */
router.get('/categories', suggestionController.getCategories);

export default router;
