const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Profile Micro-Service API Documentation',
      version: '1.0.0',
      description: 'A complete Node.js microservice for managing user profile data with PostgreSQL, JWT authentication, and admin-controlled Swagger docs.',
    },
    servers: [
      {
        url: 'http://localhost:3002/api',
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
  apis: ['./src/routes/*.js', './src/controller/*.js'],
};

const swaggerSpec = require('swagger-jsdoc')(options);
module.exports = swaggerSpec;
