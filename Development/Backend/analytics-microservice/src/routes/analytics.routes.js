const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { validateParams, validateQuery, schemas } = require('../middleware/validation.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     PdfStats:
 *       type: object
 *       properties:
 *         pdfId:
 *           type: string
 *           format: uuid
 *         totalViews:
 *           type: integer
 *         totalLikes:
 *           type: integer
 *         totalFavorites:
 *           type: integer
 *         totalComments:
 *           type: integer
 *         readingTime:
 *           type: integer
 *           description: Average reading time in seconds
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     PdfRating:
 *       type: object
 *       properties:
 *         pdfId:
 *           type: string
 *           format: uuid
 *         averageRating:
 *           type: number
 *           format: float
 *         totalRatings:
 *           type: integer
 *         ratingDistribution:
 *           type: object
 *           properties:
 *             1: { type: integer }
 *             2: { type: integer }
 *             3: { type: integer }
 *             4: { type: integer }
 *             5: { type: integer }
 *     
 *     CommentStats:
 *       type: object
 *       properties:
 *         pdfId:
 *           type: string
 *           format: uuid
 *         totalComments:
 *           type: integer
 *         averageCommentLength:
 *           type: number
 *         recentComments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: string
 *                 format: uuid
 *     
 *     UserPopularity:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         followers:
 *           type: integer
 *         following:
 *           type: integer
 *         totalViews:
 *           type: integer
 *         totalLikes:
 *           type: integer
 *         popularityScore:
 *           type: number
 *           format: float
 *     
 *     UserUploads:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         totalUploads:
 *           type: integer
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               count:
 *                 type: integer
 *         recentUploads:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               uploadedAt:
 *                 type: string
 *                 format: date-time
 *     
 *     TopUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         score:
 *           type: number
 *           format: float
 *         totalUploads:
 *           type: integer
 *         totalViews:
 *           type: integer
 *         rank:
 *           type: integer
 *     
 *     TopPdf:
 *       type: object
 *       properties:
 *         pdfId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         score:
 *           type: number
 *           format: float
 *         views:
 *           type: integer
 *         likes:
 *           type: integer
 *         rank:
 *           type: integer
 *     
 *     PlatformSummary:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         totalPdfs:
 *           type: integer
 *         totalViews:
 *           type: integer
 *         totalLikes:
 *           type: integer
 *         totalComments:
 *           type: integer
 *         activeUsers24h:
 *           type: integer
 *         newUploads24h:
 *           type: integer
 *     
 *     EngagementData:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *         views:
 *           type: integer
 *         likes:
 *           type: integer
 *         comments:
 *           type: integer
 *         uploads:
 *           type: integer
 *     
 *     ReadingPattern:
 *       type: object
 *       properties:
 *         hour:
 *           type: integer
 *           minimum: 0
 *           maximum: 23
 *         dayOfWeek:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         readingCount:
 *           type: integer
 *         averageReadingTime:
 *           type: number
 *           format: float
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *   
 *   parameters:
 *     PdfId:
 *       name: pdfId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: PDF unique identifier
 *     
 *     UserId:
 *       name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: User unique identifier
 *     
 *     EventType:
 *       name: eventType
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         enum: [view, like, favorite, rate, comment, upload, reading_start, reading_end, profile_view]
 *       description: Type of event to count
 *     
 *     Limit:
 *       name: limit
 *       in: query
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items to return
 *     
 *     Period:
 *       name: period
 *       in: query
 *       schema:
 *         type: string
 *         enum: [1h, 24h, 7d, 30d, 90d]
 *         default: 24h
 *       description: Time period for analytics
 *     
 *     SortBy:
 *       name: sortBy
 *       in: query
 *       schema:
 *         type: string
 *         enum: [timestamp, rating, views, likes, engagement]
 *         default: engagement
 *       description: Sort criteria
 *     
 *     StartDate:
 *       name: startDate
 *       in: query
 *       schema:
 *         type: string
 *         format: date-time
 *       description: Start date for custom time range (ISO format)
 *     
 *     EndDate:
 *       name: endDate
 *       in: query
 *       schema:
 *         type: string
 *         format: date-time
 *       description: End date for custom time range (ISO format)
 *   
 *   responses:
 *     BadRequest:
 *       description: Invalid request parameters
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     Unauthorized:
 *       description: Authentication required
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /analytics/pdf/{pdfId}/stats:
 *   get:
 *     summary: Get PDF statistics
 *     description: Retrieve comprehensive statistics for a specific PDF including views, likes, favorites, comments, and reading time
 *     tags: [PDF Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/PdfId'
 *     responses:
 *       200:
 *         description: PDF statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PdfStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/pdf/:pdfId/stats', 
  validateParams(schemas.pdfId),
  optionalAuth,
  analyticsController.getPdfStats
);

/**
 * @swagger
 * /analytics/pdf/{pdfId}/rating:
 *   get:
 *     summary: Get PDF rating information
 *     description: Retrieve rating statistics for a specific PDF including average rating, total ratings, and rating distribution
 *     tags: [PDF Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/PdfId'
 *     responses:
 *       200:
 *         description: PDF rating information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PdfRating'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/pdf/:pdfId/rating', 
  validateParams(schemas.pdfId),
  optionalAuth,
  analyticsController.getPdfRating
);

/**
 * @swagger
 * /analytics/pdf/{pdfId}/comments:
 *   get:
 *     summary: Get PDF comment statistics
 *     description: Retrieve comment statistics for a specific PDF including total comments, average length, and recent comments
 *     tags: [PDF Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/PdfId'
 *     responses:
 *       200:
 *         description: PDF comment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentStats'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/pdf/:pdfId/comments', 
  validateParams(schemas.pdfId),
  optionalAuth,
  analyticsController.getPdfComments
);

/**
 * @swagger
 * /analytics/user/{userId}/popularity:
 *   get:
 *     summary: Get user popularity metrics
 *     description: Retrieve popularity metrics for a specific user including followers, following, views, likes, and popularity score
 *     tags: [User Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: User popularity metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPopularity'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user/:userId/popularity', 
  validateParams(schemas.userId),
  optionalAuth,
  analyticsController.getUserPopularity
);

/**
 * @swagger
 * /analytics/user/{userId}/uploads:
 *   get:
 *     summary: Get user upload statistics
 *     description: Retrieve upload statistics for a specific user including total uploads, categories, and recent uploads
 *     tags: [User Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       200:
 *         description: User upload statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUploads'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user/:userId/uploads', 
  validateParams(schemas.userId),
  optionalAuth,
  analyticsController.getUserUploads
);

/**
 * @swagger
 * /analytics/user/stats:
 *   get:
 *     summary: Get personal user statistics
 *     description: Retrieve comprehensive statistics for the authenticated user (private endpoint)
 *     tags: [User Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal user statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUploads:
 *                   type: integer
 *                 totalViews:
 *                   type: integer
 *                 totalLikes:
 *                   type: integer
 *                 totalComments:
 *                   type: integer
 *                 followers:
 *                   type: integer
 *                 following:
 *                   type: integer
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                 readingTime:
 *                   type: integer
 *                 favoriteCategories:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user/stats', 
  authenticate,
  analyticsController.getUserPersonalStats
);

/**
 * @swagger
 * /analytics/top-users:
 *   get:
 *     summary: Get top users leaderboard
 *     description: Retrieve the top users based on popularity metrics for a specified time period
 *     tags: [Leaderboards]
 *     parameters:
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Top users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopUser'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/top-users', 
  validateQuery(schemas.pagination),
  optionalAuth,
  analyticsController.getTopUsers
);

/**
 * @swagger
 * /analytics/top-pdfs:
 *   get:
 *     summary: Get top PDFs leaderboard
 *     description: Retrieve the top PDFs based on engagement metrics for a specified time period
 *     tags: [Leaderboards]
 *     parameters:
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Period'
 *       - $ref: '#/components/parameters/SortBy'
 *     responses:
 *       200:
 *         description: Top PDFs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopPdf'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/top-pdfs', 
  validateQuery(schemas.pagination),
  optionalAuth,
  analyticsController.getTopPdfs
);

/**
 * @swagger
 * /analytics/trending:
 *   get:
 *     summary: Get trending PDFs
 *     description: Retrieve currently trending PDFs based on recent engagement and growth metrics
 *     tags: [Trending]
 *     parameters:
 *       - $ref: '#/components/parameters/Limit'
 *     responses:
 *       200:
 *         description: Trending PDFs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TopPdf'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/trending', 
  validateQuery(schemas.pagination),
  optionalAuth,
  analyticsController.getTrendingPdfs
);

/**
 * @swagger
 * /analytics/categories/top:
 *   get:
 *     summary: Get top categories
 *     description: Retrieve the most popular categories based on PDF uploads and engagement
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Top categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   count:
 *                     type: integer
 *                   engagementScore:
 *                     type: number
 *                     format: float
 *                   rank:
 *                     type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/categories/top', 
  validateQuery(schemas.pagination),
  optionalAuth,
  analyticsController.getTopCategories
);

/**
 * @swagger
 * /analytics/events/{eventType}/count:
 *   get:
 *     summary: Get event type count
 *     description: Retrieve the count of specific event types for a given time period
 *     tags: [Platform Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/EventType'
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Event count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventType:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 period:
 *                   type: string
 *                 timeRange:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/events/:eventType/count', 
  validateParams(schemas.eventType),
  validateQuery(schemas.timeRange),
  optionalAuth,
  analyticsController.getEventTypeCount
);

/**
 * @swagger
 * /analytics/stats/summary:
 *   get:
 *     summary: Get platform summary statistics
 *     description: Retrieve high-level platform statistics including total users, PDFs, views, likes, and recent activity
 *     tags: [Platform Analytics]
 *     responses:
 *       200:
 *         description: Platform summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlatformSummary'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats/summary', 
  optionalAuth,
  analyticsController.getPlatformSummary
);

/**
 * @swagger
 * /analytics/engagement/timeline:
 *   get:
 *     summary: Get engagement over time
 *     description: Retrieve engagement metrics over a specified time period to show trends and patterns
 *     tags: [Time-based Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/Period'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *     responses:
 *       200:
 *         description: Engagement timeline retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EngagementData'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/engagement/timeline', 
  validateQuery(schemas.timeRange),
  optionalAuth,
  analyticsController.getEngagementOverTime
);

/**
 * @swagger
 * /analytics/reading/patterns:
 *   get:
 *     summary: Get reading patterns
 *     description: Retrieve reading patterns showing when users are most active (by hour and day of week)
 *     tags: [Time-based Analytics]
 *     parameters:
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Reading patterns retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReadingPattern'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/reading/patterns', 
  validateQuery(schemas.timeRange),
  optionalAuth,
  analyticsController.getReadingPatterns
);

module.exports = router;