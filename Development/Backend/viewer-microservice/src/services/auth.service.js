const axios = require('axios');
const config = require('../config');

class AuthService {
  static async getUserFromToken(token) {
    try {
      const response = await axios.get(`${config.services.auth}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Auth service returned an error
        throw new Error(`Auth service error: ${error.response.status}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Auth service timeout');
      } else {
        throw new Error('Auth service unavailable');
      }
    }
  }
}

module.exports = AuthService;