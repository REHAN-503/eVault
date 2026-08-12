'use strict';


const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const logger = require('../../utils/logger');
const userRepository = require('../../repositories/userRepository');
const { HTTP_STATUS, ERROR_CODES } = require('../../constants');

/**
 * Creates an operational error with status code for the error handler.
 */
function createError(message, statusCode, errorCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errorCode = errorCode;
  return err;
}

/**
 * Validates a UUID format.
 */
function validateUUID(id, fieldName) {
  if (!uuidValidate(id)) {
    throw createError(
      `Invalid ${fieldName} format`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}

/**
 * Blockchain Service — MOCK implementation
 * Method signatures match the real Hyperledger Fabric chaincode EXACTLY.
 */

// MOCK: In-memory access control map — simulates AccessControlContract
const accessMap = new Map();

// MOCK: In-memory version history — simulates DocumentRegistryContract ledger
const versionHistory = new Map();

// MOCK: In-memory registered users tracker
const registeredUsers = new Set();
const inFlightRegistrations = new Map();



/**
 * Helper: generate a realistic-looking blockchain transaction ID.
 */
function mockTxId() {
  return `tx_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Helper: Auto-register user if not already registered on the blockchain.
 */
async function ensureUserRegistered(userId) {
  validateUUID(userId, 'user ID');

  if (registeredUsers.has(userId)) {
    return;
  }

  if (inFlightRegistrations.has(userId)) {
    return inFlightRegistrations.get(userId);
  }

  const promise = (async () => {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw createError('Unknown user', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      await registerUser(userId, user.role);
    } finally {
      inFlightRegistrations.delete(userId);
    }
  })();

  inFlightRegistrations.set(userId, promise);
  return promise;
}

/**
 * Register a user on the blockchain.
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {Promise<{userId: string, role: string, txId: string}>}
 */
async function registerUser(id, role) {
  validateUUID(id, 'user ID');
  const validRoles = ['LAWYER', 'JUDGE', 'CLIENT', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw createError('Invalid user role', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  if (registeredUsers.has(id)) {
    throw createError(
      'User is already registered on the blockchain',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT
    );
  }

  logger.info('// MOCK: blockchain.registerUser', { id, role });
  registeredUsers.add(id);
  return { userId: id, role, txId: mockTxId() };
}

/**
 * Record a new document on the blockchain.
 * @param {string} docId - Document ID
 * @param {string} hash - File content hash
 * @param {object} metadata - Document metadata
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<{docId: string, hash: string, txId: string}>}
 */
async function recordDocument(docId, hash, metadata, ownerId) {
  validateUUID(docId, 'document ID');
  validateUUID(ownerId, 'owner ID');
  if (!hash || typeof hash !== 'string') {
    throw createError('Invalid hash', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  if (
    !metadata ||
    !metadata.filename ||
    !metadata.mimetype ||
    typeof metadata.sizeBytes !== 'number'
  ) {
    throw createError('Invalid metadata', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  await ensureUserRegistered(ownerId);

  if (versionHistory.has(docId)) {
    throw createError(
      'Document is already recorded on the blockchain',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT
    );
  }

  logger.info('// MOCK: blockchain.recordDocument', { docId, ownerId });
  const entry = { hash, metadata, timestamp: new Date().toISOString() };
  versionHistory.set(docId, [entry]);

  return { docId, hash, txId: mockTxId() };
}

/**
 * Update a document on the blockchain (new version).
 * @param {string} docId - Document ID
 * @param {string} newHash - New file content hash
 * @param {object} metadata - Updated metadata
 * @returns {Promise<{docId: string, hash: string, txId: string}>}
 */
async function updateDocument(docId, newHash, metadata) {
  validateUUID(docId, 'document ID');
  if (!newHash || typeof newHash !== 'string') {
    throw createError('Invalid hash', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  if (!metadata || !metadata.version) {
    throw createError(
      'Invalid metadata (missing version)',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (!versionHistory.has(docId)) {
    throw createError(
      'Document not found on blockchain',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  logger.info('// MOCK: blockchain.updateDocument', { docId });
  const history = versionHistory.get(docId);
  history.push({ hash: newHash, metadata, timestamp: new Date().toISOString() });
  versionHistory.set(docId, history);

  return { docId, hash: newHash, txId: mockTxId() };
}

/**
 * Get a document's current state from the blockchain.
 * @param {string} docId - Document ID
 * @returns {Promise<{hash: string, metadata: object}>}
 */
async function getDocument(docId) {
  validateUUID(docId, 'document ID');
  if (!versionHistory.has(docId)) {
    throw createError(
      'Document not found on blockchain',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  logger.debug('// MOCK: blockchain.getDocument', { docId });
  const history = versionHistory.get(docId);
  const latest = history[history.length - 1];
  return { hash: latest.hash, metadata: latest.metadata };
}

/**
 * Get full version history of a document from the blockchain.
 * @param {string} docId - Document ID
 * @returns {Promise<Array<{hash: string, metadata: object, timestamp: string}>>}
 */
async function getVersionHistory(docId) {
  validateUUID(docId, 'document ID');
  if (!versionHistory.has(docId)) {
    throw createError(
      'Document not found on blockchain',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  logger.debug('// MOCK: blockchain.getVersionHistory', { docId });
  return versionHistory.get(docId);
}

/**
 * Grant access to a document for a user.
 * @param {string} docId - Document ID
 * @param {string} userId - User to grant access to
 * @param {string} permission - Permission type (READ, WRITE)
 * @returns {Promise<{docId: string, userId: string, permission: string, txId: string}>}
 */
async function grantAccess(docId, userId, permission) {
  validateUUID(docId, 'document ID');
  validateUUID(userId, 'user ID');
  if (permission !== 'READ' && permission !== 'WRITE') {
    throw createError(
      'Invalid permission type',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (!versionHistory.has(docId)) {
    throw createError(
      'Document not found on blockchain',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  await ensureUserRegistered(userId);

  const key = `${docId}:${userId}`;
  if (accessMap.get(key) === permission) {
    throw createError(
      'Access already granted with this permission',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT
    );
  }

  logger.info('// MOCK: blockchain.grantAccess', { docId, userId, permission });
  accessMap.set(key, permission);
  return { docId, userId, permission, txId: mockTxId() };
}

/**
 * Revoke a user's access to a document.
 * @param {string} docId - Document ID
 * @param {string} userId - User to revoke access from
 * @returns {Promise<{docId: string, userId: string, txId: string}>}
 */
async function revokeAccess(docId, userId) {
  validateUUID(docId, 'document ID');
  validateUUID(userId, 'user ID');

  if (!versionHistory.has(docId)) {
    throw createError(
      'Document not found on blockchain',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  const key = `${docId}:${userId}`;
  if (!accessMap.has(key)) {
    throw createError('Access not found to revoke', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  logger.info('// MOCK: blockchain.revokeAccess', { docId, userId });
  accessMap.delete(key);
  return { docId, userId, txId: mockTxId() };
}

/**
 * Check if a user has access to a document.
 * @param {string} docId - Document ID
 * @param {string} userId - User to check
 * @returns {Promise<boolean>}
 */
async function checkAccess(docId, userId) {
  validateUUID(docId, 'document ID');
  validateUUID(userId, 'user ID');

  if (!versionHistory.has(docId)) {
    return false;
  }

  logger.debug('// MOCK: blockchain.checkAccess', { docId, userId });
  const key = `${docId}:${userId}`;
  return accessMap.has(key);
}

// Reset function strictly for testing purposes (cleans up mocks between tests)
function resetMockState() {
  accessMap.clear();
  versionHistory.clear();
  registeredUsers.clear();
  inFlightRegistrations.clear();
}

module.exports = {
  registerUser,
  grantAccess,
  revokeAccess,
  checkAccess,
  recordDocument,
  updateDocument,
  getDocument,
  getVersionHistory,
  resetMockState,
};
