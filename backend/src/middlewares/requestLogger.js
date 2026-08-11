'use strict';

const morgan = require('morgan');
const config = require('../config');

/**
 * Morgan HTTP request logger wrapper.
 * Logs correlation ID, HTTP method, URL, status code, and response time.
 */

// Define a custom token for the request ID
morgan.token('reqId', (req) => req.id || '-');

const format = config.env === 'production' 
  ? '{"timestamp":":date[iso]","reqId":":reqId","method":":method","url":":url","status"::status,"responseTime":":response-time ms","remoteAddr":":remote-addr"}'
  : '[:date[iso]] [INFO] [ReqID: :reqId] :method :url :status :response-time ms - :res[content-length]';

const requestLogger = morgan(format, {
  skip: (_req, res) => {
    // In production, skip successful requests to reduce log noise
    if (config.env === 'production') {
      return res.statusCode < 400;
    }
    return false;
  },
});

module.exports = requestLogger;
