import { env } from './config/env.js';
import app from './app.js';
import logger from './lib/logger.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});
