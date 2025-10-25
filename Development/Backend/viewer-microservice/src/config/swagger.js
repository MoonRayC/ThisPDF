const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Viewer Microservice API',
      version: '1.0.0',
      description: 'Secure PDF viewer microservice with access control. Handles public/private access, verifies user identity, and integrates with other services.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:3005/api`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [ './src/routes/*.js' ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;