'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * JWT authentication middleware.
 * Verifies the access token from the Authorization header,
 * attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(
      res,
      'Access token is required',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR,
      'Missing or malformed Authorization header. Expected: Bearer <token>'
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Access token has expired'
        : 'Invalid access token';

    return error(
      res,
      message,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR,
      err.message
    );
  }
}

module.exports = authenticate;
