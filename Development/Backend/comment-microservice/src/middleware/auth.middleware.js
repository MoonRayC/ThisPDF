const authService = require('../services/auth.service');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7); 
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with auth service
    const userData = await authService.verifyToken(token);
    
    if (!userData) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user data to request object
    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const userData = await authService.verifyToken(token);
    req.user = userData;
    
    next();
  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};