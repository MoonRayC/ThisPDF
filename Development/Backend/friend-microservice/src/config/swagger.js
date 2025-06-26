const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Friends Microservice API',
      version: '1.0.0',
      description: 'A Node.js microservice for managing friendships, friend requests, blocks, and recommendations using MongoDB',
      },
    servers: [
      {
        url: 'http://localhost:3011/api',
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
