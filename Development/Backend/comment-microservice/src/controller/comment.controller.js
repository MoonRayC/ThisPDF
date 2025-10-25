const Comment = require('../models/comment.model');
const mongoose = require('mongoose');

class CommentsController {
  // Create a new comment
  async createComment(req, res, next) {
    try {
      const { file_id, text } = req.body;
      const user_id = req.user.id;

      const comment = new Comment({
        file_id,
        user_id,
        text,
        parent_id: null
      });

      await comment.save();
      await comment.populate('reply_count');

      res.status(201).json({
        message: 'Comment created successfully',
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  // Reply to an existing comment
  async replyToComment(req, res, next) {
    try {
      const { parent_id } = req.params;
      const { file_id, text } = req.body;
      const user_id = req.user.id;

      // Check if parent comment exists and is not deleted
      const parentComment = await Comment.findOne({
        _id: parent_id,
        is_deleted: false
      });

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }

      const reply = new Comment({
        file_id,
        user_id,
        text,
        parent_id: new mongoose.Types.ObjectId(parent_id)
      });

      await reply.save();
      await reply.populate('reply_count');

      res.status(201).json({
        message: 'Reply created successfully',
        comment: reply
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all comments for a file (top-level only)
  async getFileComments(req, res, next) {
    try {
      const { file_id } = req.params;
      const { page, limit } = req.pagination;

      const skip = (page - 1) * limit;

      const comments = await Comment.find({
        file_id,
        parent_id: null,
        is_deleted: false
      })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reply_count');

      const total = await Comment.countDocuments({
        file_id,
        parent_id: null,
        is_deleted: false
      });

      res.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all replies to a specific comment
  async getCommentReplies(req, res, next) {
    try {
      const { parent_id } = req.params;
      const { page, limit } = req.pagination;

      const skip = (page - 1) * limit;

      const replies = await Comment.find({
        parent_id: new mongoose.Types.ObjectId(parent_id),
        is_deleted: false
      })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .populate('reply_count');

      const total = await Comment.countDocuments({
        parent_id: new mongoose.Types.ObjectId(parent_id),
        is_deleted: false
      });

      res.json({
        replies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a specific comment by ID
  async getComment(req, res, next) {
    try {
      const { comment_id } = req.params;

      const comment = await Comment.findOne({
        _id: comment_id,
        is_deleted: false
      }).populate('reply_count');

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  // Update a comment (only by owner)
  async updateComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const { text } = req.body;
      const user_id = req.user.id;

      const comment = await Comment.findOne({
        _id: comment_id,
        user_id,
        is_deleted: false
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found or unauthorized' });
      }

      comment.text = text;
      comment.updated_at = new Date();
      await comment.save();
      await comment.populate('reply_count');

      res.json({
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  // Soft delete a comment
  async deleteComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const user_id = req.user.id;

      const comment = await Comment.findOne({
        _id: comment_id,
        user_id,
        is_deleted: false
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found or unauthorized' });
      }

      comment.is_deleted = true;
      comment.updated_at = new Date();
      await comment.save();

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Like a comment (toggle)
  async likeComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const user_id = req.user.id;

      const comment = await Comment.findOne({
        _id: comment_id,
        is_deleted: false
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Remove from dislikes if present
      comment.dislikes = comment.dislikes.filter(id => id !== user_id);

      // Toggle like
      if (comment.likes.includes(user_id)) {
        comment.likes = comment.likes.filter(id => id !== user_id);
      } else {
        comment.likes.push(user_id);
      }

      await comment.save();

      res.json({
        message: 'Reaction updated',
        likes: comment.like_count,
        dislikes: comment.dislike_count
      });
    } catch (error) {
      next(error);
    }
  }

  // Dislike a comment (toggle)
  async dislikeComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const user_id = req.user.id;

      const comment = await Comment.findOne({
        _id: comment_id,
        is_deleted: false
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Remove from likes if present
      comment.likes = comment.likes.filter(id => id !== user_id);

      // Toggle dislike
      if (comment.dislikes.includes(user_id)) {
        comment.dislikes = comment.dislikes.filter(id => id !== user_id);
      } else {
        comment.dislikes.push(user_id);
      }

      await comment.save();

      res.json({
        message: 'Reaction updated',
        likes: comment.like_count,
        dislikes: comment.dislike_count
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove user's reaction
  async removeReaction(req, res, next) {
    try {
      const { comment_id } = req.params;
      const user_id = req.user.id;

      const comment = await Comment.findOne({
        _id: comment_id,
        is_deleted: false
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Remove from both likes and dislikes
      comment.likes = comment.likes.filter(id => id !== user_id);
      comment.dislikes = comment.dislikes.filter(id => id !== user_id);

      await comment.save();

      res.json({
        message: 'Reaction removed',
        likes: comment.like_count,
        dislikes: comment.dislike_count
      });
    } catch (error) {
      next(error);
    }
  }

  // Get stats for a file
  async getFileStats(req, res, next) {
    try {
      const { file_id } = req.params;

      const pipeline = [
        {
          $match: {
            file_id,
            is_deleted: false
          }
        },
        {
          $group: {
            _id: null,
            total_comments: { $sum: 1 },
            total_likes: { $sum: { $size: '$likes' } },
            total_dislikes: { $sum: { $size: '$dislikes' } }
          }
        }
      ];

      const result = await Comment.aggregate(pipeline);
      
      const stats = result[0] || {
        total_comments: 0,
        total_likes: 0,
        total_dislikes: 0
      };

      // Remove the _id field
      delete stats._id;

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentsController();