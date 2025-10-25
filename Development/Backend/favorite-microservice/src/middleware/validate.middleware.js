const { HTTP_STATUS, ERROR_MESSAGES, VALIDATION_PATTERNS, TARGET_TYPES } = require('../utils/constants');

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  return VALIDATION_PATTERNS.UUID.test(uuid);
};

/**
 * Validate target type
 * @param {string} targetType - Target type to validate
 * @returns {boolean} True if valid target type
 */
const isValidTargetType = (targetType) => {
  return Object.values(TARGET_TYPES).includes(targetType);
};

/**
 * Middleware to validate UUID parameters
 * @param {string} paramName - Name of the parameter to validate
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    
    if (!uuid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: `${paramName} is required`
      });
    }

    if (!isValidUUID(uuid)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_UUID,
        message: `${paramName} must be a valid UUID`
      });
    }

    next();
  };
};

/**
 * Middleware to validate target type parameter
 */
const validateTargetType = (req, res, next) => {
  const targetType = req.params.targetType;
  
  if (!targetType) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Target type is required'
    });
  }

  if (!isValidTargetType(targetType)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_TARGET_TYPE,
      message: `Target type must be one of: ${Object.values(TARGET_TYPES).join(', ')}`
    });
  }

  next();
};

/**
 * Middleware to validate PDF ID parameter
 */
const validatePdfId = validateUUID('pdfId');

/**
 * Middleware to validate user ID parameter
 */
const validateUserId = validateUUID('userId');

/**
 * Middleware to validate target user ID parameter
 */
const validateTargetUserId = validateUUID('targetUserId');

/**
 * Middleware to validate query parameters
 */
const validateQuery = (req, res, next) => {
  const { page, limit, sortBy, order } = req.query;

  // Validate page number
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Page must be a positive integer'
    });
  }

  // Validate limit
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Limit must be between 1 and 100'
    });
  }

  // Validate sort order
  if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Order must be "asc" or "desc"'
    });
  }

  next();
};

module.exports = {
  validateUUID,
  validateTargetType,
  validatePdfId,
  validateUserId,
  validateTargetUserId,
  validateQuery,
  isValidUUID,
  isValidTargetType
};