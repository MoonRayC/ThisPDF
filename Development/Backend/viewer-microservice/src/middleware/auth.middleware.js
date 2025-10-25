const JWTUtil = require('../utils/jwt.util');
const AuthService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;

    const token = JWTUtil.extractFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    const user = await AuthService.getUserFromToken(token);

    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error.message);
    return res.status(401).json({
      error: 'Invalid authentication token',
      message: error.message
    });
  }
};

module.exports = authMiddleware;
