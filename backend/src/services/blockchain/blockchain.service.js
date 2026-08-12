'use strict';

const logger = require('../../utils/logger');

/**
 * Blockchain Service — delegates to either the real Hyperledger Fabric gateway
 * or the in-memory mock, depending on the USE_BLOCKCHAIN_MOCK env var.
 *
 * Local dev / demo  → USE_BLOCKCHAIN_MOCK=true  (default if unset)
 * Production / WSL2 → USE_BLOCKCHAIN_MOCK=false
 */
const useMock = process.env.USE_BLOCKCHAIN_MOCK !== 'false';

let gateway;
if (useMock) {
  logger.info('Blockchain service: using IN-MEMORY MOCK (set USE_BLOCKCHAIN_MOCK=false for real Fabric)');
  gateway = require('./blockchain.service.mock');
} else {
  logger.info('Blockchain service: using REAL Fabric gateway (evault-gateway)');
  gateway = require('evault-gateway/dist/index.js');
}

module.exports = {
  registerUser: gateway.registerUser,
  recordDocument: gateway.recordDocument,
  updateDocument: gateway.updateDocument,
  getDocument: gateway.getDocument,
  getVersionHistory: gateway.getVersionHistory,

  grantAccess: gateway.grantAccess,
  revokeAccess: gateway.revokeAccess,
  checkAccess: gateway.checkAccess,

  // Fabric audit
  logAction: gateway.logAction,
  getAuditTrail: gateway.getAuditTrail,

  // Test utils (only available on mock)
  resetMockState: gateway.resetMockState,
};

