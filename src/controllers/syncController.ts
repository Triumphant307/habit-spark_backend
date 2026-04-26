import { Request, Response, NextFunction } from 'express';
import * as syncService from '../services/syncService.js';

/**
 * Handles GET /sync.
 * Downloads all changes for the user since the provided timestamp.
 */
export const pullSync = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const { since } = req.query as { since?: string };

    const delta = await syncService.getFullDelta(userId, since);
    res.status(200).json(delta);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /sync.
 * Uploads local changes from the client to the server.
 */
export const pushSync = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const result = await syncService.processPushSync(userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
