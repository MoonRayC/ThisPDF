const jwt = require('jsonwebtoken');
const axios = require('axios');

class JWTService {
  /**
   * Verify JWT token locally (optional verification)
   * @param {string} token - JWT token
   * @returns {object} - Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string} - JWT token
   */
  static extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Get user information from Auth Service
   * @param {string} token - JWT token
   * @returns {object} - User information including UUID
   */
  static async getUserFromAuthService(token) {
    try {
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid token');
      }
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Auth service unavailable');
      }
      throw new Error('Auth service unavailable');
    }
  }

  /**
   * Validate and get user from token
   * @param {string} authHeader - Authorization header
   * @returns {object} - User information
   */
  static async validateAndGetUser(authHeader) {
    const token = this.extractToken(authHeader);
    return await this.getUserFromAuthService(token);
  }

  /**
   * Get user UUID from token
   * @param {string} authHeader - Authorization header
   * @returns {string} - User UUID
   */
  static async getUserUUID(authHeader) {
    const user = await this.validateAndGetUser(authHeader);
    return user.id;
  }
}

module.exports = JWTService;