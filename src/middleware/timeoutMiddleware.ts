// Request timeout middleware
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../lib/logger.js';

export const timeoutMiddleware = (ms: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(
          {
            url: req.originalUrl,
            method: req.method,
            timeout: ms,
            requestId: req.id,
          },
          'Request terminated due to timeout',
        );
        return next(new AppError('Request timed out', 503));
      }
    }, ms); // Custom timeout

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};
