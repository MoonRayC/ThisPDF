class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class SearchError extends AppError {
  constructor(message = 'Search operation failed') {
    super(message, 500);
  }
}

class IndexError extends AppError {
  constructor(message = 'Index operation failed') {
    super(message, 500);
  }
}

// Handle MeiliSearch specific errors
const handleMeiliSearchError = (error) => {
  
  if (error.code === 'index_not_found') {
    return new NotFoundError('Search index not found');
  }
  
  if (error.code === 'invalid_request') {
    return new ValidationError('Invalid search request');
  }
  
  if (error.code === 'document_not_found') {
    return new NotFoundError('Document not found');
  }
  
  if (error.code === 'invalid_api_key') {
    return new AppError('Search service authentication failed', 503);
  }
  
  return new SearchError('Search service error');
};

// Handle validation errors
const handleValidationError = (error) => {
  if (error.isJoi) {
    const message = error.details.map(detail => detail.message).join(', ');
    return new ValidationError(message);
  }
  return error;
};

// Send error response
const sendErrorResponse = (err, res) => {
  const { statusCode = 500, message, stack } = err;
  
  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        stack,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Production error response
  if (err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Generic error for non-operational errors
  return res.status(500).json({
    success: false,
    error: {
      message: 'Something went wrong',
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  });
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Handle different types of errors
  if (err.name === 'MeiliSearchError' || err.code) {
    error = handleMeiliSearchError(err);
  } else if (err.isJoi) {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = new ValidationError('Invalid ID format');
  } else if (err.code === 11000) {
    error = new ValidationError('Duplicate field value');
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }
  
  sendErrorResponse(error, res);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  NotFoundError,
  SearchError,
  IndexError
};