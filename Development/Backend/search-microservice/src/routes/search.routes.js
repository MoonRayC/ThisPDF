const express = require('express');
const router = express.Router();

const searchController = require('../controllers/search.controller');
const { 
  validateDocument, 
  validateSearchQuery,
  validateSuggestionsQuery, 
  validateBulkIndex,
  validateFileId 
} = require('../middleware/validation.middleware');
const { asyncHandler } = require('../middleware/errorHandler.middleware');

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search documents
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Full-text search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           example: math,science
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, private, friends]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         default: 0
 *     responses:
 *       200:
 *         description: List of matching documents
 */
router.get('/', 
  validateSearchQuery,
  asyncHandler(searchController.search)
);

/**
 * @swagger
 * /search/index:
 *   post:
 *     summary: Index a new document
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [file_id, title, visibility]
 *             properties:
 *               file_id:
 *                 type: string
 *               title:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private, friends]
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document indexed successfully
 */
router.post('/index',
  validateDocument,
  asyncHandler(searchController.indexDocument)
);

/**
 * @swagger
 * /search/update/index/{file_id}:
 *   put:
 *     summary: Update a document in the search index
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique file ID of the document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private, friends]
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       404:
 *         description: Document not found
 */
router.put('/update/index/{file_id}',
  validateFileId,
  validateDocument,
  asyncHandler(searchController.updateDocument)
);

/**
 * @swagger
 * /search/delete/index/{file_id}:
 *   delete:
 *     summary: Delete a document from the search index
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/delete/index/:file_id',
  validateFileId,
  asyncHandler(searchController.deleteDocument)
);

/**
 * @swagger
 * /bulk-index:
 *   post:
 *     summary: Bulk index multiple documents
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [file_id, title, visibility]
 *               properties:
 *                 file_id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 visibility:
 *                   type: string
 *                   enum: [public, private, friends]
 *                 description:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 category:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk indexing completed
 */
router.post('/bulk-index',
  validateBulkIndex,
  asyncHandler(searchController.bulkIndex)
);

/**
 * @swagger
 * /search/stats:
 *   get:
 *     summary: Get statistics for the current index
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Index stats returned
 */
router.get('/stats',
  asyncHandler(searchController.getStats)
);

/**
 * @swagger
 * /search/suggestions:
 *   get:
 *     summary: Get search suggestions based on query
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Search suggestions returned
 */
router.get('/suggestions',
  validateSuggestionsQuery,
  asyncHandler(searchController.getSuggestions)
);

/**
 * @swagger
 * /search/bulk-delete:
 *   post:
 *     summary: Bulk delete documents from the search index
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [file_ids]
 *             properties:
 *               file_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk deletion completed
 *       400:
 *         description: Invalid input
 */
router.post('/bulk-delete',
  asyncHandler(searchController.bulkDeleteDocuments)
);

module.exports = router;