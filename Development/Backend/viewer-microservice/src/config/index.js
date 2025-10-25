require('dotenv').config();

const config = {
  port: process.env.PORT || 3008,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key'
  },
  
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth:3001',
    upload: process.env.UPLOAD_SERVICE_URL || 'http://upload:3003',
    metadata: process.env.METADATA_SERVICE_URL || 'http://metadata:3004',
    friend: process.env.FRIEND_SERVICE_URL || 'http://friend:3011'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  settings: {
    pdfViewExpiresIn: parseInt(process.env.PDF_VIEW_EXPIRES_IN) || 3600 
  }
};

module.exports = config;