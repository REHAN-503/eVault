'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

/**
 * Integration Service — MOCK CIS Adapter
 *
 * Simulates syncing document references with an external
 * Court Case-Management System (CIS) via REST/SOAP.
 *
 * This is permanently mocked for the hackathon demo — it demonstrates
 * the interoperability requirement from the architecture doc without
 * needing a real CIS endpoint.
 *
 * @see docs/CONTRACTS.md for the shared interface spec
 */

/**
 * Sync a document reference with the external CIS.
 * @param {object} params
 * @param {string} params.documentId - eVault document ID
 * @param {string} params.caseNumber - CIS case number
 * @param {string} params.courtCode - Court identifier code
 * @returns {Promise<import('../../types/common.types').CISSyncResult>}
 */
async function syncWithCIS({ documentId, caseNumber, courtCode }) {
  logger.info('// MOCK: integration.syncWithCIS', { documentId, caseNumber, courtCode });

  // MOCK: Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  // MOCK: Return a realistic case record
  return {
    caseId: `CIS-${uuidv4().substring(0, 8).toUpperCase()}`,
    status: 'SYNCED',
    syncedAt: new Date().toISOString(),
    caseRecord: {
      caseNumber,
      courtCode,
      courtName: getMockCourtName(courtCode),
      documentRef: documentId,
      filingDate: new Date().toISOString().split('T')[0],
      status: 'REGISTERED',
      nextHearingDate: getFutureDate(30),
      judge: 'Hon. Justice Mock Presiding',
      parties: {
        petitioner: 'Petitioner (via eVault)',
        respondent: 'Respondent (via eVault)',
      },
    },
  };
}

/**
 * MOCK helper: returns a court name based on code.
 */
function getMockCourtName(courtCode) {
  const courts = {
    'SC': 'Supreme Court of India',
    'DHC': 'Delhi High Court',
    'BHC': 'Bombay High Court',
    'MHC': 'Madras High Court',
    'KHC': 'Karnataka High Court',
    'DIST01': 'District Court, Central Delhi',
  };
  return courts[courtCode] || `District Court (${courtCode})`;
}

/**
 * MOCK helper: returns an ISO date string N days in the future.
 */
function getFutureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

module.exports = {
  syncWithCIS,
};
