'use strict';

/**
 * Zod schema validation middleware factory.
 *
 * Accepts a Zod schema and the request property to validate
 * ('body', 'query', or 'params'). On success, replaces the
 * request property with the parsed (coerced/transformed) data.
 * On failure, passes the ZodError to the error handler.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 * @returns {import('express').RequestHandler}
 */
function validateRequest(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      next(err); // Handled by errorHandler.js (ZodError branch)
    }
  };
}

module.exports = validateRequest;
