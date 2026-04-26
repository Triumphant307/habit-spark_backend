import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  syncQuerySchema,
  pushSyncSchema,
} from '../validators/syncValidators.js';
import * as syncController from '../controllers/syncController.js';

const router = Router();

// Sync is the heart of the user's data; it must be authenticated
router.use(authenticate);

/**
 * @openapi
 * /sync:
 *   get:
 *     tags: [Cloud Sync]
 *     summary: Pull latest changes from the server
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: since
 *         description: ISO timestamp of the last successful sync
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Delta object containing updated and deleted records
 */
router.get('/', validate(syncQuerySchema, 'query'), syncController.pullSync);

/**
 * @openapi
 * /sync:
 *   post:
 *     tags: [Cloud Sync]
 *     summary: Push local changes to the server
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habits: { type: array, items: { type: object } }
 *               entries: { type: array, items: { type: object } }
 *               deletedIds: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Sync successful
 */
router.post('/', validate(pushSyncSchema), syncController.pushSync);

export default router;
