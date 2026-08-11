'use strict';

const LocalStorageProvider = require('./local.adapter');
const logger = require('../../utils/logger');
const path = require('path');

// Determine storage directory from config or fallback
const storageDir = process.env.LOCAL_STORAGE_DIR || path.join(__dirname, '../../../../storage_vault');
const activeProvider = new LocalStorageProvider(storageDir);

/**
 * Storage Service — REAL implementation
 * Delegates to the active storage provider (currently LocalStorageProvider).
 * Signatures match docs/CONTRACTS.md exactly — no changes needed
 * in document.service.js or any controller.
 */

async function upload(encryptedBuffer, metadata) {
  logger.info('storage.upload initializing');
  const result = await activeProvider.upload(encryptedBuffer, metadata);
  return result;
}

async function download(cid) {
  logger.debug('storage.download', { cid });
  return activeProvider.download(cid);
}

async function remove(cid) {
  logger.info('storage.delete', { cid });
  return activeProvider.delete(cid);
}

module.exports = {
  upload,
  download,
  delete: remove,
};