/**
 * Return result metadata for off-chain storage upload operation.
 */
export interface StorageUploadResult {
  /** Content Identifier (CID or storage key hash) */
  cid: string;
  /** SHA-256 Checksum of stored binary data (hex format) */
  hash: string;
  /** Size of payload in bytes */
  size: number;
  /** Storage driver used (ipfs | s3 | local) */
  driver: 'ipfs' | 's3' | 'local';
}

/**
 * Interface contract for Off-Chain Encrypted Document Storage Adapters.
 */
export interface IStorageService {
  /**
   * Upload an encrypted buffer to off-chain storage.
   * @param encryptedBuffer Encrypted binary data
   * @returns StorageUploadResult containing CID, SHA-256 hash, and size
   */
  uploadFile(encryptedBuffer: Buffer): Promise<StorageUploadResult>;

  /**
   * Retrieve encrypted document buffer by CID / key.
   * @param cid Content Identifier or key string
   * @returns Raw encrypted Buffer
   */
  retrieveFile(cid: string): Promise<Buffer>;
}
