'use strict';

/**
 * Domain enum: AuditAction
 *
 * Mirrors the Prisma `AuditAction` enum. Maps to the architecture doc's
 * on-chain event types:
 *   UPLOAD → DocumentAdded
 *   VIEW → DocumentViewed
 *   SHARE → AccessGranted
 *   REVOKE → AccessRevoked
 *   UPDATE → DocumentUpdated
 */
const AuditAction = Object.freeze({
  UPLOAD: 'UPLOAD',
  VIEW: 'VIEW',
  SHARE: 'SHARE',
  REVOKE: 'REVOKE',
  UPDATE: 'UPDATE',
});

/** Array of all valid audit actions */
const AUDIT_ACTIONS = Object.values(AuditAction);

module.exports = { AuditAction, AUDIT_ACTIONS };
