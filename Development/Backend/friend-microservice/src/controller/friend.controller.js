const { FriendRequest, Friendship, BlockedUser, FriendshipActivity } = require('../models/friend.model');
const { FriendRecommendation } = require('../models/recommendation.model');
const { 
  HTTP_STATUS, 
  ERROR_MESSAGES, 
  FRIEND_REQUEST_STATUS, 
  FRIENDSHIP_STATUS, 
  ACTIVITY_TYPE 
} = require('../utils/constants.util');

class FriendController {
  /**
   * Send a friend request
   */
  static async sendFriendRequest(req, res, next) {
    try {
      const { recipient_id, message } = req.body;
      const requester_id = req.userId;

      // Check if friend request already exists
      const existingRequest = await FriendRequest.findOne({
        $or: [
          { requester_id, recipient_id },
          { requester_id: recipient_id, recipient_id: requester_id }
        ]
      });

      if (existingRequest) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: ERROR_MESSAGES.FRIEND_REQUEST_EXISTS
        });
      }

      // Check if they're already friends
      const existingFriendship = await Friendship.findOne({
        $or: [
          { user1_id: requester_id, user2_id: recipient_id },
          { user1_id: recipient_id, user2_id: requester_id }
        ],
        status: FRIENDSHIP_STATUS.ACCEPTED
      });

      if (existingFriendship) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: ERROR_MESSAGES.ALREADY_FRIENDS
        });
      }

      // Create friend request
      const friendRequest = new FriendRequest({
        requester_id,
        recipient_id,
        message: message || '',
        status: FRIEND_REQUEST_STATUS.PENDING
      });

      await friendRequest.save();

      // Log activity
      await FriendshipActivity.create({
        user_id: requester_id,
        friend_id: recipient_id,
        activity_type: ACTIVITY_TYPE.REQUEST_SENT,
        metadata: { message: message || '' }
      });

      res.status(HTTP_STATUS.CREATED).json({
        message: 'Friend request sent successfully',
        request: friendRequest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(req, res, next) {
    try {
      const friendRequest = req.friendRequest;
      const currentUserId = req.userId;

      // Only recipient can accept
      if (friendRequest.recipient_id !== currentUserId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: ERROR_MESSAGES.UNAUTHORIZED
        });
      }

      // Check if request is still pending
      if (friendRequest.status !== FRIEND_REQUEST_STATUS.PENDING) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Friend request is no longer pending'
        });
      }

      // Update friend request status
      friendRequest.status = FRIEND_REQUEST_STATUS.ACCEPTED;
      await friendRequest.save();

      // Create friendship
      const friendship = new Friendship({
        user1_id: friendRequest.requester_id,
        user2_id: friendRequest.recipient_id,
        status: FRIENDSHIP_STATUS.ACCEPTED,
        action_user_id: currentUserId
      });

      await friendship.save();

      // Log activity for both users
      await Promise.all([
        FriendshipActivity.create({
          user_id: currentUserId,
          friend_id: friendRequest.requester_id,
          activity_type: ACTIVITY_TYPE.REQUEST_ACCEPTED,
          metadata: { request_id: friendRequest._id.toString() }
        }),
        FriendshipActivity.create({
          user_id: friendRequest.requester_id,
          friend_id: currentUserId,
          activity_type: ACTIVITY_TYPE.REQUEST_ACCEPTED,
          metadata: { request_id: friendRequest._id.toString() }
        })
      ]);

      res.status(HTTP_STATUS.OK).json({
        message: 'Friend request accepted successfully',
        friendship
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject a friend request
   */
  static async rejectFriendRequest(req, res, next) {
    try {
      const friendRequest = req.friendRequest;
      const currentUserId = req.userId;

      // Only recipient can reject
      if (friendRequest.recipient_id !== currentUserId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: ERROR_MESSAGES.UNAUTHORIZED
        });
      }

      // Check if request is still pending
      if (friendRequest.status !== FRIEND_REQUEST_STATUS.PENDING) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Friend request is no longer pending'
        });
      }

      // Update friend request status
      friendRequest.status = FRIEND_REQUEST_STATUS.REJECTED;
      await friendRequest.save();

      // Log activity
      await FriendshipActivity.create({
        user_id: currentUserId,
        friend_id: friendRequest.requester_id,
        activity_type: ACTIVITY_TYPE.REQUEST_REJECTED,
        metadata: { request_id: friendRequest._id.toString() }
      });

      res.status(HTTP_STATUS.OK).json({
        message: 'Friend request rejected successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel a friend request
   */
  static async cancelFriendRequest(req, res, next) {
    try {
      const friendRequest = req.friendRequest;
      const currentUserId = req.userId;

      // Only requester can cancel
      if (friendRequest.requester_id !== currentUserId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: ERROR_MESSAGES.UNAUTHORIZED
        });
      }

      // Check if request is still pending
      if (friendRequest.status !== FRIEND_REQUEST_STATUS.PENDING) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Friend request is no longer pending'
        });
      }

      // Update friend request status
      friendRequest.status = FRIEND_REQUEST_STATUS.CANCELLED;
      await friendRequest.save();

      // Log activity
      await FriendshipActivity.create({
        user_id: currentUserId,
        friend_id: friendRequest.recipient_id,
        activity_type: ACTIVITY_TYPE.REQUEST_CANCELLED,
        metadata: { request_id: friendRequest._id.toString() }
      });

      res.status(HTTP_STATUS.OK).json({
        message: 'Friend request cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get friends list for a user
   */
  static async getFriendsList(req, res, next) {
    try {
      const targetUserId = req.params.user_id;
      const currentUserId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      // Check if accessing own friends list or public access
      const isOwnList = currentUserId === targetUserId;
      
      // For now, we'll allow public access to friends lists
      // In a real app, you might want to check privacy settings
      const friendships = await Friendship.find({
        $or: [
          { user1_id: targetUserId },
          { user2_id: targetUserId }
        ],
        status: FRIENDSHIP_STATUS.ACCEPTED
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

      // Extract friend IDs
      const friends = friendships.map(friendship => {
        return friendship.user1_id === targetUserId 
          ? friendship.user2_id 
          : friendship.user1_id;
      });

      const total = await Friendship.countDocuments({
        $or: [
          { user1_id: targetUserId },
          { user2_id: targetUserId }
        ],
        status: FRIENDSHIP_STATUS.ACCEPTED
      });

      res.status(HTTP_STATUS.OK).json({
        friends,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Block a user
   */
  static async blockUser(req, res, next) {
    try {
      const { user_id: blocked_id, reason } = req.body;
      const blocker_id = req.userId;

      // Check if already blocked
      const existingBlock = await BlockedUser.findOne({
        blocker_id,
        blocked_id
      });

      if (existingBlock) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: 'User is already blocked'
        });
      }

      // Create block record
      const blockRecord = new BlockedUser({
        blocker_id,
        blocked_id,
        reason: reason || ''
      });

      await blockRecord.save();

      // Remove any existing friendship
      await Friendship.deleteOne({
        $or: [
          { user1_id: blocker_id, user2_id: blocked_id },
          { user1_id: blocked_id, user2_id: blocker_id }
        ]
      });

      // Cancel any pending friend requests
      await FriendRequest.updateMany({
        $or: [
          { requester_id: blocker_id, recipient_id: blocked_id },
          { requester_id: blocked_id, recipient_id: blocker_id }
        ],
        status: FRIEND_REQUEST_STATUS.PENDING
      }, {
        status: FRIEND_REQUEST_STATUS.CANCELLED
      });

      // Log activity
      await FriendshipActivity.create({
        user_id: blocker_id,
        friend_id: blocked_id,
        activity_type: ACTIVITY_TYPE.BLOCKED,
        metadata: { reason: reason || '' }
      });

      res.status(HTTP_STATUS.OK).json({
        message: 'User blocked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(req, res, next) {
    try {
      const { user_id: blocked_id } = req.body;
      const blocker_id = req.userId;

      const blockRecord = await BlockedUser.findOneAndDelete({
        blocker_id,
        blocked_id
      });

      if (!blockRecord) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Block record not found'
        });
      }

      // Log activity
      await FriendshipActivity.create({
        user_id: blocker_id,
        friend_id: blocked_id,
        activity_type: ACTIVITY_TYPE.UNBLOCKED,
        metadata: {}
      });

      res.status(HTTP_STATUS.OK).json({
        message: 'User unblocked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get friend recommendations
   */
  static async getFriendRecommendations(req, res, next) {
    try {
      const currentUserId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const recommendations = await FriendRecommendation.find({
        user_id: currentUserId
      })
      .sort({ score: -1, created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

      const total = await FriendRecommendation.countDocuments({
        user_id: currentUserId
      });

      res.status(HTTP_STATUS.OK).json({
        recommendations,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending friend requests (received)
   */
  static async getPendingRequests(req, res, next) {
    try {
      const currentUserId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const requests = await FriendRequest.find({
        recipient_id: currentUserId,
        status: FRIEND_REQUEST_STATUS.PENDING
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

      const total = await FriendRequest.countDocuments({
        recipient_id: currentUserId,
        status: FRIEND_REQUEST_STATUS.PENDING
      });

      res.status(HTTP_STATUS.OK).json({
        requests,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sent friend requests
   */
  static async getSentRequests(req, res, next) {
    try {
      const currentUserId = req.userId;
      const { page = 1, limit = 20, status } = req.query;

      const skip = (page - 1) * limit;
      const filter = { requester_id: currentUserId };
      
      if (status) {
        filter.status = status;
      }

      const requests = await FriendRequest.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FriendRequest.countDocuments(filter);

      res.status(HTTP_STATUS.OK).json({
        requests,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get blocked users list
   */
  static async getBlockedUsers(req, res, next) {
    try {
      const currentUserId = req.userId;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const blockedUsers = await BlockedUser.find({
        blocker_id: currentUserId
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

      const total = await BlockedUser.countDocuments({
        blocker_id: currentUserId
      });

      res.status(HTTP_STATUS.OK).json({
        blocked_users: blockedUsers,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FriendController;