const express = require('express');
const router = express.Router();

const commentsController = require('../controller/comment.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const {
  validateCommentCreate,
  validateCommentUpdate,
  validateObjectId,
  validatePagination,
  validateFileId
} = require('../middleware/validation.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Comment ID
 *         file_id:
 *           type: string
 *           description: ID of the file this comment belongs to
 *         user_id:
 *           type: string
 *           description: ID of the user who created the comment
 *         text:
 *           type: string
 *           description: Comment text content
 *         parent_id:
 *           type: string
 *           nullable: true
 *           description: ID of parent comment (null for top-level comments)
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the comment
 *         dislikes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who disliked the comment
 *         like_count:
 *           type: integer
 *           description: Number of likes
 *         dislike_count:
 *           type: integer
 *           description: Number of dislikes
 *         reply_count:
 *           type: integer
 *           description: Number of replies to this comment
 *         is_deleted:
 *           type: boolean
 *           description: Whether the comment is soft deleted
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Comment creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Comment last update timestamp
 *     
 *     CommentCreate:
 *       type: object
 *       required:
 *         - file_id
 *         - text
 *       properties:
 *         file_id:
 *           type: string
 *           description: ID of the file to comment on
 *         text:
 *           type: string
 *           description: Comment text content
 *           minLength: 1
 *           maxLength: 2000
 *     
 *     CommentUpdate:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Updated comment text content
 *           minLength: 1
 *           maxLength: 2000
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *         total:
 *           type: integer
 *           description: Total number of items
 *         pages:
 *           type: integer
 *           description: Total number of pages
 *     
 *     FileStats:
 *       type: object
 *       properties:
 *         total_comments:
 *           type: integer
 *           description: Total number of comments for the file
 *         total_likes:
 *           type: integer
 *           description: Total number of likes across all comments
 *         total_dislikes:
 *           type: integer
 *           description: Total number of dislikes across all comments
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a top-level comment
 *     description: Creates a new top-level comment on a file
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment created successfully
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticateToken,
  validateCommentCreate,
  commentsController.createComment
);

/**
 * @swagger
 * /comments/{parent_id}/reply:
 *   post:
 *     summary: Reply to an existing comment
 *     description: Creates a reply to an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parent_id
 *         required: true
 *         description: ID of the parent comment to reply to
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reply created successfully
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parent comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:parent_id/reply',
  authenticateToken,
  validateObjectId('parent_id'),
  validateCommentCreate,
  commentsController.replyToComment
);

/**
 * @swagger
 * /comments/file/{file_id}:
 *   get:
 *     summary: Get all top-level comments for a file
 *     description: Retrieves paginated top-level comments for a specific file
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         description: ID of the file to get comments for
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of comments per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/file/:file_id',
  optionalAuth,
  validateFileId,
  validatePagination,
  commentsController.getFileComments
);

/**
 * @swagger
 * /comments/{parent_id}/replies:
 *   get:
 *     summary: Get all replies to a specific comment
 *     description: Retrieves paginated replies to a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: parent_id
 *         required: true
 *         description: ID of the parent comment to get replies for
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *       - in: query
 *         name: page
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of replies per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 replies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:parent_id/replies',
  optionalAuth,
  validateObjectId('parent_id'),
  validatePagination,
  commentsController.getCommentReplies
);

/**
 * @swagger
 * /comments/{comment_id}:
 *   get:
 *     summary: Get a specific comment by ID
 *     description: Retrieves a single comment by its ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to retrieve
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:comment_id',
  optionalAuth,
  validateObjectId('comment_id'),
  commentsController.getComment
);

/**
 * @swagger
 * /comments/{comment_id}:
 *   put:
 *     summary: Update a comment
 *     description: Updates a comment's text content (only by the comment owner)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to update
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdate'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment updated successfully
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:comment_id',
  authenticateToken,
  validateObjectId('comment_id'),
  validateCommentUpdate,
  commentsController.updateComment
);

/**
 * @swagger
 * /comments/{comment_id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Soft deletes a comment (only by the comment owner)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment deleted successfully
 *       400:
 *         description: Bad request - invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:comment_id',
  authenticateToken,
  validateObjectId('comment_id'),
  commentsController.deleteComment
);

/**
 * @swagger
 * /comments/{comment_id}/like:
 *   post:
 *     summary: Like a comment
 *     description: Toggles like on a comment (removes dislike if present)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to like
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reaction updated
 *                 likes:
 *                   type: integer
 *                   description: Updated like count
 *                 dislikes:
 *                   type: integer
 *                   description: Updated dislike count
 *       400:
 *         description: Bad request - invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:comment_id/like',
  authenticateToken,
  validateObjectId('comment_id'),
  commentsController.likeComment
);

/**
 * @swagger
 * /comments/{comment_id}/dislike:
 *   post:
 *     summary: Dislike a comment
 *     description: Toggles dislike on a comment (removes like if present)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to dislike
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reaction updated
 *                 likes:
 *                   type: integer
 *                   description: Updated like count
 *                 dislikes:
 *                   type: integer
 *                   description: Updated dislike count
 *       400:
 *         description: Bad request - invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:comment_id/dislike',
  authenticateToken,
  validateObjectId('comment_id'),
  commentsController.dislikeComment
);

/**
 * @swagger
 * /comments/{comment_id}/reaction:
 *   delete:
 *     summary: Remove user's reaction
 *     description: Removes the user's like or dislike from a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         description: ID of the comment to remove reaction from
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reaction removed
 *                 likes:
 *                   type: integer
 *                   description: Updated like count
 *                 dislikes:
 *                   type: integer
 *                   description: Updated dislike count
 *       400:
 *         description: Bad request - invalid comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:comment_id/reaction',
  authenticateToken,
  validateObjectId('comment_id'),
  commentsController.removeReaction
);

/**
 * @swagger
 * /comments/file/{file_id}/stats:
 *   get:
 *     summary: Get comment/reaction stats for a file
 *     description: Retrieves aggregated statistics for all comments on a specific file
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         description: ID of the file to get stats for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileStats'
 *       400:
 *         description: Bad request - invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/file/:file_id/stats',
  validateFileId,
  commentsController.getFileStats
);

module.exports = router;