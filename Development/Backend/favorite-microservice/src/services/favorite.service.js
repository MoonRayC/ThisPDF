const Favorite = require('../models/favorite.model');
const { TARGET_TYPES } = require('../utils/constants');

class FavoriteService {
  /**
   * Add a favorite
   * @param {string} userId - User ID
   * @param {string} targetType - 'pdf' or 'user'
   * @param {string} targetId - Target ID
   * @returns {Promise<Object>} Created favorite
   */
  async addFavorite(userId, targetType, targetId) {
    try {
      const favorite = new Favorite({
        user_id: userId,
        target_type: targetType,
        target_id: targetId
      });

      await favorite.save();
      return favorite;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        throw new Error('Already favorited');
      }
      throw error;
    }
  }

  /**
   * Remove a favorite
   * @param {string} userId - User ID
   * @param {string} targetType - 'pdf' or 'user'
   * @param {string} targetId - Target ID
   * @returns {Promise<Object>} Deleted favorite or null if not found
   */
  async removeFavorite(userId, targetType, targetId) {
    const favorite = await Favorite.findOneAndDelete({
      user_id: userId,
      target_type: targetType,
      target_id: targetId
    });

    return favorite;
  }

  /**
   * Get user's favorites by type
   * @param {string} userId - User ID
   * @param {string} targetType - 'pdf' or 'user'
   * @returns {Promise<Array>} Array of favorites
   */
  async getUserFavorites(userId, targetType) {
    const favorites = await Favorite.find({
      user_id: userId,
      target_type: targetType
    }).sort({ created_at: -1 });

    return favorites;
  }

  /**
   * Get users who favorited a specific target
   * @param {string} targetType - 'pdf' or 'user'
   * @param {string} targetId - Target ID
   * @returns {Promise<Array>} Array of user IDs who favorited the target
   */
  async getWhoFavorited(targetType, targetId) {
    const favorites = await Favorite.find({
      target_type: targetType,
      target_id: targetId
    }).sort({ created_at: -1 });

    return favorites;
  }

  /**
   * Get count of users who favorited a target
   * @param {string} targetType - 'pdf' or 'user'
   * @param {string} targetId - Target ID
   * @returns {Promise<number>} Count of favorites
   */
  async getFavoriteCount(targetType, targetId) {
    const count = await Favorite.countDocuments({
      target_type: targetType,
      target_id: targetId
    });

    return count;
  }

  /**
   * Check if user has favorited a target
   * @param {string} userId - User ID
   * @param {string} targetType - 'pdf' or 'user'
   * @param {string} targetId - Target ID
   * @returns {Promise<boolean>} True if favorited
   */
  async isFavorited(userId, targetType, targetId) {
    const favorite = await Favorite.findOne({
      user_id: userId,
      target_type: targetType,
      target_id: targetId
    });

    return !!favorite;
  }

  /**
   * Get all favorites for a user (both PDFs and users)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with pdfs and users arrays
   */
  async getAllUserFavorites(userId) {
    const favorites = await Favorite.find({
      user_id: userId
    }).sort({ created_at: -1 });

    const pdfs = favorites.filter(f => f.target_type === TARGET_TYPES.PDF);
    const users = favorites.filter(f => f.target_type === TARGET_TYPES.USER);

    return { pdfs, users };
  }
}

module.exports = new FavoriteService();