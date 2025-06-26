const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');

const {
  validateRegister,
  validateLogin,
  validateEmailVerification,
  validatePasswordReset,
  validateRefreshToken,
  validateResendCode
} = require('../middleware/validation.middleware');

const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - password_confirmation
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: MyP@ssw0rd!
 *               password_confirmation:
 *                 type: string
 *                 example: MyP@ssw0rd!
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /verify-email:
 *   post:
 *     summary: Verify a user's email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - verification_token
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 example: "3d594650-3436-4f56-b3c2-c86fef6d26b2"
 *               verification_token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.post('/verify-email', validateEmailVerification, authController.verifyEmail);

/**
 * @swagger
 * /resend-code:
 *   post:
 *     summary: Resend the verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification code resent successfully
 */
router.post('/resend-code', validateResendCode, authController.resendVerificationCode);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: MyP@ssw0rd!
 *               user_agent:
 *                 type: string
 *                 example: Mozilla/5.0
 *               ip_address:
 *                 type: string
 *                 example: 127.0.0.1
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh JWT access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: some_refresh_token_string
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: Request a password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset request sent
 */
router.post('/request-password-reset', authController.requestPasswordReset);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reset_token
 *               - new_password
 *               - new_password_confirmation
 *             properties:
 *               reset_token:
 *                 type: string
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 example: MyN3wP@ssw0rd!
 *               new_password_confirmation:
 *                 type: string
 *                 example: MyN3wP@ssw0rd!
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: some_refresh_token_string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /social/google:
 *   post:
 *     summary: Log in with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 example: google_access_token
 *     responses:
 *       200:
 *         description: Social login successful
 */
router.post('/social/google', authController.googleLogin);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: List user's active devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active devices
 */
router.get('/devices', authenticateToken, authController.listDevices);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get('/user', authenticateToken, authController.getCurrentUser);

module.exports = router;
