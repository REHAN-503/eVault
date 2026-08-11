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
async function uploadDocument(file, userId, role) {
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
  const blockchainResult = await blockchainService.recordDocument(docId, fileHash, {
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
  }, userId, role);

  // Save metadata in Postgres
  const document = await documentRepository.create({
    docId,
    cid,
    currentHash: fileHash,
    ownerId: userId,
    filename: file.originalname,
    mimetype: file.mimetype,
    sizeBytes: file.size,
  });

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
async function getDocument(documentId, userId, role) {
  const document = await documentRepository.findById(documentId);
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
async function downloadDocument(documentId, userId, role) {
  const document = await getDocument(documentId, userId, role);

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
async function updateDocument(documentId, file, userId, role) {
  const document = await documentRepository.findById(documentId);
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
  const updated = await documentRepository.update(documentId, {
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
async function deleteDocument(documentId, userId, role) {
  const document = await documentRepository.findById(documentId);
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

  await documentRepository.softDelete(documentId);

  return { id: documentId, message: 'Document soft-deleted successfully' };
}

/**
 * Share a document — grant access to another user.
 */
async function shareDocument(documentId, targetUserId, permission, userId, role) {
  const document = await documentRepository.findById(documentId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only owner or admin can share
  if (document.ownerId !== userId && role !== 'ADMIN') {
    throw createError(
      'Only the document owner or an admin can share this document',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  const result = await blockchainService.grantAccess(document.docId, targetUserId, permission);

  // Audit log
  await auditService.logAction(document.id, userId, AuditAction.SHARE, {
    txId: result.txId,
    sharedWith: targetUserId,
    permission,
  });

  return result;
}

/**
 * Revoke a user's access to a document.
 */
async function revokeDocument(documentId, targetUserId, userId, role) {
  const document = await documentRepository.findById(documentId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Only owner or admin can revoke
  if (document.ownerId !== userId && role !== 'ADMIN') {
    throw createError(
      'Only the document owner or an admin can revoke access',
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.AUTHORIZATION_ERROR
    );
  }

  const result = await blockchainService.revokeAccess(document.docId, targetUserId);

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
async function getDocumentHistory(documentId, userId, role) {
  const document = await documentRepository.findById(documentId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Check access before releasing history
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError(
        'Access denied',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR
      );
    }
  }

  return blockchainService.getVersionHistory(document.docId);
}

/**
 * Get document audit trail.
 */
async function getDocumentAudit(documentId, userId, role) {
  const document = await documentRepository.findById(documentId);
  if (!document || document.isDeleted) {
    throw createError('Document not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  // Check access before releasing audit trail
  const isOwner = document.ownerId === userId;
  const isPrivileged = role === 'ADMIN' || role === 'JUDGE';

  if (!isOwner && !isPrivileged) {
    const hasAccess = await blockchainService.checkAccess(document.docId, userId);
    if (!hasAccess) {
      throw createError(
        'Access denied',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR
      );
    }
  }

  return auditService.getAudit(documentId);
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
};
