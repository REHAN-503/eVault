'use strict';

const { ZodError } = require('zod');
const logger = require('../utils/logger');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Central error handler — must be the LAST middleware registered.
 *
 * Catches all unhandled errors and returns a consistent API error response.
 * Distinguishes Zod validation errors, known operational errors,
 * and unknown/programmer errors.
 */
function errorHandler(err, _req, res, _next) {
  // Zod validation errors (from validateRequest middleware)
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details,
      },
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'File too large',
      error: {
        code: ERROR_CODES.FILE_TOO_LARGE,
        details: err.message,
      },
    });
  }

  // Multer unexpected field error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Unexpected file field',
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        details: err.message,
      },
    });
  }

  // Known operational errors (thrown intentionally with statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.errorCode || ERROR_CODES.INTERNAL_ERROR,
        details: err.details || '',
      },
    });
  }

  // Unknown / programmer errors
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: 'Internal server error',
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? err.message : '',
    },
  });
}

module.exports = errorHandler;
