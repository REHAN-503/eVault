'use strict';

const { error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * RBAC authorization middleware factory.
 * Accepts one or more Role values and returns middleware
 * that blocks requests from users without a matching role.
 *
 * Must be used AFTER `authenticate` middleware.
 *
 * @param  {...string} allowedRoles - Role enum values (e.g. 'ADMIN', 'LAWYER')
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(
        res,
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR,
        'No authenticated user found on request'
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        'Insufficient permissions',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR,
        `Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  };
}

module.exports = requireRole;
