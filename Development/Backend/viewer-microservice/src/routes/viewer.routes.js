const express = require('express');
const ViewerController = require('../controller/viewer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validateFileId } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @swagger
 * /view/{file_id}:
 *   get:
 *     summary: Get file viewer metadata and URL
 *     tags: [Viewer]
 *     security:
 *       - bearerAuth: []  # <-- This enables the Authorization header
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the PDF file
 *     responses:
 *       200:
 *         description: File viewer response with metadata
 *       401:
 *         description: Unauthorized (for private files)
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.get(
  '/:file_id',
  validateFileId,
  authMiddleware,
  ViewerController.getFileViewer
);

module.exports = router;