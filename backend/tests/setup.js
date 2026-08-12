'use strict';

/**
 * Jest setup — runs before each test suite.
 * Sets test-specific environment variables.
 */

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://evault:evault_secret@localhost:5432/evault_test?schema=public';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '0'; // Let OS pick a port
process.env.RATE_LIMIT_MAX = '10000';
process.env.AUTH_RATE_LIMIT_MAX = '10000';
