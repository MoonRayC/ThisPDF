const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

class JWTService {
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async getUserFromAuthService(token) {
    try {
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid token');
      }
      throw new Error('Auth service unavailable');
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header');
    }
    return authHeader.substring(7);
  }
}

module.exports = JWTService;