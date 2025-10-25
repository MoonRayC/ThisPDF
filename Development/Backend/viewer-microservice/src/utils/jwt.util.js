const jwt = require('jsonwebtoken');
const config = require('../config');

class JWTUtil {
  static verify(token) {
    try {
      const payload = jwt.verify(token, config.jwt.secret);
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static decode(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  static extractFromHeader(authHeader) {

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    const token = parts[1];
    return token;
  }
}

module.exports = JWTUtil;
