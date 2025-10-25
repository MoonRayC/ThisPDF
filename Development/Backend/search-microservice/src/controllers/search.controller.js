const searchService = require('../services/search.service');

class SearchController {
  // Search documents
  async search(req, res, next) {
    try {
      const { q, category, tags, visibility, limit = 20, offset = 0 } = req.query;

      const results = await searchService.searchDocuments({
        query: q,
        category,
        tags,
        visibility,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: results.hits,
        pagination: {
          total: results.estimatedTotalHits,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: results.estimatedTotalHits > (parseInt(offset) + parseInt(limit))
        },
        processingTime: results.processingTimeMs
      });
    } catch (error) {
      next(error);
    }
  }

  // Index a new document
  async indexDocument(req, res, next) {
    try {
      const documentData = req.body;

      const result = await searchService.indexDocument(documentData);

      res.status(201).json({
        success: true,
        message: 'Document indexed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Update an existing document
  async updateDocument(req, res, next) {
    try {
      const { file_id } = req.params;
      const documentData = req.body;

      const result = await searchService.updateDocument(file_id, documentData);

      res.json({
        success: true,
        message: 'Document updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a document
  async deleteDocument(req, res, next) {
    try {
      const { file_id } = req.params;

      const result = await searchService.deleteDocument(file_id);

      res.json({
        success: true,
        message: 'Document deleted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get search statistics
  async getStats(req, res, next) {
    try {
      const stats = await searchService.getIndexStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk index documents
  async bulkIndex(req, res, next) {
    try {
      const documents = req.body;

      if (!Array.isArray(documents)) {
        return res.status(400).json({
          success: false,
          message: 'Documents must be an array'
        });
      }

      const result = await searchService.bulkIndexDocuments(documents);

      res.json({
        success: true,
        message: `${documents.length} documents indexed successfully`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get search suggestions
  async getSuggestions(req, res, next) {
    try {
      const { q, limit = 5, visibility = 'public' } = req.query;

      const suggestions = await searchService.getSearchSuggestions(
        q,
        parseInt(limit),
        visibility
      );

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete documents
  async bulkDeleteDocuments(req, res, next) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'file_ids must be a non-empty array'
        });
      }

      const result = await searchService.bulkDelete(file_ids);

      res.json({
        success: true,
        message: 'Bulk deletion completed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
