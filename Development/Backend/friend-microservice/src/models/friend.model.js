const mongoose = require('mongoose');
const { FRIEND_REQUEST_STATUS, FRIENDSHIP_STATUS, ACTIVITY_TYPE } = require('../utils/constants.util');

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema({
  requester_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  recipient_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  status: {
    type: String,
    enum: Object.values(FRIEND_REQUEST_STATUS),
    default: FRIEND_REQUEST_STATUS.PENDING
  },
  message: {
    type: String,
    maxlength: 500,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'friend_requests'
});

// Friendship Schema
const friendshipSchema = new mongoose.Schema({
  user1_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  user2_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  status: {
    type: String,
    enum: Object.values(FRIENDSHIP_STATUS),
    default: FRIENDSHIP_STATUS.ACCEPTED
  },
  action_user_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'friends'
});

// Blocked Users Schema
const blockedUserSchema = new mongoose.Schema({
  blocker_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  blocked_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  reason: {
    type: String,
    maxlength: 500,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'blocked_users'
});

// Friendship Activity Schema
const friendshipActivitySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  friend_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  activity_type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPE),
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'friendship_activity'
});

// Indexes for better query performance
friendRequestSchema.index({ requester_id: 1, recipient_id: 1 }, { unique: true });
friendRequestSchema.index({ recipient_id: 1, status: 1 });
friendRequestSchema.index({ requester_id: 1, status: 1 });
friendRequestSchema.index({ created_at: -1 });

friendshipSchema.index({ user1_id: 1, user2_id: 1 }, { unique: true });
friendshipSchema.index({ user1_id: 1, status: 1 });
friendshipSchema.index({ user2_id: 1, status: 1 });

blockedUserSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });
blockedUserSchema.index({ blocker_id: 1 });
blockedUserSchema.index({ blocked_id: 1 });

friendshipActivitySchema.index({ user_id: 1, created_at: -1 });
friendshipActivitySchema.index({ friend_id: 1, created_at: -1 });
friendshipActivitySchema.index({ activity_type: 1, created_at: -1 });

// Middleware to update updated_at on save
friendRequestSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

friendshipSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Models
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Friendship = mongoose.model('Friendship', friendshipSchema);
const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema);
const FriendshipActivity = mongoose.model('FriendshipActivity', friendshipActivitySchema);

module.exports = {
  FriendRequest,
  Friendship,
  BlockedUser,
  FriendshipActivity
};