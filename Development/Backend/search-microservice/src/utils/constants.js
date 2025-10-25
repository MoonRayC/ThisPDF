// Search service constants

// Index configuration
const INDEX_NAME = 'pdf_metadata';
const MAX_SEARCH_RESULTS = 100;
const DEFAULT_SEARCH_LIMIT = 20;
const MAX_BULK_SIZE = 100;

// Validation constants
const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TAG_LENGTH = 50;
const MAX_CATEGORY_LENGTH = 100;
const MAX_QUERY_LENGTH = 200;
const MAX_TAGS_STRING_LENGTH = 500;

// Visibility options
const VISIBILITY_OPTIONS = ['public', 'private'];

// Search filters
const VALID_SORT_FIELDS = ['title', 'category', 'created_at', 'updated_at'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

// Error messages
const ERROR_MESSAGES = {
  INVALID_FILE_ID: 'Invalid file ID provided',
  DOCUMENT_NOT_FOUND: 'Document not found',
  INVALID_SEARCH_QUERY: 'Invalid search query',
  SEARCH_SERVICE_ERROR: 'Search service error',
  INDEX_ERROR: 'Index operation failed',
  VALIDATION_ERROR: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
};

// Success messages
const SUCCESS_MESSAGES = {
  DOCUMENT_INDEXED: 'Document indexed successfully',
  DOCUMENT_UPDATED: 'Document updated successfully',
  DOCUMENT_DELETED: 'Document deleted successfully',
  BULK_INDEXED: 'Documents bulk indexed successfully',
  SEARCH_COMPLETED: 'Search completed successfully'
};

// HTTP Status codes
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
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Rate limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // requests per window
  SEARCH_MAX_REQUESTS: 200 // higher limit for search endpoints
};

// Cache settings
const CACHE_SETTINGS = {
  SEARCH_RESULTS_TTL: 300, // 5 minutes
  STATS_TTL: 600, // 10 minutes
  SUGGESTIONS_TTL: 300 // 5 minutes
};

// MeiliSearch specific
const MEILI_SETTINGS = {
  MAX_TOTAL_HITS: 1000,
  TYPO_TOLERANCE: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 5,
      twoTypos: 9
    }
  },
  CROP_LENGTH: 200,
  HIGHLIGHT_PRE_TAG: '<mark>',
  HIGHLIGHT_POST_TAG: '</mark>'
};

module.exports = {
  INDEX_NAME,
  MAX_SEARCH_RESULTS,
  DEFAULT_SEARCH_LIMIT,
  MAX_BULK_SIZE,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAG_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_QUERY_LENGTH,
  MAX_TAGS_STRING_LENGTH,
  VISIBILITY_OPTIONS,
  VALID_SORT_FIELDS,
  VALID_SORT_ORDERS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  RATE_LIMIT,
  CACHE_SETTINGS,
  MEILI_SETTINGS
};