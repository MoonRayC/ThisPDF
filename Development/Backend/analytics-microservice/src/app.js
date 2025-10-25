const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const analyticsRoutes = require('./routes/analytics.routes');
const eventsRoutes = require('./routes/events.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');

const app = express();

// Helmet security
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

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000'];

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));
app.use(compression());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'analytics-microservice',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Analytics Microservice',
  })
);

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/events', eventsRoutes);

// Welcome page
app.get('/', (_req, res) => {
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

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
