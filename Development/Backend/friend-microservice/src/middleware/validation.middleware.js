const Joi = require('joi');

// UUID validation pattern
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Validation schemas
const schemas = {
  friendRequest: Joi.object({
    recipient_id: Joi.string().pattern(uuidPattern).required().messages({
      'string.pattern.base': 'recipient_id must be a valid UUID',
      'any.required': 'recipient_id is required'
    }),
    message: Joi.string().max(500).optional().allow('').messages({
      'string.max': 'Message cannot exceed 500 characters'
    })
  }),

  friendAction: Joi.object({
    user_id: Joi.string().pattern(uuidPattern).required().messages({
      'string.pattern.base': 'user_id must be a valid UUID',
      'any.required': 'user_id is required'
    })
  }),

  blockAction: Joi.object({
    user_id: Joi.string().pattern(uuidPattern).required().messages({
      'string.pattern.base': 'user_id must be a valid UUID',
      'any.required': 'user_id is required'
    }),
    reason: Joi.string().max(500).optional().allow('').messages({
      'string.max': 'Reason cannot exceed 500 characters'
    })
  }),

  uuidParam: Joi.object({
    user_id: Joi.string().pattern(uuidPattern).required().messages({
      'string.pattern.base': 'user_id must be a valid UUID',
      'any.required': 'user_id is required'
    })
  })
};

// Validation middleware factory
const validateSchema = (schema, source = 'body') => {
  return (req, res, next) => {
    let data;
    
    switch (source) {
      case 'body':
        data = req.body;
        break;
      case 'params':
        data = req.params;
        break;
      case 'query':
        data = req.query;
        break;
      default:
        data = req.body;
    }

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: errorMessage
      });
    }

    // Replace the original data with validated data
    switch (source) {
      case 'body':
        req.body = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'query':
        req.query = value;
        break;
    }

    next();
  };
};

// Specific validation middleware functions
const validateFriendRequest = validateSchema(schemas.friendRequest, 'body');
const validateFriendAction = validateSchema(schemas.friendAction, 'body');
const validateBlockAction = validateSchema(schemas.blockAction, 'body');
const validateUuidParam = validateSchema(schemas.uuidParam, 'params');

// Custom validation for checking if user is trying to friend themselves
const validateNotSelfAction = (req, res, next) => {
  const currentUserId = req.user.id;
  const targetUserId = req.body.user_id || req.body.recipient_id;

  if (currentUserId === targetUserId) {
    return res.status(400).json({
      error: 'Cannot perform this action on yourself'
    });
  }

  next();
};

// Validation for friend list access
const validateFriendListAccess = (req, res, next) => {
  const requestedUserId = req.params.user_id;
  const currentUserId = req.user?.id;

  // Store both IDs for use in controller
  req.requestedUserId = requestedUserId;
  req.currentUserId = currentUserId;
  req.isOwnProfile = currentUserId === requestedUserId;

  next();
};

module.exports = {
  validateFriendRequest,
  validateFriendAction,
  validateBlockAction,
  validateUuidParam,
  validateNotSelfAction,
  validateFriendListAccess,
  schemas
};