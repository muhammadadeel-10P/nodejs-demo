const multer = require('multer');
const logger = require('../config/logger');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already in use` });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
  }

  return res.status(statusCode).json({ message: err.message || 'Internal server error' });
}

module.exports = { ApiError, notFound, errorHandler };
