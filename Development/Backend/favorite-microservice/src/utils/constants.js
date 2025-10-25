const TARGET_TYPES = {
  PDF: 'pdf',
  USER: 'user'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_TOKEN: 'Invalid token',
  ALREADY_FAVORITED: 'Already favorited',
  NOT_FOUND: 'Not found',
  FAVORITE_NOT_FOUND: 'Favorite not found',
  INVALID_TARGET_TYPE: 'Invalid target type',
  INVALID_UUID: 'Invalid UUID format',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error'
};

const VALIDATION_PATTERNS = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

module.exports = {
  TARGET_TYPES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  VALIDATION_PATTERNS
};