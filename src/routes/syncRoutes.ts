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
 * Route: GET /sync
 * Params: ?since=[iso_timestamp]
 */
router.get('/', validate(syncQuerySchema, 'query'), syncController.pullSync);

/**
 * Route: POST /sync
 * Payload: { habits: [], entries: [], deletedIds: [] }
 */
router.post('/', validate(pushSyncSchema), syncController.pushSync);

export default router;
