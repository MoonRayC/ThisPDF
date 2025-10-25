const MetadataModel = require('../models/metadata.model');
const searchService = require('../services/search.service');

class MetadataController {
  async createMetadata(req, res, next) {
    try {
      const metadataData = {
        ...req.body,
        uploader_id: req.user.id
      };

      const metadata = await MetadataModel.create(metadataData);

      searchService.syncDocument('create', metadata.file_id, metadata);

      res.status(201).json({
        message: 'Metadata created successfully',
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetadataByFileId(req, res, next) {
    try {
      const { file_id } = req.params;
      const metadata = await MetadataModel.findByFileId(file_id);

      if (!metadata) {
        return res.status(404).json({ error: 'Metadata not found' });
      }

      res.json({
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetadataByFileIds(req, res, next) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({ error: 'file_ids must be a non-empty array' });
      }

      const metadataList = await MetadataModel.findByFileIds(file_ids);

      res.json({
        count: metadataList.length,
        data: metadataList
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetadataByUploaderId(req, res, next) {
    try {
      const { uploader_id } = req.params;
      const { page, limit, sort, order } = req.query;

      const result = await MetadataModel.findByUploaderId(uploader_id, {
        page, limit, sort, order
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyDocuments(req, res, next) {
    try {
      const { page, limit, sort, order } = req.query;

      const result = await MetadataModel.findMyDocuments(req.user.id, {
        page, limit, sort, order
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPublicMetadata(req, res, next) {
    try {
      const { page, limit, sort, order } = req.query;

      const result = await MetadataModel.findPublic({
        page, limit, sort, order
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPrivateMetadata(req, res, next) {
    try {
      const { page, limit, sort, order } = req.query;

      const result = await MetadataModel.findPrivate({
        page, limit, sort, order
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const { uploader_id } = req.params;
      const stats = await MetadataModel.getUserStats(uploader_id);

      res.json({
        uploader_id,
        ...stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploaderMetadataByVisibility(req, res, next) {
    try {
      const { uploader_id, visibility } = req.params;
      const { page, limit, sort, order } = req.query;

      if (!['public', 'private', 'friends'].includes(visibility)) {
        return res.status(400).json({ error: 'Invalid visibility value' });
      }

      const result = await MetadataModel.findByUploaderIdAndVisibility(
        uploader_id,
        visibility,
        { page, limit, sort, order }
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMetadata(req, res, next) {
    try {
      const { file_id } = req.params;

      // Get the existing metadata first for comparison
      const existingMetadata = await MetadataModel.findByFileId(file_id);
      if (!existingMetadata) {
        return res.status(404).json({ error: 'Metadata not found' });
      }

      // Check if user is authorized to update
      if (existingMetadata.uploader_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to update this metadata' });
      }

      const metadata = await MetadataModel.update(file_id, req.body, req.user.id);

      if (!metadata) {
        return res.status(404).json({ error: 'Metadata not found or unauthorized' });
      }

      // Sync to search service asynchronously (fire and forget)
      searchService.syncDocument('update', file_id, metadata);

      res.json({
        message: 'Metadata updated successfully',
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMetadata(req, res, next) {
    try {
      const { file_id } = req.params;

      // Get the existing metadata first for authorization check
      const existingMetadata = await MetadataModel.findByFileId(file_id);
      if (!existingMetadata) {
        return res.status(404).json({ error: 'Metadata not found' });
      }

      // Check if user is authorized to delete
      if (existingMetadata.uploader_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this metadata' });
      }

      const metadata = await MetadataModel.delete(file_id, req.user.id);

      if (!metadata) {
        return res.status(404).json({ error: 'Metadata not found or unauthorized' });
      }

      // Sync to search service asynchronously (fire and forget)
      searchService.syncDocument('delete', file_id);

      res.json({
        message: 'Metadata deleted successfully',
        data: metadata
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteMetadata(req, res, next) {
    try {
      const { file_ids } = req.body;

      if (!Array.isArray(file_ids) || file_ids.length === 0) {
        return res.status(400).json({ error: 'file_ids must be a non-empty array' });
      }

      // Get existing metadata for authorization check
      const existingMetadata = await MetadataModel.findByFileIds(file_ids);
      const userFileIds = existingMetadata
        .filter(meta => meta.uploader_id === req.user.id)
        .map(meta => meta.file_id);

      if (userFileIds.length === 0) {
        return res.status(404).json({ error: 'No authorized files found for deletion' });
      }

      // Only delete files that belong to the user
      const deletedIds = await MetadataModel.bulkDelete(userFileIds, req.user.id);

      // Sync to search service asynchronously (fire and forget)
      if (deletedIds.length > 0) {
        searchService.syncDocuments('delete', deletedIds);
      }

      res.json({
        message: 'Bulk delete completed',
        deleted_count: deletedIds.length,
        deleted_file_ids: deletedIds,
        skipped_count: file_ids.length - deletedIds.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk create metadata (useful for data migrations or bulk uploads)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async bulkCreateMetadata(req, res, next) {
    try {
      const { metadata_list } = req.body;

      if (!Array.isArray(metadata_list) || metadata_list.length === 0) {
        return res.status(400).json({ error: 'metadata_list must be a non-empty array' });
      }

      // Add uploader_id to each metadata object
      const metadataWithUploader = metadata_list.map(metadata => ({
        ...metadata,
        uploader_id: req.user.id
      }));

      const createdMetadata = await MetadataModel.bulkCreate(metadataWithUploader);

      // Sync to search service asynchronously (fire and forget)
      if (createdMetadata.length > 0) {
        searchService.syncDocuments('create', createdMetadata);
      }

      res.status(201).json({
        message: 'Bulk metadata creation completed',
        created_count: createdMetadata.length,
        data: createdMetadata
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resync metadata with search service (useful for data recovery)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async resyncMetadata(req, res, next) {
    try {
      const { file_ids } = req.body;

      let metadataToSync;
      
      if (file_ids && Array.isArray(file_ids) && file_ids.length > 0) {
        // Resync specific files
        metadataToSync = await MetadataModel.findByFileIds(file_ids);
        
        // Filter to only user's files
        metadataToSync = metadataToSync.filter(meta => meta.uploader_id === req.user.id);
      } else {
        // Resync all user's files
        const result = await MetadataModel.findMyDocuments(req.user.id, {
          page: 1,
          limit: 10000 // Large limit to get all documents
        });
        metadataToSync = result.data;
      }

      if (metadataToSync.length === 0) {
        return res.status(404).json({ error: 'No metadata found to resync' });
      }

      // Sync to search service asynchronously (fire and forget)
      searchService.syncDocuments('create', metadataToSync);

      res.json({
        message: 'Metadata resync initiated',
        resync_count: metadataToSync.length,
        file_ids: metadataToSync.map(meta => meta.file_id)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get search service health status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getSearchServiceHealth(req, res, next) {
    try {
      const isHealthy = await searchService.healthCheck();
      
      res.json({
        search_service_healthy: isHealthy,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MetadataController();