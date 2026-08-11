'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'eVault API',
      version: '1.0.0',
      description:
        'Blockchain-Based eVault for Legal Records — Backend API Gateway (SIH1284). ' +
        'This API serves as the central orchestration layer between React frontend, ' +
        'PostgreSQL, Hyperledger Fabric, IPFS storage, and Court CIS integration.',
      contact: {
        name: 'eVault Team',
        url: 'https://github.com/REHAN-503/evault-backend',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                details: { type: 'string' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Integration', description: 'External system integration (CIS)' },
    ],
  },
  apis: ['./src/routes/v1/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI on the given Express app.
 * @param {import('express').Application} app
 */
function setupSwagger(app) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'eVault API Documentation',
    })
  );

  // Raw JSON spec endpoint for tooling
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger, swaggerSpec };
