const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');

async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`, { env: env.nodeEnv });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
