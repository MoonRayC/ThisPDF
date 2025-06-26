// Friend request statuses
const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Friendship statuses
const FRIENDSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  BLOCKED: 'blocked'
};

// Activity types for friendship tracking
const ACTIVITY_TYPE = {
  REQUEST_SENT: 'request_sent',
  REQUEST_ACCEPTED: 'request_accepted',
  REQUEST_REJECTED: 'request_rejected',
  REQUEST_CANCELLED: 'request_cancelled',
  UNFRIENDED: 'unfriended',
  BLOCKED: 'blocked',
  UNBLOCKED: 'unblocked'
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  USER_NOT_FOUND: 'User not found',
  FRIEND_REQUEST_EXISTS: 'Friend request already exists',
  FRIEND_REQUEST_NOT_FOUND: 'Friend request not found',
  FRIENDSHIP_EXISTS: 'Friendship already exists',
  FRIENDSHIP_NOT_FOUND: 'Friendship not found',
  CANNOT_FRIEND_SELF: 'Cannot send friend request to yourself',
  USER_BLOCKED: 'User is blocked',
  ALREADY_FRIENDS: 'Users are already friends',
  INVALID_UUID: 'Invalid UUID format',
  DATABASE_ERROR: 'Database operation failed',
  AUTH_SERVICE_UNAVAILABLE: 'Auth service unavailable'
};

// HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  FRIEND_REQUEST_STATUS,
  FRIENDSHIP_STATUS,
  ACTIVITY_TYPE,
  ERROR_MESSAGES,
  HTTP_STATUS
};