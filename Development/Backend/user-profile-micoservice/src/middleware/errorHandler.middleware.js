const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err.code) {
    switch (err.code) {
      case '23505': 
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists'
        });
      
      case '23503': 
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist'
        });
      
      case '23514': 
        return res.status(400).json({
          error: 'Invalid data',
          message: 'Data does not meet requirements'
        });
      
      case '42P01': 
        return res.status(500).json({
          error: 'Database error',
          message: 'Database table not found'
        });
      
      case 'ECONNREFUSED':
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Database connection failed'
        });
    }
  }

  if (err.message === 'Profile already exists for this user') {
    return res.status(409).json({
      error: err.message
    });
  }

  if (err.message === 'Username already taken') {
    return res.status(409).json({
      error: err.message
    });
  }

  if (err.message === 'Invalid token' || err.message === 'No valid authorization header') {
    return res.status(401).json({
      error: err.message
    });
  }

  if (err.message === 'Auth service unavailable') {
    return res.status(503).json({
      error: 'Authentication service temporarily unavailable'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details || err.message
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
};

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