const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack);

  let error = {
    message: err.message || 'Internal server error',
    status: err.statusCode || 500
  };

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.status = 409;
        error.message = 'Resource already exists';
        break;
      case '23503': // Foreign key violation
        error.status = 400;
        error.message = 'Invalid reference';
        break;
      case '23502': // Not null violation
        error.status = 400;
        error.message = 'Required field missing';
        break;
      case '22001': // String data too long
        error.status = 400;
        error.message = 'Data too long';
        break;
      default:
        error.status = 500;
        error.message = 'Database error';
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 422;
    error.message = 'Validation failed';
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};