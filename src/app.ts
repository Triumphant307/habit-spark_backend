import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import habitRoutes from './routes/habitRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { requestId } from './middleware/requestId.js';

const app = express();

// Trust proxy for Railway/Load Balancers to get correct IP
app.set('trust proxy', 1);

app.use(requestId);

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Stricter limit for auth: 20 requests per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      'Too many authentication attempts, please try again after 15 minutes',
  },
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply rate limiting
app.use('/auth', authLimiter);
app.use(apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);
app.use('/user', userRoutes);
app.use('/suggestions', suggestionRoutes);
app.use('/sync', syncRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
