const axios = require('axios');
const config = require('../config');

class MetadataService {
  static async getFileMetadata(fileId) {
    try {
      const url = `${config.services.metadata}/api/metadata/${fileId}`;

      const response = await axios.get(url, {
        timeout: 5000
      });

      return response.data.data;

    } catch (error) {
      console.error('[MetadataService] Error fetching metadata:', error.message);

      if (error.response) {
        console.error('[MetadataService] Response status:', error.response.status);
        if (error.response.status === 404) {
          throw new Error('File not found');
        }
        throw new Error(`Metadata service error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        console.error('[MetadataService] Request timed out');
        throw new Error('Metadata service timeout');
      } else {
        console.error('[MetadataService] Service unavailable or unknown error');
        throw new Error('Metadata service unavailable');
      }
    }
  }
}

module.exports = MetadataService;
