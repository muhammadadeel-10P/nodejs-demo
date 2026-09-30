const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

async function connectDB(uri = env.mongoUri) {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected', { host: mongoose.connection.host });
  });
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
