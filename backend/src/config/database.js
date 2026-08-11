'use strict';

const { PrismaClient } = require('@prisma/client');

/**
 * Singleton Prisma client instance.
 *
 * In development, we store the client on `globalThis` to survive
 * hot-reloads without exhausting DB connections.
 * In production, a single instance per process is sufficient.
 */

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
