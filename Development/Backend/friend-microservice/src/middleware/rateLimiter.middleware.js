const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');

const createRateLimiter = (maxRequests, windowMs) =>
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    message: {
      message: 'Too many requests. Please try again later.',
    },
  });

module.exports = {
  createRateLimiter
};
