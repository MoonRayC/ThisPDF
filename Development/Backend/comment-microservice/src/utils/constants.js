// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'Authentication required',
  INVALID_TOKEN: 'Invalid token provided',
  TOKEN_EXPIRED: 'Token has expired',
  FORBIDDEN: 'Access denied',

  // Validation errors
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD: 'Required field is missing',
  INVALID_FORMAT: 'Invalid format',
  INVALID_LENGTH: 'Invalid length',

  // Comment errors
  COMMENT_NOT_FOUND: 'Comment not found',
  COMMENT_ALREADY_DELETED: 'Comment is already deleted',
  CANNOT_EDIT_COMMENT: 'Cannot edit this comment',
  CANNOT_DELETE_COMMENT: 'Cannot delete this comment',
  INVALID_PARENT_COMMENT: 'Invalid parent comment',

  // File errors
  FILE_NOT_FOUND: 'File not found',
  INVALID_FILE_ID: 'Invalid file ID',

  // User errors
  USER_NOT_FOUND: 'User not found',
  INVALID_USER_ID: 'Invalid user ID',

  // Reaction errors
  ALREADY_REACTED: 'User has already reacted to this comment',
  NO_REACTION_FOUND: 'No reaction found for this user',

  // Server errors
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  EXTERNAL_SERVICE_ERROR: 'External service error'
};

// Success Messages
const SUCCESS_MESSAGES = {
  COMMENT_CREATED: 'Comment created successfully',
  COMMENT_UPDATED: 'Comment updated successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
  REACTION_ADDED: 'Reaction added successfully',
  REACTION_REMOVED: 'Reaction removed successfully',
  REACTION_UPDATED: 'Reaction updated successfully'
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  REPLIES_DEFAULT_LIMIT: 5,
  REPLIES_MAX_LIMIT: 50
};

// Comment constraints
const COMMENT_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
  MAX_REPLY_DEPTH: 3 // How deep nested replies can go
};

// Reaction types
const REACTION_TYPES = {
  LIKE: 'like',
  DISLIKE: 'dislike'
};

// MongoDB connection states
const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

// Rate limiting
const RATE_LIMITS = {
  COMMENTS_PER_MINUTE: 10,
  REACTIONS_PER_MINUTE: 30,
  WINDOW_MS: 60 * 1000 // 1 minute
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  USER_DATA: 300, // 5 minutes
  COMMENT_STATS: 180, // 3 minutes
  FILE_COMMENTS: 60 // 1 minute
};

// API versions
const API_VERSION = {
  V1: 'v1',
  CURRENT: 'v1'
};

// Environment types
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly'
};

// Request headers
const HEADERS = {
  AUTHORIZATION: 'authorization',
  CONTENT_TYPE: 'content-type',
  USER_AGENT: 'user-agent',
  X_FORWARDED_FOR: 'x-forwarded-for',
  X_REAL_IP: 'x-real-ip'
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  COMMENT_CONSTRAINTS,
  REACTION_TYPES,
  CONNECTION_STATES,
  RATE_LIMITS,
  CACHE_TTL,
  API_VERSION,
  ENVIRONMENTS,
  LOG_LEVELS,
  HEADERS
};