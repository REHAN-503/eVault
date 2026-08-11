'use strict';

const auditRepository = require('../../repositories/auditRepository');
const documentRepository = require('../../repositories/documentRepository');
const blockchainService = require('../blockchain/blockchain.service');
const logger = require('../../utils/logger');

/**
 * Audit Service
 *
 * Every document action produces:
 * 1. A PostgreSQL audit record
 * 2. A Fabric AuditLogContract record
 *
 * PostgreSQL uses the backend document ID.
 * Fabric uses the blockchain document ID (docId).
 */

/**
 * Log an audit action.
 *
 * @param {string} docId - Backend DocumentMetadata.id
 * @param {string} userId - Acting user ID
 * @param {string} action - AuditAction enum value
 * @param {object} [metadata=null] - Optional additional metadata
 * @returns {Promise} The created PostgreSQL audit log entry
 */
async function logAction(docId, userId, action, metadata = null) {
  logger.debug('audit.logAction', {
    docId,
    userId,
    action,
  });

  // 1. Create PostgreSQL audit record
  const audit = await auditRepository.create({
    docId,
    userId,
    action,
    metadata,
  });

  // 2. Resolve backend document ID -> Fabric document ID
  const document = await documentRepository.findById(docId);

  if (!document) {
    logger.warn('audit.fabric.skip_document_not_found', {
      docId,
      userId,
      action,
    });

    return audit;
  }

  if (!document.docId) {
    logger.warn('audit.fabric.skip_missing_docId', {
      docId,
      userId,
      action,
    });

    return audit;
  }

  // 3. Write the same action to Fabric
  try {
    // Attempt to log to Fabric if the function exists (mock may omit it)
    if (typeof blockchainService.logAction === 'function') {
      const blockchainResult = await blockchainService.logAction(
        document.docId,
        userId,
        action
      );
      logger.debug('audit.fabric.success', {
        backendDocId: docId,
        fabricDocId: document.docId,
        userId,
        action,
        txId: blockchainResult.txId,
      });
    } else {
      logger.warn('audit.fabric.skipped_no_logAction', { docId, userId, action });
    }
  } catch (err) {
    /*
     * PostgreSQL audit has already been created.
     *
     * We log the Fabric failure instead of breaking the
     * document operation.
     */
    logger.error('audit.fabric.failed', {
      backendDocId: docId,
      fabricDocId: document.docId,
      userId,
      action,
      error: err.message,
    });
  }

  return audit;
}

/**
 * Get audit trail for a document, ordered newest first.
 *
 * @param {string} docId - Backend document ID
 * @returns {Promise} Ordered PostgreSQL audit log entries
 */
async function getAudit(docId) {
  return auditRepository.findByDocId(docId);
}

/**
 * Get audit trail for a user.
 *
 * @param {string} userId - User ID
 * @returns {Promise} Ordered audit log entries
 */
async function getUserAudit(userId) {
  return auditRepository.findByUserId(userId);
}

module.exports = {
  logAction,
  getAudit,
  getUserAudit,
};
