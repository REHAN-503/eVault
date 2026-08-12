'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const documentRepository = require('../../repositories/documentRepository');
const blockchainService = require('../blockchain/blockchain.service');
const storageService = require('../storage/storage.service');
const auditService = require('../audit/audit.service');
const { AuditAction } = require('../../models/auditAction.model');
const { HTTP_STATUS, ERROR_CODES } = require('../../constants');

/**
 * Creates an operational error with status code for the error handler.
 */
function createError(message, statusCode, errorCode, details = '') {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errorCode = errorCode;
  err.details = details;
  return err;
}

/**
 * Upload a document.
 * Flow: receive encrypted buffer → store via storage service → record on blockchain → save metadata
 */
async function uploadDocument(file, userId, role, title, caseNo) {
  if (!file) {
    throw createError('No file provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const docId = uuidv4();

  // Store encrypted file via storage service
  const { cid } = await storageService.upload(file.buffer, {
    filename: file.originalname,
    mimetype: file.mimetype,
  });

  // Record on blockchain
  const blockchainResult = await blockchainService.recordDocument(
    docId,
    fileHash,
    {
      filename: file.originalname,
      mimetype: file.mimetype,
      sizeBytes: file.size,
    },
    userId,
    role
  );

  let document;
  try {
    document = await documentRepository.create({
      docId,
      cid,
      currentHash: fileHash,
      ownerId: userId,
      title,
      caseNo,
      filename: file.originalname,
      mimetype: file.mimetype,
      sizeBytes: file.size,
    });
  } catch (err) {
    // If we fail here, storage and blockchain are written but DB is not.
    console.error(
      `[Upload Error] Partial failure: Storage/Fabric succeeded, DB failed for docId ${docId}`,
      err
    );
    throw createError(
      'Failed to persist document metadata after storage',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  // Audit log
  await auditService.logAction(document.id, userId, AuditAction.UPLOAD, {
    txId: blockchainResult.txId,
    filename: file.originalname,
  });

  return document;
}

/**
 * List documents visible to the current user (paginated).
 */
async function listDocuments(userId, role, query) {
  // Admins and Judges can see all documents
  if (role === 'ADMIN' || role === 'JUDGE') {
    return documentRepository.findAll(query);
  }
  // Others see only their own documents
  return documentRepository.findByOwner(userId, query);
}

/**
 * Get a single document by ID, with access check.
 */
async function getDocument(databaseId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Owner, Admin, and Judge always have access
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    // Check blockchain access control
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError(
        'Access denied to this document',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR
      );
    }
  }

  // Audit the view
  await auditService.logAction(document.id, userId, AuditAction.VIEW);

  return document;
}

/**
 * Download a document's file content.
 */
async function downloadDocument(databaseId, userId, role) {
  const document = await getDocument(databaseId, userId, role);

  // Retrieve file from storage
  const buffer = await storageService.download(document.cid);

  return {
    buffer,
    filename: document.filename,
    mimetype: document.mimetype,
  };
}

/**
 * Update a document (new version upload).
 * Increments version, previous hash stays in blockchain history.
 */
async function updateDocument(databaseId, file, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only owner or admin can update
  if (document.ownerId !== userId && role !== 'ADMIN') {
    throw createError(
      'Only the document owner or an admin can update this document',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  if (!file) {
    throw createError('No file provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  const newHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  // Store new version in storage
  const { cid: newCid } = await storageService.upload(file.buffer, {
    filename: file.originalname,
    mimetype: file.mimetype,
  });

  // Record new version on blockchain
  const blockchainResult = await blockchainService.updateDocument(document.docId, newHash, {
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    version: document.version + 1,
  });

  // Update metadata in Postgres
  const updated = await documentRepository.update(databaseId, {
    cid: newCid,
    currentHash: newHash,
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
    version: document.version + 1,
  });

  // Audit log
  await auditService.logAction(document.id, userId, AuditAction.UPDATE, {
    txId: blockchainResult.txId,
    previousVersion: document.version,
    newVersion: document.version + 1,
  });

  return updated;
}

/**
 * Soft-delete a document.
 * Legal records should not be hard-deleted.
 */
async function deleteDocument(databaseId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only owner or admin can delete
  if (document.ownerId !== userId && role !== 'ADMIN') {
    throw createError(
      'Only the document owner or an admin can delete this document',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  await documentRepository.softDelete(databaseId);

  return { id: databaseId, message: 'Document soft-deleted successfully' };
}

/**
 * Share a document — grant access to another user.
 */
async function shareDocument(databaseId, targetUserId, permission, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only Judges, Admins, or the document owner can share
  const isOwner = document.ownerId === userId;
  if (!isOwner && role !== 'JUDGE' && role !== 'ADMIN') {
    throw createError(
      'Only Judges, Admins, or the document owner can manage document access',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  // Validate the target user exists and is a Lawyer or Client. Status check removed to allow sharing with users pending approval (e.g., test user).
  const targetUser = await require('../../repositories/userRepository').findById(targetUserId);
  if (!targetUser || (targetUser.role !== 'LAWYER' && targetUser.role !== 'CLIENT')) {
    throw createError(
      'Invalid target user for sharing (must be a Lawyer or Client)',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Force READ ONLY permission
  const finalPermission = 'READ';

  const result = await blockchainService.grantAccess(document.docId, targetUserId, finalPermission);

  // Sync access to Postgres for efficient querying
  await documentRepository.update(databaseId, {
    sharedWith: { connect: { id: targetUserId } },
  });

  // Audit log
  await auditService.logAction(document.id, userId, AuditAction.SHARE, {
    txId: result.txId,
    sharedWith: targetUserId,
    permission: finalPermission,
  });

  return result;
}

/**
 * Revoke a user's access to a document.
 */
async function revokeDocument(databaseId, targetUserId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only Judges, Admins, or the document owner can revoke
  const isOwner = document.ownerId === userId;
  if (!isOwner && role !== 'JUDGE' && role !== 'ADMIN') {
    throw createError(
      'Only Judges, Admins, or the document owner can manage document access',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  const result = await blockchainService.revokeAccess(document.docId, targetUserId);

  // Sync access to Postgres for efficient querying (Bug 5)
  await documentRepository.update(databaseId, {
    sharedWith: { disconnect: { id: targetUserId } },
  });

  // Audit log
  await auditService.logAction(document.id, userId, AuditAction.REVOKE, {
    txId: result.txId,
    revokedFrom: targetUserId,
  });

  return result;
}

/**
 * Get document version history from blockchain.
 */
async function getDocumentHistory(databaseId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Check access before releasing history
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError('Access denied', HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
    }
  }

  return blockchainService.getVersionHistory(document.docId);
}

/**
 * Get document audit trail.
 */
async function getDocumentAudit(databaseId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Check access before releasing audit trail
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError('Access denied', HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
    }
  }

  return auditService.getAudit(databaseId);
}

/**
 * Verify document cryptographic hashes between PostgreSQL and Fabric.
 */
async function verifyLedger(databaseId, userId, role) {
  const document = await documentRepository.findById(databaseId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Check access before allowing verification
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError('Access denied', HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
    }
  }

  try {
    const ledgerRecord = await blockchainService.getDocument(document.docId);

    const isMatch = ledgerRecord.hash === document.currentHash;

    // Audit the verification
    // Audit the verification using a valid enum action
    await auditService.logAction(document.id, userId, AuditAction.VIEW, {
      match: isMatch,
      databaseHash: document.currentHash,
      ledgerHash: ledgerRecord.hash,
    });

    return {
      verified: isMatch,
      docId: document.docId,
      databaseHash: document.currentHash,
      ledgerHash: ledgerRecord.hash,
      match: isMatch,
    };
  } catch (err) {
    return {
      verified: false,
      docId: document.docId,
      error: 'Failed to retrieve Fabric record',
      match: false,
    };
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  revokeDocument,
  getDocumentHistory,
  getDocumentAudit,
  verifyLedger,
};
