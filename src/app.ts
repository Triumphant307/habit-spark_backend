import { env } from './config/env.js';
import express from 'express';
import cors from 'cors';
import habitRoutes from './routes/habitRoutes.js';
import authRoutes from './routes/authRoutes.js';
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

// Routes
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
