require('dotenv').config();

const config = {
  port: process.env.PORT || 3009,
  
  kafka: {
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['kafka:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'analytics-service',
    groupId: process.env.KAFKA_GROUP_ID || 'analytics-group',
    retry: {
      retries: parseInt(process.env.KAFKA_RETRIES) || 3,
      initialRetryTime: parseInt(process.env.KAFKA_INITIAL_RETRY_TIME) || 100,
      maxRetryTime: parseInt(process.env.KAFKA_MAX_RETRY_TIME) || 30000
    }
  },
  
  clickhouse: {
    host: process.env.CLICKHOUSE_HOST,
    port: process.env.CLICKHOUSE_PORT || 8123,
    username: process.env.CLICKHOUSE_USERNAME || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: process.env.CLICKHOUSE_DATABASE || 'analytics'
  },
  
  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL || 'http://auth:3001',
    timeout: parseInt(process.env.AUTH_TIMEOUT) || 5000
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;