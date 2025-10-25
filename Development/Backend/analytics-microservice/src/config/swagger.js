const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics Micro-Service API Documentation',
      version: '1.0.0',
      description: 'A comprehensive analytics API for PDF management platform providing insights into user behavior, content performance, and platform metrics.',
    },
    servers: [
      {
        url: 'http://localhost:3009/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', 
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = require('swagger-jsdoc')(options);
module.exports = swaggerSpec;
