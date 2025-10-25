const axios = require('axios');
const config = require('../config');

class UploadService {
  static async getFileUrl(fileId, visibility = 'private', token = null) {
    try {
      const url = `${config.services.upload}/api/upload/files/${fileId}/url?visibility=${visibility}&expires=${config.settings.pdfViewExpiresIn}`;

      const headers = {};

      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`;
      }

      const response = await axios.get(url, {
        headers,
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('[UploadService] Error fetching file URL:', error.message);

      if (error.response) {
        console.error('[UploadService] Response status:', error.response.status);
        if (error.response.status === 404) {
          throw new Error('File not found in upload service');
        }
        throw new Error(`Upload service error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload service timeout');
      } else {
        throw new Error('Upload service unavailable');
      }
    }
  }
}

module.exports = UploadService;
