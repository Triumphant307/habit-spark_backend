import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import logger from '../lib/logger.js';

// Extend the base Error type to include our custom fields from AppError
interface HttpError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  // next is required by Express for error middleware even if unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  logger.error({ err, requestId: req.id }, err.message);

  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  res.status(statusCode).json({
    status: err.status ?? (statusCode >= 500 ? 'error' : 'fail'),
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as HttpError;
  error.statusCode = 404;
  next(error);
};
