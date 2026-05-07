import express from 'express';
import request from 'supertest';
import { timeoutMiddleware } from '../middleware/timeoutMiddleware.js';
import { errorHandler } from '../middleware/errorMiddleware.js';

describe('Timeout Middleware', () => {
  const app = express();

  app.get('/slow', timeoutMiddleware(100), async (req, res, next) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!res.headersSent) {
        res.status(200).json({ message: 'This should not be reached' });
      }
    } catch (error) {
      next(error);
    }
  });

  app.get('/fast', timeoutMiddleware(100), async (req, res, next) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (!res.headersSent) {
        res.status(200).json({ message: 'This should be reached' });
      }
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  it('should return 503 if request takes too long', async () => {
    const response = await request(app).get('/slow');
    expect(response.status).toBe(503);
    // Use toMatchObject to handle extra fields from global error handler
    expect(response.body).toMatchObject({ message: 'Request timed out' });
  });

  it('should allow request to complete if it finishes before timeout', async () => {
    const response = await request(app).get('/fast');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'This should be reached' });
  });
});
