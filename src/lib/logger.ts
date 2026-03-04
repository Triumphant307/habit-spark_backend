import pino from 'pino';
import { env } from '../config/env.js';

const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

export default logger;
