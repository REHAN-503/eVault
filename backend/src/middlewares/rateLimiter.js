'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * General-purpose rate limiter for all routes.
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests, please try again later',
      error: {
        code: ERROR_CODES.RATE_LIMIT,
        details: `Rate limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000}s`,
      },
    });
  },
});

/**
 * Stricter rate limiter for authentication routes.
 * Prevents brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: {
        code: ERROR_CODES.RATE_LIMIT,
        details: `Auth rate limit: ${config.authRateLimit.max} requests per ${config.authRateLimit.windowMs / 1000}s`,
      },
    });
  },
});

module.exports = { generalLimiter, authLimiter };
