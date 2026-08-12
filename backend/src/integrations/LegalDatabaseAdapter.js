'use strict';

const logger = require('../utils/logger');

/**
 * Integration Service — MOCK Legal Database Adapter
 *
 * Simulates querying and synchronizing with an external
 * government or institutional legal database.
 *
 * This is permanently mocked for the hackathon demo — it demonstrates
 * the interoperability requirement from the architecture doc without
 * needing a real endpoint.
 */

/**
 * Query external legal database for document precedence or metadata.
 * @param {string} caseNumber - The case number to query
 * @returns {Promise<object>}
 */
async function queryExternalDatabase(caseNumber) {
  logger.info('// MOCK: integration.LegalDatabaseAdapter.queryExternalDatabase', { caseNumber });

  // MOCK: Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    status: 'FOUND',
    source: 'National Legal Database Mock',
    records: [
      {
        caseNumber,
        summary: 'Historical precedence record for the given case.',
        judgementDate: '2023-05-12',
      },
    ],
  };
}

module.exports = {
  queryExternalDatabase,
};
