const express = require('express');
const router = express.Router();

const MetadataController = require('../controller/metadata.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  createMetadataSchema,
  updateMetadataSchema,
  fileIdsSchema,
  paginationSchema,
  bulkDeleteSchema,
  validateRequest,
  validateQuery
} = require('../middleware/validation.middleware');

/**
 * @swagger
 * /metadata/public:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get public metadata records
 *     description: Retrieve all publicly visible metadata records
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       200:
 *         description: Public metadata records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/public', validateQuery(paginationSchema), MetadataController.getPublicMetadata);

/**
 * @swagger
 * /metadata/private:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get private metadata records
 *     description: Retrieve all private metadata records
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       200:
 *         description: Private metadata records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/private', validateQuery(paginationSchema), MetadataController.getPrivateMetadata);

/**
 * @swagger
 * /metadata/{file_id}:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get metadata by file ID
 *     description: Retrieve metadata for a specific file
 *     parameters:
 *       - $ref: '#/components/parameters/FileIdParam'
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Metadata'
 *       404:
 *         description: Metadata not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:file_id', validateRequest(fileIdsSchema), MetadataController.getMetadataByFileId);

/**
 * @swagger
 * /metadata/by-file-ids:
 *   post:
 *     tags:
 *       - Metadata
 *     summary: Get metadata by file IDs
 *     description: Retrieve metadata for multiple files based on an array of file IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_ids
 *             properties:
 *               file_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               file_ids: ["file_abc123", "file_def456", "file_xyz789"]
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Metadata'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/by-file-ids', MetadataController.getMetadataByFileIds);


/**
 * @swagger
 * /metadata/user/{uploader_id}:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get metadata by uploader ID
 *     description: Retrieve all metadata records uploaded by a specific user
 *     parameters:
 *       - $ref: '#/components/parameters/UploaderIdParam'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       200:
 *         description: User metadata records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/:uploader_id', validateQuery(paginationSchema), MetadataController.getMetadataByUploaderId);

/**
 * @swagger
 * /metadata/{uploader_id}/stat:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get user statistics
 *     description: Retrieve statistics for a specific user's uploads
 *     parameters:
 *       - $ref: '#/components/parameters/UploaderIdParam'
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStats'
 */
router.get('/:uploader_id/stat', MetadataController.getUserStats);

/**
 * @swagger
 * /metadata/{uploader_id}/{visibility}:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get metadata by uploader and visibility
 *     description: Retrieve metadata records for a specific user filtered by visibility
 *     parameters:
 *       - $ref: '#/components/parameters/UploaderIdParam'
 *       - $ref: '#/components/parameters/VisibilityParam'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       200:
 *         description: Filtered metadata records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid visibility value or query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:uploader_id/:visibility', validateQuery(paginationSchema), MetadataController.getUploaderMetadataByVisibility);

/**
 * @swagger
 * /metadata:
 *   post:
 *     tags:
 *       - Metadata
 *     summary: Create new metadata
 *     description: Create a new metadata record for a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMetadataRequest'
 *           example:
 *             file_id: "file_123456"
 *             file_url: "https://example.com/files/document.pdf"
 *             image_url: "https://example.com/thumbnails/document.jpg"
 *             title: "Sample Document"
 *             description: "This is a sample document for demonstration"
 *             tags: ["sample", "document", "demo"]
 *             category: "Education"
 *             subcategory: "Tutorial"
 *             pages: 25
 *             size_kb: 1024
 *             visibility: "public"
 *     responses:
 *       201:
 *         description: Metadata created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, validateRequest(createMetadataSchema), MetadataController.createMetadata);

/**
 * @swagger
 * /metadata/my/documents:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Get current user's documents
 *     description: Retrieve all metadata records uploaded by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - $ref: '#/components/parameters/SortQuery'
 *       - $ref: '#/components/parameters/OrderQuery'
 *     responses:
 *       200:
 *         description: User's documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/my/documents', authenticateToken, validateQuery(paginationSchema), MetadataController.getMyDocuments);

/**
 * @swagger
 * /metadata/{file_id}:
 *   put:
 *     tags:
 *       - Metadata
 *     summary: Update metadata
 *     description: Update metadata for a specific file (only by the uploader)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FileIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMetadataRequest'
 *           example:
 *             title: "Updated Document Title"
 *             description: "Updated description"
 *             tags: ["updated", "document"]
 *             category: "Updated Category"
 *             visibility: "private"
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Metadata not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:file_id', authenticateToken, validateRequest(updateMetadataSchema), MetadataController.updateMetadata);

/**
 * @swagger
 * /metadata/{file_id}:
 *   delete:
 *     tags:
 *       - Metadata
 *     summary: Delete metadata
 *     description: Delete metadata for a specific file (only by the uploader)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FileIdParam'
 *     responses:
 *       200:
 *         description: Metadata deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Metadata not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:file_id', authenticateToken, MetadataController.deleteMetadata);

/**
 * @swagger
 * /metadata/bulk-delete:
 *   post:
 *     tags:
 *       - Metadata
 *     summary: Bulk delete metadata
 *     description: Delete multiple metadata records at once (only by the uploader)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeleteRequest'
 *           example:
 *             file_ids: ["file_123", "file_456", "file_789"]
 *     responses:
 *       200:
 *         description: Bulk delete completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bulk delete completed"
 *                 deleted_count:
 *                   type: integer
 *                   example: 3
 *                 deleted_file_ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["file_123", "file_456", "file_789"]
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/bulk-delete', authenticateToken, validateRequest(bulkDeleteSchema), MetadataController.bulkDeleteMetadata);

module.exports = router;