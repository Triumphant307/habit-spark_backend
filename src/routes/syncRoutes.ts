import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { syncQuerySchema } from '../validators/syncValidators.js';
import * as syncController from '../controllers/syncController.js';

const router = Router();

// Sync is the heart of the user's data; it must be authenticated
router.use(authenticate);

/**
 * Route: GET /sync
 * Params: ?since=[iso_timestamp]
 */
router.get('/', validate(syncQuerySchema, 'query'), syncController.pullSync);

export default router;
