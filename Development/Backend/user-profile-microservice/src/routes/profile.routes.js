const express = require('express');
const ProfileController = require('../controller/profile.controller');
const { authenticateToken, checkProfileOwnership, checkProfileExists, validateDeleteConfirmation, updateLastActiveMiddleware } = require('../middleware/profile.middleware');
const { validate, validateParams, validationSchemas } = require('../middleware/validation.middleware');
const { asyncHandler } = require('../middleware/errorHandler.middleware');

const {
  profileCreateLimiter,
  profileUpdateLimiter,
  lastActiveLimiter,
  profileDeleteLimiter,
  profileReadLimiter,
  profileListLimiter
} = require('../middleware/rateLimiter.middleware');

const router = express.Router();

/**
 * @swagger
 * /profiles/user/{user_id}:
 *   get:
 *     summary: Get a profile by user ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get('/user/:user_id',
  profileReadLimiter,
  validateParams(validationSchemas.uuidParam),
  asyncHandler(ProfileController.getProfile)
);

/**
 * @swagger
 * /profiles/username/{username}:
 *   get:
 *     summary: Get a profile by username
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get('/username/:username',
  profileReadLimiter,
  validateParams(validationSchemas.usernameParam),
  asyncHandler(ProfileController.getProfileByUsername)
);

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all user profiles (paginated)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of user profiles
 */
router.get('/',
  profileListLimiter,
  asyncHandler(ProfileController.getAllProfiles)
);

/**
 * @swagger
 * /profiles/many/user:
 *   post:
 *     summary: Get multiple profiles by user IDs
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       400:
 *         description: Validation error
 */
router.post('/many/user',
  profileListLimiter,
  validate(validationSchemas.bulkUserIdArray), 
  asyncHandler(ProfileController.getProfilesByUserIds) 
);

router.use(authenticateToken);
router.use(updateLastActiveMiddleware);

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Profile already exists or username taken
 *       500:
 *         description: Server error
 */

router.post('/',
  profileCreateLimiter,
  validate(validationSchemas.createProfile),
  asyncHandler(ProfileController.createProfile)
);

/**
 * @swagger
 * /profiles/user/{user_id}:
 *   put:
 *     summary: Update a user profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Username already taken
 */
router.put('/user/:user_id',
  profileUpdateLimiter,
  validateParams(validationSchemas.uuidParam),
  validate(validationSchemas.updateProfile),
  checkProfileOwnership,
  asyncHandler(ProfileController.updateProfile)
);

/**
 * @swagger
 * /profiles/user/{user_id}/last-active:
 *   patch:
 *     summary: Update the last active timestamp
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Last active timestamp updated
 *       404:
 *         description: Profile not found
 */
router.patch('/user/:user_id/last-active',
  validateParams(validationSchemas.uuidParam),
  lastActiveLimiter,
  checkProfileOwnership,
  asyncHandler(ProfileController.updateLastActive)
);

/**
 * @swagger
 * /profiles/user/{user_id}:
 *   delete:
 *     summary: Delete a user profile
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
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
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: string
 *                 enum: [DELETE]
 *     responses:
 *       204:
 *         description: Profile deleted successfully
 *       400:
 *         description: Invalid delete confirmation
 *       404:
 *         description: Profile not found
 */
router.delete('/user/:user_id',
  profileDeleteLimiter,
  validateParams(validationSchemas.uuidParam),
  validate(validationSchemas.deleteProfile),
  checkProfileOwnership,
  checkProfileExists,
  validateDeleteConfirmation,
  asyncHandler(ProfileController.deleteProfile)
);

module.exports = router;