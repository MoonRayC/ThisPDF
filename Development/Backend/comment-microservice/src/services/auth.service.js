const axios = require('axios');

class AuthService {
  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  async verifyToken(token) {
    try {
      const response = await axios.get(`${this.authServiceUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 
      });

      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          email: response.data.email
        };
      }

      return null;
    } catch (error) {
      console.error('Auth service error:', error.message);
      
      if (error.response && error.response.status === 401) {
        return null;
      }
      
      throw new Error('Authentication service unavailable');
    }
  }

  async validateUser(userId, token) {
    try {
      const userData = await this.verifyToken(token);
      return userData && userData.id === userId;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new AuthService();