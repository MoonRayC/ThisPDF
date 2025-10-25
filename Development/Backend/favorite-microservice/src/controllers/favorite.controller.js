const favoriteService = require('../services/favorite.service');
const { HTTP_STATUS, TARGET_TYPES } = require('../utils/constants');

class FavoriteController {
  /**
   * Add a PDF to favorites
   * POST /favorites/pdf/:pdfId
   */
  async favoritePdf(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user.id;

      const favorite = await favoriteService.addFavorite(userId, TARGET_TYPES.PDF, pdfId);

      res.status(HTTP_STATUS.CREATED).json({
        message: 'PDF favorited successfully',
        favorite: {
          id: favorite._id,
          user_id: favorite.user_id,
          target_type: favorite.target_type,
          target_id: favorite.target_id,
          created_at: favorite.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's favorite users
   * GET /favorites/user
   */
  async getFavoriteUsers(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const favorites = await favoriteService.getUserFavorites(userId, TARGET_TYPES.USER);

      res.status(HTTP_STATUS.OK).json({
        favorites: favorites.map(f => ({
          id: f._id,
          target_id: f.target_id,
          created_at: f.created_at
        })),
        count: favorites.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users who favorited a specific PDF
   * GET /favorites/pdf/:pdfId/users
   */
  async getPdfFavoriters(req, res, next) {
    try {
      const { pdfId } = req.params;

      const favorites = await favoriteService.getWhoFavorited(TARGET_TYPES.PDF, pdfId);

      res.status(HTTP_STATUS.OK).json({
        pdf_id: pdfId,
        users: favorites.map(f => ({
          user_id: f.user_id,
          created_at: f.created_at
        })),
        count: favorites.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get count of favorites for a user
   * GET /favorites/count/:targetUserId
   */
  async getUserFavoriteCount(req, res, next) {
    try {
      const { targetUserId } = req.params;

      const count = await favoriteService.getFavoriteCount(TARGET_TYPES.USER, targetUserId);

      res.status(HTTP_STATUS.OK).json({
        user_id: targetUserId,
        favorite_count: count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get count of favorites for a PDF
   * GET /favorites/count/pdf/:pdfId
   */
  async getPdfFavoriteCount(req, res, next) {
    try {
      const { pdfId } = req.params;

      const count = await favoriteService.getFavoriteCount(TARGET_TYPES.PDF, pdfId);

      res.status(HTTP_STATUS.OK).json({
        pdf_id: pdfId,
        favorite_count: count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user has favorited a specific item
   * GET /favorites/check/:targetType/:targetId
   */
  async checkFavorite(req, res, next) {
    try {
      const { targetType, targetId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const isFavorited = await favoriteService.isFavorited(userId, targetType, targetId);

      res.status(HTTP_STATUS.OK).json({
        is_favorited: isFavorited,
        user_id: userId,
        target_type: targetType,
        target_id: targetId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all favorites for logged-in user
   * GET /favorites/all
   */
  async getAllFavorites(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const { pdfs, users } = await favoriteService.getAllUserFavorites(userId);

      res.status(HTTP_STATUS.OK).json({
        user_id: userId,
        pdfs: pdfs.map(f => ({
          id: f._id,
          target_id: f.target_id,
          created_at: f.created_at
        })),
        users: users.map(f => ({
          id: f._id,
          target_id: f.target_id,
          created_at: f.created_at
        })),
        total_count: pdfs.length + users.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a PDF from favorites
   * DELETE /favorites/pdf/:pdfId
   */
  async unfavoritePdf(req, res, next) {
    try {
      const { pdfId } = req.params;
      const userId = req.user.id;

      const favorite = await favoriteService.removeFavorite(userId, TARGET_TYPES.PDF, pdfId);

      if (!favorite) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Favorite not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'PDF unfavorited successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a user to favorites
   * POST /favorites/user/:targetUserId
   */
  async favoriteUser(req, res, next) {
    try {
      const { targetUserId } = req.params;
      const userId = req.user.id;

      // Prevent users from favoriting themselves
      if (userId === targetUserId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Cannot favorite yourself'
        });
      }

      const favorite = await favoriteService.addFavorite(userId, TARGET_TYPES.USER, targetUserId);

      res.status(HTTP_STATUS.CREATED).json({
        message: 'User favorited successfully',
        favorite: {
          id: favorite._id,
          user_id: favorite.user_id,
          target_type: favorite.target_type,
          target_id: favorite.target_id,
          created_at: favorite.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a user from favorites
   * DELETE /favorites/user/:targetUserId
   */
  async unfavoriteUser(req, res, next) {
    try {
      const { targetUserId } = req.params;
      const userId = req.user.id;

      const favorite = await favoriteService.removeFavorite(userId, TARGET_TYPES.USER, targetUserId);

      if (!favorite) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Not Found',
          message: 'Favorite not found'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'User unfavorited successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's favorite PDFs
   * GET /favorites/pdf
   */
  async getFavoritePdfs(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const favorites = await favoriteService.getUserFavorites(userId, TARGET_TYPES.PDF);

      res.status(HTTP_STATUS.OK).json({
        favorites: favorites.map(f => ({
          id: f._id,
          target_id: f.target_id,
          created_at: f.created_at
        })),
        count: favorites.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific user's favorite PDFs
   * GET /favorites/:targetUserId/pdf
   */
  async getUserFavoritePdfs(req, res, next) {
    try {
      const { targetUserId } = req.params;

      const favorites = await favoriteService.getUserFavorites(targetUserId, TARGET_TYPES.PDF);

      res.status(HTTP_STATUS.OK).json({
        user_id: targetUserId,
        favorites: favorites.map(f => ({
          id: f._id,
          target_id: f.target_id,
          created_at: f.created_at
        })),
        count: favorites.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();