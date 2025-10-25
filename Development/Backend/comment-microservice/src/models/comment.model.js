const mongoose = require('mongoose');
const { Schema } = mongoose;

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const CommentSchema = new Schema({
  file_id: {
    type: String,
    required: true,
    match: UUID_REGEX,
  },
  user_id: {
    type: String,
    required: true,
    match: UUID_REGEX,
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    default: null,
    match: UUID_REGEX,
  },
  likes: [String], 
  dislikes: [String], 
  is_deleted: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for better query performance
CommentSchema.index({ file_id: 1 });
CommentSchema.index({ parent_id: 1 });
CommentSchema.index({ user_id: 1 });
CommentSchema.index({ file_id: 1, parent_id: 1 });

// Update the updated_at field before saving
CommentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = Date.now();
  }
  next();
});

// Virtual for reply count
CommentSchema.virtual('reply_count', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent_id',
  count: true
});

// Virtual for like count
CommentSchema.virtual('like_count').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
CommentSchema.virtual('dislike_count').get(function() {
  return this.dislikes.length;
});

// Include virtuals when converting to JSON
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', CommentSchema);