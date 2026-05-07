import { rateLimit } from 'express-rate-limit';

/**
 * General API rate limiter.
 * Limits each IP to 100 requests per 15 minutes.
 */
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
});

/**
 * Stricter rate limiter for authentication routes.
 * Limits each IP to 20 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Too many authentication attempts, please try again after 15 minutes',
  },
});

export const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many sync requests, please try again after 15 minutes',
  },
});
