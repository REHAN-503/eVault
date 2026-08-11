'use strict';

/**
 * JSDoc typedefs for editor autocomplete in a plain-JS project.
 * No runtime impact — these are purely for DX.
 */

/**
 * @typedef {Object} DocumentMetadataDTO
 * @property {string} id - UUID primary key
 * @property {string} docId - On-chain document reference
 * @property {string} cid - Off-chain storage pointer (IPFS CID)
 * @property {string} currentHash - SHA-256 hash of current file version
 * @property {string} ownerId - UUID of the document owner
 * @property {number} version - Monotonically increasing version number
 * @property {string} filename - Original filename
 * @property {string} mimetype - MIME type
 * @property {number} sizeBytes - File size in bytes
 * @property {boolean} isDeleted - Soft-delete flag
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id - UUID primary key
 * @property {string} docId - Associated document ID
 * @property {string} userId - Acting user ID
 * @property {string} action - One of AuditAction enum values
 * @property {Date} timestamp
 * @property {object} [metadata] - Optional JSON metadata
 */

/**
 * @typedef {Object} BlockchainRecordResult
 * @property {string} docId
 * @property {string} hash
 * @property {string} txId - Blockchain transaction ID
 */

/**
 * @typedef {Object} StorageUploadResult
 * @property {string} cid - Content Identifier (IPFS-style)
 */

/**
 * @typedef {Object} CISSyncResult
 * @property {string} caseId - External CIS case identifier
 * @property {string} status - Sync status
 * @property {string} syncedAt - ISO timestamp
 * @property {object} caseRecord - The mocked case record
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */

module.exports = {};
