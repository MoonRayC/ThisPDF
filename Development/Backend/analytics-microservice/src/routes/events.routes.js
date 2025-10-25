const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateParams, validateBody, eventSchemas } = require('../middleware/validation.middleware');


/**
 * @swagger
 * components:
 *   schemas:
 *     EventResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *     
 *     CustomEvent:
 *       type: object
 *       required:
 *         - eventType
 *         - targetId
 *         - targetType
 *       properties:
 *         eventType:
 *           type: string
 *           enum: [view, like, favorite, rate, comment, upload, reading_start, reading_end, profile_view]
 *         targetId:
 *           type: string
 *           format: uuid
 *         targetType:
 *           type: string
 *           enum: [pdf, comment, user]
 *         duration:
 *           type: number
 *           minimum: 0
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         metadata:
 *           type: object
 *     
 *     BatchEvent:
 *       type: object
 *       properties:
 *         events:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - eventType
 *               - targetId
 *               - targetType
 *             properties:
 *               eventType:
 *                 type: string
 *               targetId:
 *                 type: string
 *                 format: uuid
 *               targetType:
 *                 type: string
 *                 enum: [pdf, comment, user]
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               rating:
 *                 type: integer
 *               metadata:
 *                 type: object
 *           minItems: 1
 *           maxItems: 100
 *     
 *     BatchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         processed:
 *           type: integer
 *         errors:
 *           type: integer
 *         details:
 *           type: object
 *           properties:
 *             processedEvents:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   index:
 *                     type: integer
 *                   status:
 *                     type: string
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   index:
 *                     type: integer
 *                   error:
 *                     type: string
 */

/**
 * @swagger
 * /events/pdf/{pdfId}/view:
 *   post:
 *     summary: Track PDF view
 *     description: Record when a user views a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: PDF view tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/pdf/:pdfId/view', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  eventsController.trackPdfView
);

/**
 * @swagger
 * /events/pdf/{pdfId}/reading/start:
 *   post:
 *     summary: Track reading session start
 *     description: Record when a user starts reading a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Reading session start tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/reading/start', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  eventsController.trackReadingStart
);

/**
 * @swagger
 * /events/pdf/{pdfId}/reading/end:
 *   post:
 *     summary: Track reading session end
 *     description: Record when a user ends reading a PDF with duration
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *             properties:
 *               duration:
 *                 type: number
 *                 minimum: 0
 *                 description: Reading duration in seconds
 *     responses:
 *       201:
 *         description: Reading session end tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/reading/end', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  validateBody(eventSchemas.readingEnd),
  eventsController.trackReadingEnd
);

/**
 * @swagger
 * /events/pdf/{pdfId}/like:
 *   post:
 *     summary: Track PDF like
 *     description: Record when a user likes a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: PDF like tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/like', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  eventsController.trackPdfLike
);

/**
 * @swagger
 * /events/pdf/{pdfId}/favorite:
 *   post:
 *     summary: Track PDF favorite
 *     description: Record when a user favorites a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: PDF favorite tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/favorite', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  eventsController.trackPdfFavorite
);

/**
 * @swagger
 * /events/pdf/{pdfId}/rate:
 *   post:
 *     summary: Track PDF rating
 *     description: Record when a user rates a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *     responses:
 *       201:
 *         description: PDF rating tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/rate', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  validateBody(eventSchemas.rating),
  eventsController.trackPdfRating
);

/**
 * @swagger
 * /events/pdf/{pdfId}/upload:
 *   post:
 *     summary: Track PDF upload
 *     description: Record when a user uploads a PDF
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pdfId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 description: PDF category
 *     responses:
 *       201:
 *         description: PDF upload tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/pdf/:pdfId/upload', 
  authenticate,
  validateParams(eventSchemas.pdfId),
  validateBody(eventSchemas.pdfUpload),
  eventsController.trackPdfUpload
);

/**
 * @swagger
 * /events/comment/{commentId}/post:
 *   post:
 *     summary: Track comment posted
 *     description: Record when a user posts a comment
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pdfId
 *             properties:
 *               pdfId:
 *                 type: string
 *                 format: uuid
 *                 description: PDF the comment is on
 *     responses:
 *       201:
 *         description: Comment post tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/comment/:commentId/post', 
  authenticate,
  validateParams(eventSchemas.commentId),
  validateBody(eventSchemas.commentPost),
  eventsController.trackCommentPosted
);

/**
 * @swagger
 * /events/comment/{commentId}/like:
 *   post:
 *     summary: Track comment like
 *     description: Record when a user likes a comment
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pdfId
 *             properties:
 *               pdfId:
 *                 type: string
 *                 format: uuid
 *                 description: PDF the comment is on
 *     responses:
 *       201:
 *         description: Comment like tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/comment/:commentId/like', 
  authenticate,
  validateParams(eventSchemas.commentId),
  validateBody(eventSchemas.commentLike),
  eventsController.trackCommentLike
);

/**
 * @swagger
 * /events/profile/{profileUserId}/view:
 *   post:
 *     summary: Track profile view
 *     description: Record when a user views another user's profile
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: profileUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Profile view tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/profile/:profileUserId/view', 
  authenticate,
  validateParams(eventSchemas.profileUserId),
  eventsController.trackProfileView
);

/**
 * @swagger
 * /events/custom:
 *   post:
 *     summary: Track custom event
 *     description: Record a custom analytics event
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomEvent'
 *     responses:
 *       201:
 *         description: Custom event tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 */
router.post('/custom', 
  authenticate,
  validateBody(eventSchemas.customEvent),
  eventsController.trackCustomEvent
);

/**
 * @swagger
 * /events/batch:
 *   post:
 *     summary: Track multiple events in batch
 *     description: Record multiple analytics events in a single request (max 100)
 *     tags: [Event Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchEvent'
 *     responses:
 *       207:
 *         description: Batch events processed (some may have failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchResponse'
 */
router.post('/batch', 
  authenticate,
  validateBody(eventSchemas.batchEvents),
  eventsController.trackBatchEvents
);

module.exports = router;