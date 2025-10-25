// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// File Visibility Types
const FILE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

// Service Names
const SERVICES = {
  AUTH: 'auth',
  METADATA: 'metadata',
  UPLOAD: 'upload',
  FRIEND: 'friend',
  VIEWER: 'viewer'
};

// API Endpoints
const ENDPOINTS = {
  AUTH: {
    USER: '/api/auth/user'
  },
  METADATA: {
    FILE: '/api/metadata'
  },
  UPLOAD: {
    FILE_URL: '/api/upload/files'
  },
  FRIEND: {
    LIST: '/api/friends/list'
  },
  VIEWER: {
    FILE: '/api/viewer',
    HEALTH: '/api/health'
  }
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication Errors
  INVALID_TOKEN: 'Invalid authentication token',
  TOKEN_MISSING: 'Authentication token is required',
  TOKEN_EXPIRED: 'Authentication token has expired',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  
  // File Access Errors
  FILE_NOT_FOUND: 'File not found',
  ACCESS_DENIED: 'Access denied',
  NO_PERMISSION: 'You do not have permission to view this file',
  INVALID_FILE_ID: 'Invalid file ID format',
  
  // Service Errors
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  SERVICE_TIMEOUT: 'Service request timeout',
  INTERNAL_ERROR: 'Internal server error',
  
  // Validation Errors
  VALIDATION_ERROR: 'Validation error',
  INVALID_UUID: 'Invalid UUID format',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  
  // General
  ENDPOINT_NOT_FOUND: 'Endpoint not found',
  METHOD_NOT_ALLOWED: 'Method not allowed'
};

// Success Messages
const SUCCESS_MESSAGES = {
  FILE_RETRIEVED: 'File retrieved successfully',
  HEALTH_CHECK: 'Service is healthy',
  REQUEST_PROCESSED: 'Request processed successfully'
};

// Request Timeouts (in milliseconds)
const TIMEOUTS = {
  SERVICE_REQUEST: 5000,
  DATABASE_QUERY: 10000,
  EXTERNAL_API: 8000
};

// Rate Limiting
const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false
};

// JWT Configuration
const JWT = {
  ALGORITHM: 'HS256',
  ISSUER: 'viewer-service',
  AUDIENCE: 'viewer-client'
};

// File Constraints
const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 50,
  SUPPORTED_TYPES: ['application/pdf'],
  MAX_FILENAME_LENGTH: 255
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Service Health Check
const HEALTH_CHECK = {
  STATUS: {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    DEGRADED: 'degraded'
  },
  CHECK_INTERVAL: 30000 // 30 seconds
};

// CORS Settings
const CORS = {
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  CREDENTIALS: true
};

// Security Headers
const SECURITY = {
  CONTENT_SECURITY_POLICY: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'"],
    IMG_SRC: ["'self'", "data:", "https:"],
    CONNECT_SRC: ["'self'", "https:"],
    FONT_SRC: ["'self'"],
    OBJECT_SRC: ["'none'"],
    MEDIA_SRC: ["'self'"],
    FRAME_SRC: ["'none'"]
  }
};

// Logging Levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace'
};

// Environment Types
const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging'
};

// Regular Expressions
const REGEX = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  JWT_TOKEN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};

// Cache Settings
const CACHE = {
  TTL: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 1800,    // 30 minutes
    LONG: 3600,      // 1 hour
    VERY_LONG: 86400 // 24 hours
  }
};

// Export all constants
module.exports = {
  HTTP_STATUS,
  FILE_VISIBILITY,
  SERVICES,
  ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TIMEOUTS,
  RATE_LIMITS,
  JWT,
  FILE_CONSTRAINTS,
  PAGINATION,
  HEALTH_CHECK,
  CORS,
  SECURITY,
  LOG_LEVELS,
  ENVIRONMENTS,
  REGEX,
  CACHE
};