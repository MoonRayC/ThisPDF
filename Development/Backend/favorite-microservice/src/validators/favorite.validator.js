const Joi = require('joi');
const { TARGET_TYPES } = require('../utils/constants');

// UUID v4 pattern
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Base schemas
const schemas = {
  uuid: Joi.string().pattern(uuidPattern).required().messages({
    'string.pattern.base': 'Must be a valid UUID v4',
    'any.required': 'This field is required'
  }),

  targetType: Joi.string().valid(...Object.values(TARGET_TYPES)).required().messages({
    'any.only': `Must be one of: ${Object.values(TARGET_TYPES).join(', ')}`,
    'any.required': 'Target type is required'
  }),

  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'target_id').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Parameter validation schemas
const paramSchemas = {
  pdfId: Joi.object({
    pdfId: schemas.uuid
  }),

  targetUserId: Joi.object({
    targetUserId: schemas.uuid
  }),

  userId: Joi.object({
    userId: schemas.uuid
  }),

  targetTypeAndId: Joi.object({
    targetType: schemas.targetType,
    targetId: schemas.uuid
  })
};

// Request body validation schemas
const bodySchemas = {
  createFavorite: Joi.object({
    target_type: schemas.targetType,
    target_id: schemas.uuid
  }),

  updateFavorite: Joi.object({
    target_type: schemas.targetType.optional(),
    target_id: schemas.uuid.optional()
  }).min(1)
};

/**
 * Middleware factory for validating request parameters
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware function
 */
const validateParams = (schemaName) => {
  return (req, res, next) => {
    const schema = paramSchemas[schemaName];
    if (!schema) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid schema: ${schemaName}`
      });
    }

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    next();
  };
};

/**
 * Middleware factory for validating request body
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware function
 */
const validateBody = (schemaName) => {
  return (req, res, next) => {
    const schema = bodySchemas[schemaName];
    if (!schema) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid schema: ${schemaName}`
      });
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Middleware for validating query parameters
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Express middleware function
 */
const validateQuery = (schemaName = 'paginationQuery') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid schema: ${schemaName}`
      });
    }

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validateParams,
  validateBody,
  validateQuery,
  schemas,
  paramSchemas,
  bodySchemas
};