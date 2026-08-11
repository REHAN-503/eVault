import { CONFIG } from '../config.js';
import { IpfsStorageAdapter } from './ipfs.adapter.js';
import { LocalStorageAdapter } from './local.adapter.js';
import { S3StorageAdapter } from './s3.adapter.js';
import { IStorageService, StorageUploadResult } from './storage.interface.js';

/**
 * Unified Storage Service Provider.
 * Automatically delegates uploadFile and retrieveFile requests to the configured storage driver
 * (IPFS, AWS S3, or Local Vault Fallback).
 */
export class StorageService implements IStorageService {
  private activeAdapter: IStorageService;

  constructor(driver?: 'ipfs' | 's3' | 'local') {
    const selectedDriver = driver || CONFIG.STORAGE_DRIVER;

    switch (selectedDriver) {
      case 'ipfs':
        this.activeAdapter = new IpfsStorageAdapter(CONFIG.IPFS_API_URL);
        break;
      case 's3':
        this.activeAdapter = new S3StorageAdapter(CONFIG.S3_BUCKET_NAME, CONFIG.AWS_REGION);
        break;
      case 'local':
      default:
        this.activeAdapter = new LocalStorageAdapter(CONFIG.LOCAL_STORAGE_DIR);
        break;
    }
  }

  /**
   * Upload encrypted file buffer to configured off-chain storage engine.
   * @param encryptedBuffer Encrypted binary data
   * @returns StorageUploadResult containing CID, SHA-256 hash, and size
   */
  async uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult> {
    return this.activeAdapter.uploadFile(encryptedBuffer);
  }

  /**
   * Retrieve encrypted document buffer by CID / key from configured off-chain storage engine.
   * @param cid Storage Content Identifier
   * @returns Raw encrypted Buffer
   */
  async retrieveFile(cid: string): Promise<Buffer> {
    return this.activeAdapter.retrieveFile(cid);
  }

  // ─────────────────────────────────────────────────────────────
  // Backend integration aliases — match docs/CONTRACTS.md exactly
  // so evault-backend's storage.service.js can call these directly.
  // ─────────────────────────────────────────────────────────────

  /**
   * Backend-contract-compatible alias for uploadFile.
   * Matches docs/CONTRACTS.md: upload(encryptedBuffer, metadata) -> { cid }
   * @param encryptedBuffer Encrypted binary data
   * @param metadata Optional file metadata (filename, mimetype) — accepted for
   *   contract compatibility; not currently used by the underlying adapters.
   */
  async upload(
    encryptedBuffer: Buffer,
    metadata?: { filename?: string; mimetype?: string }
  ): Promise<{ cid: string }> {
    const result = await this.uploadFile(encryptedBuffer);
    return { cid: result.cid };
  }

  /**
   * Backend-contract-compatible alias for retrieveFile.
   * Matches docs/CONTRACTS.md: download(cid) -> Buffer
   */
  async download(cid: string): Promise<Buffer> {
    return this.retrieveFile(cid);
  }
}

/** Default singleton instance for quick import */
export const storageService = new StorageService();