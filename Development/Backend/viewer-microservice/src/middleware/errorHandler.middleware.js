const config = require('../config');

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.message.includes('File not found')) {
    statusCode = 404;
    message = 'File not found';
  } else if (err.message.includes('Auth service error: 401')) {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.message.includes('timeout') || err.message.includes('unavailable')) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }

  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv === 'development' && { details: err.message })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};