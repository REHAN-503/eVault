'use strict';

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const prisma = require('./config/database');

async function main() {
  try {
    // Verify database connectivity before starting
    await prisma.$connect();
    logger.info('Database connection established');

    app.listen(config.port, () => {
      logger.info(`eVault API server running`, {
        port: config.port,
        env: config.env,
        docs: `http://localhost:${config.port}/api-docs`,
        health: `http://localhost:${config.port}/health`,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

main();
