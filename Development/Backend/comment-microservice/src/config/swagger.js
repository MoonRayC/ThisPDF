const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Comment Microservice API',
      version: '1.0.0',
      description: 'A comprehensive API for managing comments, replies, and reactions on files',
      },
    servers: [
      {
        url: 'http://localhost:3007/api',
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
