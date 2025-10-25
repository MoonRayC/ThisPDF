const JWTService = require('../services/jwt.service');
const ProfileModel = require('../models/profile.model');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = JWTService.extractTokenFromHeader(authHeader);
    
    const userData = await JWTService.getUserFromAuthService(token);
    
    req.user = userData;
    next();
  } catch (error) {
    return res.status(401).json({
      error: error.message
    });
  }
};

const checkProfileOwnership = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const authenticatedUserId = req.user.id;

    if (user_id !== authenticatedUserId) {
      return res.status(403).json({
        error: 'Access denied. You can only access your own profile.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

const checkProfileExists = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    const profile = await ProfileModel.findByUserId(user_id);
    if (!profile) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    req.profile = profile;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

const validateDeleteConfirmation = (req, res, next) => {
  try {
    const { confirmation_text } = req.body;
    const profile = req.profile;
    
    const expectedConfirmation = `DELETE: ${profile.username}`;
    
    if (confirmation_text !== expectedConfirmation) {
      return res.status(400).json({
        error: `Invalid confirmation. Please type exactly: ${expectedConfirmation}`
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

const updateLastActiveMiddleware = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      ProfileModel.updateLastActive(req.user.id).catch(err => {
        console.error('Error updating last active timestamp:', err);
      });
    }
    next();
  } catch (error) {
    console.error('Error in updateLastActiveMiddleware:', error);
    next();
  }
};

module.exports = {
  authenticateToken,
  checkProfileOwnership,
  checkProfileExists,
  validateDeleteConfirmation,
  updateLastActiveMiddleware
};