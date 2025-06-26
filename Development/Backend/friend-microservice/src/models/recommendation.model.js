const mongoose = require('mongoose');

// Friend Recommendation Schema
const friendRecommendationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  recommended_user_id: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  score: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
    max: 1,
    default: 0
  },
  reason: {
    type: String,
    required: true,
    maxlength: 200,
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
  collection: 'friend_recommendations'
});

// Indexes for better query performance
friendRecommendationSchema.index({ user_id: 1, score: -1 });
friendRecommendationSchema.index({ user_id: 1, recommended_user_id: 1 }, { unique: true });
friendRecommendationSchema.index({ created_at: -1 });
friendRecommendationSchema.index({ score: -1 });

// Middleware to update updated_at on save
friendRecommendationSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Virtual to convert Decimal128 to number for JSON serialization
friendRecommendationSchema.virtual('scoreNumber').get(function() {
  return parseFloat(this.score.toString());
});

// Ensure virtual fields are serialized
friendRecommendationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.score = parseFloat(ret.score.toString());
    delete ret.scoreNumber;
    return ret;
  }
});

const FriendRecommendation = mongoose.model('FriendRecommendation', friendRecommendationSchema);

module.exports = {
  FriendRecommendation
};