import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import * as rateLimiter from './config/rateLimit.js';
import habitRoutes from './routes/habitRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { requestId } from './middleware/requestId.js';
import { timeoutMiddleware } from './middleware/timeoutMiddleware.js';

const app = express();

// Trust proxy for Railway/Load Balancers to get correct IP
app.set('trust proxy', 1);

app.use(requestId);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes with specific rate limiting
app.use('/auth', rateLimiter.authLimiter, timeoutMiddleware(10000), authRoutes);
app.use('/sync', rateLimiter.syncLimiter, timeoutMiddleware(15000), syncRoutes);

// Routes with default rate limiting
app.use(
  '/habits',
  rateLimiter.defaultLimiter,
  timeoutMiddleware(20000),
  habitRoutes,
);
app.use(
  '/user',
  rateLimiter.defaultLimiter,
  timeoutMiddleware(20000),
  userRoutes,
);
app.use(
  '/suggestions',
  rateLimiter.defaultLimiter,
  timeoutMiddleware(20000),
  suggestionRoutes,
);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
