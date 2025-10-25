const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redis');

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

module.exports = {
  profileCreateLimiter: createRedisLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: 'Too many profile creation attempts. Try again later.' }
  }),
  profileUpdateLimiter: createRedisLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { message: 'Too many profile updates. Try again later.' }
  }),
  lastActiveLimiter: createRedisLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: 'Too many activity updates. Please slow down.' }
  }),
  profileDeleteLimiter: createRedisLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    message: { message: 'Too many profile delete attempts. Try again tomorrow.' }
  }),
  profileReadLimiter: createRedisLimiter({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: { message: 'Too many profile read requests. Please wait.' }
  }),
  profileListLimiter: createRedisLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: 'Too many list requests. Please slow down.' }
  })
};
