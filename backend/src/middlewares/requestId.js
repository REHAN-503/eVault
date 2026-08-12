'use strict';

const { v4: uuidv4 } = require('uuid');
const loggerStore = require('../utils/loggerStore');

/**
 * Middleware to assign a unique request ID (Correlation ID) to every incoming request.
 * It will attach the ID to `req.id` and add an `X-Request-ID` response header.
 */
function requestIdMiddleware(req, res, next) {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);

  loggerStore.run(reqId, () => {
    next();
  });
}

module.exports = requestIdMiddleware;
