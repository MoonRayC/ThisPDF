const authService = require('../services/auth.service');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const user = await authService.validateToken(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const user = await authService.validateToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    console.log('Optional auth failed, continuing without user context');
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};