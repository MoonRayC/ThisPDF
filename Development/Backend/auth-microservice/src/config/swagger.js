const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Micro-Service API Documentation',
      version: '1.0.0',
      description: 'A complete Node.js authentication microservice with JWT tokens, email verification, password reset, social login, and device management.',
    },
    servers: [
      {
        url: 'http://localhost:3001/api/auth',
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
