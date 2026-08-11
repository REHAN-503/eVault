'use strict';

/**
 * Standardized API response helpers.
 * Every controller uses these — never construct response JSON manually.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} [data=null]
 * @param {number} [statusCode=200]
 */
function success(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {string} [code='INTERNAL_ERROR']
 * @param {string} [details='']
 */
function error(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = '') {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
}

module.exports = { success, error };
