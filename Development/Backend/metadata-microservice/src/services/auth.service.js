const axios = require('axios');

class AuthService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL;
  }

  async verifyUser(token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid token');
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Auth service unavailable');
      }

      throw new Error('Authentication failed');
    }
  }
}

module.exports = new AuthService();