const authService = require('../services/auth.service');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Middleware to authenticate JWT tokens
 * Adds user information to req.user if authentication is successful
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED,
        message: 'Access token required'
      });
    }

    // Validate token with auth service
    const user = await authService.getUserFromToken(token);
    
    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user information to req.user if token is present and valid
 * Does not fail if no token is provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await authService.getUserFromToken(token);
        req.user = user;
      } catch (error) {
        // Log error but don't fail the request
        console.warn('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};