'use strict';

const { storageService } = require('sih1284-storage-security/dist/storage/storage.service.js');
const logger = require('../../utils/logger');

/**
 * Storage Service — REAL implementation (Member 4)
 * Delegates to sih1284-storage-security's StorageService.
 * Signatures match docs/CONTRACTS.md exactly — no changes needed
 * in document.service.js or any controller.
 */

async function upload(encryptedBuffer, metadata) {
  const result = await storageService.upload(encryptedBuffer, metadata);
  logger.info('storage.upload', { cid: result.cid });
  return result;
}

async function download(cid) {
  logger.debug('storage.download', { cid });
  return storageService.download(cid);
}

async function remove(cid) {
  logger.info('storage.delete (no-op — soft-delete handled at metadata layer)', { cid });
}

module.exports = {
  upload,
  download,
  delete: remove,
};