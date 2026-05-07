// Request timeout middleware
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const timeoutMiddleware = (ms: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        return next(new AppError('Request timed out', 503));
      }
    }, ms); // Custom timeout

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};
