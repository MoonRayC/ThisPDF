const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants.util');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    status = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.name === 'CastError') {
    // MongoDB cast error (invalid ObjectId, etc.)
    status = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid data format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    status = HTTP_STATUS.CONFLICT;
    message = 'Duplicate entry';
    
    // More specific messages for known duplicates
    if (err.keyPattern) {
      if (err.keyPattern.requester_id && err.keyPattern.recipient_id) {
        message = ERROR_MESSAGES.FRIEND_REQUEST_EXISTS;
      } else if (err.keyPattern.user1_id && err.keyPattern.user2_id) {
        message = ERROR_MESSAGES.FRIENDSHIP_EXISTS;
      } else if (err.keyPattern.blocker_id && err.keyPattern.blocked_id) {
        message = 'User is already blocked';
      }
    }
  } else if (err.name === 'JsonWebTokenError') {
    // JWT errors
    status = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    status = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  } else if (err.message === 'Invalid token') {
    // Custom token validation error
    status = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  } else if (err.message === 'Auth service unavailable') {
    // Auth service connection error
    status = HTTP_STATUS.SERVICE_UNAVAILABLE;
    message = ERROR_MESSAGES.AUTH_SERVICE_UNAVAILABLE;
  } else if (err.message.includes('Invalid UUID')) {
    // UUID validation error
    status = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.INVALID_UUID;
  } else if (err.statusCode) {
    // Custom status code
    status = err.statusCode;
    message = err.message;
  } else if (err.message) {
    // Use the error message if it's a known error
    const knownErrors = Object.values(ERROR_MESSAGES);
    if (knownErrors.includes(err.message)) {
      if (err.message === ERROR_MESSAGES.INVALID_TOKEN || 
          err.message === ERROR_MESSAGES.UNAUTHORIZED) {
        status = HTTP_STATUS.UNAUTHORIZED;
      } else if (err.message === ERROR_MESSAGES.USER_NOT_FOUND ||
                 err.message === ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND ||
                 err.message === ERROR_MESSAGES.FRIENDSHIP_NOT_FOUND) {
        status = HTTP_STATUS.NOT_FOUND;
      } else if (err.message === ERROR_MESSAGES.FRIEND_REQUEST_EXISTS ||
                 err.message === ERROR_MESSAGES.FRIENDSHIP_EXISTS ||
                 err.message === ERROR_MESSAGES.ALREADY_FRIENDS) {
        status = HTTP_STATUS.CONFLICT;
      } else if (err.message === ERROR_MESSAGES.CANNOT_FRIEND_SELF ||
                 err.message === ERROR_MESSAGES.USER_BLOCKED) {
        status = HTTP_STATUS.BAD_REQUEST;
      }
      message = err.message;
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    message = 'Something went wrong';
  }

  res.status(status).json({
    error: message
  });
};

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};