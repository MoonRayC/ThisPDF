const axios = require('axios');

class SearchService {
  constructor() {
    this.baseURL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3006';
    this.timeout = parseInt(process.env.SEARCH_SERVICE_TIMEOUT) || 5000;
    this.retryAttempts = parseInt(process.env.SEARCH_SERVICE_RETRY_ATTEMPTS) || 3;
    this.retryDelay = parseInt(process.env.SEARCH_SERVICE_RETRY_DELAY) || 1000;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'metadata-service'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async indexDocument(document) {
    const payload = {
      file_id: document.file_id,
      title: document.title,
      description: document.description || '',
      tags: document.tags || [],
      category: document.category || '',
      subcategory: document.subcategory || '',
      visibility: document.visibility,
      uploader_id: document.uploader_id,
      created_at: document.created_at,
      updated_at: document.updated_at
    };

    return this._executeWithRetry(async () => {
      const response = await this.client.post('/api/search/index', payload);
      return response.data;
    }, 'indexDocument', document.file_id);
  }

  /**
   * Update a document in the search service
   * @param {string} fileId - File ID
   * @param {Object} document - Updated document metadata
   * @returns {Promise<Object>} - Search service response
   */
  async updateDocument(fileId, document) {
    const payload = {
      title: document.title,
      description: document.description || '',
      tags: document.tags || [],
      category: document.category || '',
      subcategory: document.subcategory || '',
      visibility: document.visibility,
      updated_at: document.updated_at
    };

    return this._executeWithRetry(async () => {
      const response = await this.client.put(`/api/search/update/index/${fileId}`, payload);
      return response.data;
    }, 'updateDocument', fileId);
  }

  /**
   * Delete a document from the search service
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} - Search service response
   */
  async deleteDocument(fileId) {
    return this._executeWithRetry(async () => {
      const response = await this.client.delete(`/api/search/delete/index/${fileId}`);
      return response.data;
    }, 'deleteDocument', fileId);
  }

  /**
   * Bulk index multiple documents
   * @param {Array} documents - Array of document metadata
   * @returns {Promise<Object>} - Search service response
   */
  async bulkIndexDocuments(documents) {
    const payload = documents.map(doc => ({
      file_id: doc.file_id,
      title: doc.title,
      description: doc.description || '',
      tags: doc.tags || [],
      category: doc.category || '',
      subcategory: doc.subcategory || '',
      visibility: doc.visibility,
      uploader_id: doc.uploader_id,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));

    return this._executeWithRetry(async () => {
      const response = await this.client.post('/api/search/bulk-index', payload);
      return response.data;
    }, 'bulkIndexDocuments', `${documents.length} documents`);
  }

  /**
   * Bulk delete multiple documents
   * @param {Array} fileIds - Array of file IDs
   * @returns {Promise<Object>} - Search service response
   */
  async bulkDeleteDocuments(fileIds) {
    const payload = { file_ids: fileIds };

    return this._executeWithRetry(async () => {
      const response = await this.client.post('/api/search/bulk-delete', payload);
      return response.data;
    }, 'bulkDeleteDocuments', `${fileIds.length} documents`);
  }

  /**
   * Execute a function with retry logic
   * @private
   */
  async _executeWithRetry(fn, operation, identifier) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Don't retry on 4xx errors (client errors)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        await this._sleep(this.retryDelay * attempt);
      }
    }
  }

  /**
   * Sleep utility for retry delays
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fireAndForget(fn, operation, identifier) {
    try {
      setImmediate(async () => {
        try {
          await fn();
        } catch (error) {
        }
      });
    } catch (error) {
    }
  }

  syncDocument(operation, fileId, document = null) {
    const identifier = `${operation}:${fileId}`;

    switch (operation) {
      case 'create':
        this.fireAndForget(
          () => this.indexDocument(document),
          'syncDocument:create',
          identifier
        );
        break;

      case 'update':
        this.fireAndForget(
          () => this.updateDocument(fileId, document),
          'syncDocument:update',
          identifier
        );
        break;

      case 'delete':
        this.fireAndForget(
          () => this.deleteDocument(fileId),
          'syncDocument:delete',
          identifier
        );
        break;

      default:
    }
  }

  /**
   * Sync multiple documents to search service (fire and forget)
   * @param {string} operation - 'create' or 'delete'
   * @param {Array} data - Array of documents or file IDs
   */
  syncDocuments(operation, data) {
    const identifier = `${operation}:${data.length}_documents`;

    switch (operation) {
      case 'create':
        this.fireAndForget(
          () => this.bulkIndexDocuments(data),
          'syncDocuments:create',
          identifier
        );
        break;

      case 'delete':
        this.fireAndForget(
          () => this.bulkDeleteDocuments(data),
          'syncDocuments:delete',
          identifier
        );
        break;

      default:
    }
  }

  /**
   * Health check for search service
   * @returns {Promise<boolean>} - Service health status
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/search/stats', { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SearchService();