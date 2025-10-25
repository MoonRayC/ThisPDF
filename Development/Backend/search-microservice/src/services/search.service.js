const { getIndex, initializeIndex, testConnection } = require('../config/meiliClient');
const { SearchError, IndexError, NotFoundError } = require('../middleware/errorHandler.middleware');

class SearchService {
  constructor() {
    this.index = null;
    this.initializeService();
  }

  async initializeService() {
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to MeiliSearch');
      }
      this.index = await initializeIndex();
    } catch (error) {
      throw new SearchError('Search service initialization failed');
    }
  }

  async ensureIndex() {
    if (!this.index) {
      this.index = getIndex();
    }
    return this.index;
  }

  async searchDocuments(params) {
    try {
      const index = await this.ensureIndex();
      const { query, category, tags, visibility, limit, offset } = params;

      const filters = [];

      if (visibility) {
        filters.push(`visibility = "${visibility}"`);
      }

      if (category) {
        filters.push(`category = "${category}"`);
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        const tagFilters = tagArray.map(tag => `tags = "${tag}"`);
        if (tagFilters.length > 0) {
          filters.push(`(${tagFilters.join(' OR ')})`);
        }
      }

      const searchOptions = {
        limit,
        offset,
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        attributesToHighlight: ['title', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        attributesToCrop: ['description'],
        cropLength: 200,
        showMatchesPosition: true
      };

      const results = await index.search(query || '', searchOptions);

      return {
        hits: results.hits,
        estimatedTotalHits: results.estimatedTotalHits,
        processingTimeMs: results.processingTimeMs,
        query: results.query,
        facetDistribution: results.facetDistribution
      };
    } catch (error) {
      throw new SearchError('Failed to search documents');
    }
  }

  async indexDocument(documentData) {
    try {
      const index = await this.ensureIndex();

      const document = {
        ...documentData,
        created_at: documentData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await index.addDocuments([document]);

      return {
        taskUid: result.taskUid,
        indexUid: result.indexUid,
        status: result.status,
        file_id: document.file_id
      };
    } catch (error) {
      throw new IndexError('Failed to index document');
    }
  }

  async updateDocument(file_id, documentData) {
    try {
      const index = await this.ensureIndex();

      try {
        await index.getDocument(file_id);
      } catch (error) {
        if (error.code === 'document_not_found') {
          throw new NotFoundError(`Document with ID ${file_id} not found`);
        }
        throw error;
      }

      const document = {
        ...documentData,
        file_id,
        updated_at: new Date().toISOString()
      };

      const result = await index.updateDocuments([document]);

      return {
        taskUid: result.taskUid,
        indexUid: result.indexUid,
        status: result.status,
        file_id
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new IndexError('Failed to update document');
    }
  }

  async deleteDocument(file_id) {
    try {
      const index = await this.ensureIndex();

      const result = await index.deleteDocument(file_id);

      return {
        taskUid: result.taskUid,
        indexUid: result.indexUid,
        status: result.status,
        file_id
      };
    } catch (error) {
      throw new IndexError('Failed to delete document');
    }
  }

  async bulkDelete(fileIds) {
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error('fileIds must be a non-empty array');
    }

    try {
      const index = await this.ensureIndex();
      const result = await index.deleteDocuments(fileIds);

      return {
        taskUid: result.taskUid,
        indexUid: result.indexUid,
        status: result.status,
        deleted_file_ids: fileIds
      };
    } catch (error) {
      throw new IndexError('Failed to bulk delete documents from search index');
    }
  }

  async getSearchSuggestions(query, limit = 5, visibility = 'public') {
    try {
      const index = await this.ensureIndex();

      const filters = visibility ? `visibility = "${visibility}"` : undefined;

      const results = await index.search(query, {
        limit,
        attributesToRetrieve: ['title', 'category'],
        attributesToHighlight: ['title'],
        filter: filters
      });

      return results.hits.map(hit => ({
        title: hit.title,
        category: hit.category,
        highlighted: hit._formatted?.title || hit.title
      }));
    } catch (error) {
      throw new SearchError('Failed to get search suggestions');
    }
  }

  async bulkIndexDocuments(documents) {
    try {
      const index = await this.ensureIndex();

      if (!Array.isArray(documents) || documents.length === 0) {
        return { message: 'No documents to index' };
      }

      const timestampedDocs = documents.map(doc => ({
        ...doc,
        created_at: doc.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const result = await index.addDocuments(timestampedDocs);

      return {
        taskUid: result.taskUid,
        indexUid: result.indexUid,
        status: result.status,
        count: timestampedDocs.length
      };
    } catch (error) {
      throw new IndexError('Failed to bulk index documents');
    }
  }

  async getIndexStats() {
    try {
      const index = await this.ensureIndex();
      const stats = await index.getStats();

      return {
        uid: stats.uid,
        primaryKey: stats.primaryKey,
        documentCount: stats.documentCount,
        fieldDistribution: stats.fieldDistribution,
        sizeInBytes: stats.sizeInBytes,
        lastUpdate: stats.lastUpdate
      };
    } catch (error) {
      throw new SearchError('Failed to get index statistics');
    }
  }
}

module.exports = new SearchService();
