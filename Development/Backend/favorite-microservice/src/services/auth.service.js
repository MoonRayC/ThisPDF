const axios = require('axios');

class AuthService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3008';
  }

  /**
   * Get user information from auth service
   * @param {string} token - JWT access token
   * @returns {Promise<Object>} User object with id and email
   */
  async getUserFromToken(token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Auth service returned an error response
        throw new Error(`Authentication failed: ${error.response.status}`);
      } else if (error.request) {
        // Network error
        throw new Error('Auth service unavailable');
      } else {
        // Other error
        throw new Error('Authentication error');
      }
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT access token
   * @returns {Promise<boolean>} True if token is valid
   */
  async validateToken(token) {
    try {
      await this.getUserFromToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new AuthService();