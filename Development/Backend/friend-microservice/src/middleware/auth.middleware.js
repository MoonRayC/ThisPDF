const JWTService = require('../services/jwt.service');
const { FriendRequest, Friendship, BlockedUser } = require('../models/friend.model');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants.util');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    const user = await JWTService.validateAndGetUser(authHeader);
    req.userId = user.id;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.message === 'Invalid token') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.INVALID_TOKEN
      });
    }
    
    if (error.message === 'Auth service unavailable') {
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        error: ERROR_MESSAGES.AUTH_SERVICE_UNAVAILABLE
      });
    }
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const user = await JWTService.validateAndGetUser(authHeader);
      req.userId = user.id;
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

const checkUserAccess = (req, res, next) => {
  const targetUserId = req.params.user_id;
  const currentUserId = req.userId;
  
  if (targetUserId && targetUserId !== currentUserId) {
    req.isPublicAccess = true;
  } else {
    req.isPublicAccess = false;
  }
  
  next();
};

const checkBlocked = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    let targetUserId;
    
    if (req.body.recipient_id) {
      targetUserId = req.body.recipient_id;
    } else if (req.body.user_id) {
      targetUserId = req.body.user_id;
    } else if (req.params.user_id) {
      targetUserId = req.params.user_id;
    }
    
    if (!targetUserId || currentUserId === targetUserId) {
      return next();
    }
    
    const blockExists = await BlockedUser.findOne({
      $or: [
        { blocker_id: currentUserId, blocked_id: targetUserId },
        { blocker_id: targetUserId, blocked_id: currentUserId }
      ]
    });
    
    if (blockExists) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.USER_BLOCKED
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

const preventSelfAction = (targetKey) => {
  return (req, res, next) => {
    const currentUserId = req.userId;
    const body = req.body || {};

    let targetUserId;

    if (targetKey) {
      targetUserId = body[targetKey];
    } else {
      targetUserId = body.recipient_id || body.user_id;
    }

    if (targetUserId && currentUserId === targetUserId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.CANNOT_FRIEND_SELF
      });
    }

    next();
  };
};

const validateFriendRequest = async (req, res, next) => {
  try {
    const requestId = req.body.request_id;
    const currentUserId = req.userId;
    
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: ERROR_MESSAGES.FRIEND_REQUEST_NOT_FOUND
      });
    }
    
    if (friendRequest.requester_id !== currentUserId && 
        friendRequest.recipient_id !== currentUserId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }
    
    req.friendRequest = friendRequest;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  checkUserAccess,
  checkBlocked,
  preventSelfAction,
  validateFriendRequest
};