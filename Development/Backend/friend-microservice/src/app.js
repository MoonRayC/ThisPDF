const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

const friendRoutes = require('./routes/friend.routes');

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));
app.use(morgan('combined'));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  const database = require('./config/database');
  
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'friends-microservice',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    database: {
      status: database.isConnected() ? 'connected' : 'disconnected'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    }
  };

  res.status(200).json(healthCheck);
});

// API routes
app.use('/api/friends', friendRoutes);

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Friend Microservice',
  })
);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Friends Microservice',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Microservice for managing user friendships, friend requests, and social connections',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      friends: '/api/friends'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send(`
    <pre><code>
  ==================================================
     ________  ______  _________    __   __   
    |__  ___ \\/ ____ \\/ _____/ /_  /_/__/ /_______
      / /__/ / /   / / /    / __ \\__ /_  __/ ____/
     / ___  / /___/ / /____/ /_/ / /  / / (___  )
    /_/  /_/_______/______/_____/_/  /_/ /_____/
                    O N L I N E
  ==================================================
    </code></pre>
  `);
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;