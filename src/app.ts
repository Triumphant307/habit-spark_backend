import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
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

app.use(requestId);

app.use(
  cors({
    origin: env.FRONTEND_URL,
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
