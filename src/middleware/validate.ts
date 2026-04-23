import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

/**
 * Reusable validation middleware factory.
 * Accepts a Zod schema and an optional source ('body' | 'query').
 * Runs safeParse and attaches the result back to the request object.
 */
export const validate =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = source === 'query' ? req.query : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const message = result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');

      return next(new AppError(message, 400));
    }

    // Attach parsed/coerced data back to the correct source
    if (source === 'query') {
      // Express 5 makes req.query a read-only getter.
      // We use defineProperty to override it with our validated/transformed data.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req.body = result.data;
    }
    
    next();
  };
