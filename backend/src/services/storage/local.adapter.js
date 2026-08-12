'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const logger = require('../../utils/logger');
const { ERROR_CODES, HTTP_STATUS } = require('../../constants');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

class LocalStorageProvider {
  constructor(storageDir) {
    this.storageDir = storageDir;
    // Ensure directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Upload encrypted file buffer to local storage.
   * Generates a deterministic content-addressable identifier (CID-like) based on SHA-256 hash.
   */
  async upload(encryptedBuffer, _metadata) {
    // Generate a content-addressed identifier based on the file content.
    // This is NOT a real IPFS CID, but it serves the same deterministic purpose for local storage.
    const hash = crypto.createHash('sha256').update(encryptedBuffer).digest('hex');
    const cid = `local-${hash}`;

    const filePath = path.join(this.storageDir, `${cid}.enc`);

    await writeFile(filePath, encryptedBuffer);
    logger.info(`File stored locally with identifier: ${cid}`);

    return { cid };
  }

  /**
   * Retrieve encrypted document buffer by identifier from local storage.
   */
  async download(cid) {
    const filePath = path.join(this.storageDir, `${cid}.enc`);

    try {
      const buffer = await readFile(filePath);
      return buffer;
    } catch (err) {
      if (err.code === 'ENOENT') {
        const error = new Error('File not found in storage');
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        error.errorCode = ERROR_CODES.NOT_FOUND;
        throw error;
      }
      throw err;
    }
  }

  async delete(cid) {
    // We do soft deletes in this system, so actual file removal might not be needed.
    logger.info(`Storage delete called for ${cid} (no-op for compliance)`);
  }
}

module.exports = LocalStorageProvider;
