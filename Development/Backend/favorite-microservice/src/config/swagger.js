const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Favorite Microservice API',
      version: '1.0.0',
      description: 'A comprehensive API for managing user favorites, including PDFs and Users',
      },
    servers: [
      {
        url: 'http://localhost:3008/api',
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
