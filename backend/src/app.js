'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const requestLogger = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const v1Routes = require('./routes/v1');
const { setupSwagger } = require('./docs/swagger');
const prisma = require('./config/database');
const { success, error } = require('./utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('./constants');
const requestId = require('./middlewares/requestId');

const app = express();
app.set('trust proxy', 1);

// ---- Security ----
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---- Parsing ----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---- Logging & Request Context ----
app.use(requestId);
app.use(requestLogger);

// ---- Rate Limiting (general) ----
app.use(generalLimiter);

// ---- Swagger / API Docs ----
setupSwagger(app);

// ---- Health Check ----
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check — verifies server and DB connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy (DB unreachable)
 */
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return success(res, 'Service is healthy', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    return error(
      res,
      'Service is unhealthy',
      503,
      ERROR_CODES.INTERNAL_ERROR,
      'Database connection failed'
    );
  }
});

// ---- API Routes ----
app.use('/api/v1', v1Routes);

// ---- 404 Handler ----
app.use((_req, res) => {
  return error(
    res,
    'Route not found',
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND,
    'The requested endpoint does not exist'
  );
});

// ---- Central Error Handler (MUST be last) ----
app.use(errorHandler);

module.exports = app;
