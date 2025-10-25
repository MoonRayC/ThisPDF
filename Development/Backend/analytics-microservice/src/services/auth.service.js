const axios = require('axios');
const config = require('../config');

class AuthService {
  constructor() {
    this.authServiceUrl = config.auth.serviceUrl;
    this.timeout = config.auth.timeout;
  }

  async validateToken(token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid token');
      }
      
      console.error('Auth service error:', error.message);
      throw new Error('Authentication service unavailable');
    }
  }

  async getUserById(userId, token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      
      console.error('Auth service error:', error.message);
      throw new Error('Authentication service unavailable');
    }
  }
}

module.exports = new AuthService();