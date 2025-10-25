const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
});

// ✅ Connected
redis.on('connect', () => {
  console.log('🟢 [Redis] Connecting...');
});

redis.on('ready', () => {
  console.log('✅ [Redis] Connected and ready to use');
});

// ❌ Connection Error
redis.on('error', (err) => {
  console.error('❌ [Redis] Connection error:', err.message);
});

// 🧨 Reconnecting
redis.on('reconnecting', () => {
  console.warn('🔄 [Redis] Reconnecting...');
});

// 🔌 End
redis.on('end', () => {
  console.log('🔚 [Redis] Connection closed');
});

module.exports = redis;
