const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_INPUT,
      details: messages,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: `Duplicate value for field: ${field}`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_FORMAT,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
    });
  }

  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: err.message || ERROR_MESSAGES.INTERNAL_ERROR,
  });
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
