'use strict';

const gateway = require('evault-gateway/dist/index.js');

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
};
