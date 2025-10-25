const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // UUID v4 validation
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Invalid UUID format for user_id'
    }
  },
  target_type: {
    type: String,
    required: true,
    enum: ['pdf', 'user'],
    lowercase: true
  },
  target_id: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // UUID v4 validation
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      },
      message: 'Invalid UUID format for target_id'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user_id: 1, target_type: 1, target_id: 1 }, { unique: true });

// Index for efficient queries by user and type, sorted by creation date
favoriteSchema.index({ user_id: 1, target_type: 1, created_at: -1 });

// Index for queries by target (e.g., who favorited a specific PDF)
favoriteSchema.index({ target_type: 1, target_id: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);