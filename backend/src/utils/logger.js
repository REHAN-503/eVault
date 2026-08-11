'use strict';

/**
 * Structured logger for application-level events.
 * Morgan handles HTTP request logging; this module is for
 * errors, warnings, and informational messages from services.
 *
 * Outputs JSON in production for log aggregation compatibility;
 * human-readable format in development.
 */

const config = require('../config');
const loggerStore = require('./loggerStore');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[config.logging.level] ?? LOG_LEVELS.debug;
const isProduction = config.env === 'production';

/**
 * @param {'error'|'warn'|'info'|'debug'} level
 * @param {string} message
 * @param {object} [meta={}]
 */
function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] > currentLevel) {
    return;
  }

  const reqId = loggerStore.getStore();
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(reqId ? { requestId: reqId } : {}),
    ...meta,
  };

  if (isProduction) {
    const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
    stream.write(JSON.stringify(entry) + '\n');
  } else {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${reqId ? ` [ReqID: ${reqId}]` : ''}`;
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stream = level === 'error' || level === 'warn' ? console.error : console.log;
    stream(`${prefix} ${message}${metaStr}`);
  }
}

module.exports = {
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  info: (message, meta) => log('info', message, meta),
  debug: (message, meta) => log('debug', message, meta),
};
