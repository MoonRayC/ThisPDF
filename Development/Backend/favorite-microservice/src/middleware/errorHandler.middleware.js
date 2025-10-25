const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Global error handler middleware
 * Catches all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: ERROR_MESSAGES.ALREADY_FAVORITED,
      message: 'Resource already exists'
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_UUID,
      message: 'Invalid ID format'
    });
  }

  // Custom application errors
  if (err.message === 'Already favorited') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: ERROR_MESSAGES.ALREADY_FAVORITED,
      message: err.message
    });
  }

  if (err.message === 'Not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: ERROR_MESSAGES.NOT_FOUND,
      message: err.message
    });
  }

  if (err.message && err.message.includes('Authentication failed')) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.UNAUTHORIZED,
      message: 'Authentication failed'
    });
  }

  // Default server error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.SERVER_ERROR,
    message: 'Something went wrong'
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: ERROR_MESSAGES.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};