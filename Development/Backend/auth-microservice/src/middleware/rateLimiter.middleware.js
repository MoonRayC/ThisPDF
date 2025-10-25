const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redis');

/**
 * Factory for creating a Redis-backed rate limiter
 * @param {Object} options - Custom rate limit options
 * @returns {Function} Rate limit middleware
 */
const createRedisLimiter = (options) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    keyGenerator: (req) => req.user?.id || req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

/**
 * 🔒 Strict limiter for auth-sensitive endpoints (login/register)
 * Limits by email if available, otherwise falls back to IP
 */
const authLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: 'Too many login or register attempts. Please try again later.',
  },
});

/**
 * 📧 Limiter for resend verification code
 * Limits by email if available, otherwise IP
 */
const verificationLimiter = createRedisLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    message: 'Too many verification code requests. Please try again later.',
  },
});

/**
 * 🔄 Limiter for refresh token endpoint (IP-based)
 */
const refreshLimiter = createRedisLimiter({
  windowMs: 10 * 60 * 1000, 
  max: 20,
  keyGenerator: (req) => req.ip, 
  message: {
    message: 'Too many token refresh requests. Please wait and try again.',
  },
});

/**
 * 🌐 General looser limiter (IP-based)
 */
const looseLimiter = createRedisLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    message: 'Too many requests. Please slow down.',
  },
});

module.exports = {
  authLimiter,
  verificationLimiter,
  refreshLimiter,
  looseLimiter,
};
