const express = require('express');
const router = express.Router();

const favoriteController = require('../controllers/favorite.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { validatePdfId, validateTargetUserId } = require('../middleware/validate.middleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API for managing user and PDF favorites
 */

/**
 * @swagger
 * /favorites/pdf/{pdfId}:
 *   post:
 *     summary: Favorite a PDF
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the PDF to favorite
 *     responses:
 *       201:
 *         description: PDF favorited successfully
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Unfavorite a PDF
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the PDF to unfavorite
 *     responses:
 *       200:
 *         description: PDF unfavorited successfully
 *       404:
 *         description: Favorite not found
 */
router.post('/pdf/:pdfId', 
  authenticateToken,
  validatePdfId,
  favoriteController.favoritePdf
);

/**
 * @swagger
 * /favorites/user/{targetUserId}:
 *   post:
 *     summary: Favorite a user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the user to favorite
 *     responses:
 *       201:
 *         description: User favorited successfully
 *       400:
 *         description: Cannot favorite yourself
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Unfavorite a user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the user to unfavorite
 *     responses:
 *       200:
 *         description: User unfavorited successfully
 *       404:
 *         description: Favorite not found
 */
router.post('/user/:targetUserId',
  authenticateToken,
  validateTargetUserId,
  favoriteController.favoriteUser
);

/** * @swagger
 * /favorites/pdf/{pdfId}:
 *   delete:
 *     summary: Unfavorite a PDF
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the PDF to unfavorite
 *     responses:
 *       200:
 *         description: PDF unfavorited successfully
 *       404:
 *         description: Favorite not found
 */
router.delete('/pdf/:pdfId',
  authenticateToken,
  validatePdfId,
  favoriteController.unfavoritePdf
);

/** * @swagger
 * /favorites/user/{targetUserId}:
 *   delete:
 *     summary: Unfavorite a user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the user to unfavorite
 *     responses:
 *       200:
 *         description: User unfavorited successfully
 *       404:
 *         description: Favorite not found
 */
router.delete('/user/:targetUserId',
  authenticateToken,
  validateTargetUserId,
  favoriteController.unfavoriteUser
);

/**
 * @swagger
 * /favorites/pdf:
 *   get:
 *     summary: List favorited PDFs of logged-in user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorited PDFs
 *       401:
 *         description: Unauthorized
 */
router.get('/pdf',
  optionalAuth,
  favoriteController.getFavoritePdfs
);

/**
 * @swagger
 * /favorites/user:
 *   get:
 *     summary: List favorited users of logged-in user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorited users
 *       401:
 *         description: Unauthorized
 */
router.get('/user',
  optionalAuth,
  favoriteController.getFavoriteUsers
);

/**
 * @swagger
 * /favorites/all:
 *   get:
 *     summary: Get all favorites (PDFs + Users) of logged-in user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all favorites
 *       401:
 *         description: Unauthorized
 */
router.get('/all',
  optionalAuth,
  favoriteController.getAllFavorites
);

/**
 * @swagger
 * /favorites/{targetUserId}/pdf:
 *   get:
 *     summary: Get all favorited PDFs of a specific user
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favorited PDFs
 */
router.get('/:targetUserId/pdf',
  validateTargetUserId,
  favoriteController.getUserFavoritePdfs
);

/**
 * @swagger
 * /favorites/pdf/{pdfId}/users:
 *   get:
 *     summary: List users who favorited a PDF
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/pdf/:pdfId/users',
  validatePdfId,
  favoriteController.getPdfFavoriters
);

/**
 * @swagger
 * /favorites/count/{targetUserId}:
 *   get:
 *     summary: Count number who favorited a user
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Count response
 */
router.get('/count/:targetUserId',
  validateTargetUserId,
  favoriteController.getUserFavoriteCount
);

/**
 * @swagger
 * /favorites/count/pdf/{pdfId}:
 *   get:
 *     summary: Count number who favorited a PDF
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Count response
 */
router.get('/count/pdf/:pdfId',
  validatePdfId,
  favoriteController.getPdfFavoriteCount
);

/**
 * @swagger
 * /favorites/check/{targetType}/{targetId}:
 *   get:
 *     summary: Check if user has favorited a target
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of target (e.g., 'pdf' or 'user')
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the target
 *     responses:
 *       200:
 *         description: Whether the target is favorited by the user
 *       401:
 *         description: Unauthorized
 */
router.get('/check/:targetType/:targetId',
  authenticateToken,
  favoriteController.checkFavorite
);

module.exports = router;