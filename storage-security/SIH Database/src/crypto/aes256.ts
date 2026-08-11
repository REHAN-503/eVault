import crypto from 'crypto';

/**
 * Encrypted payload metadata output structure
 */
export interface EncryptedPayload {
  /** Initialization Vector (12 bytes hex string for AES-GCM) */
  iv: string;
  /** Encrypted content (Base64 string) */
  ciphertext: string;
  /** Authentication Tag (16 bytes hex string for AES-GCM) */
  tag: string;
  /** Algorithm indicator */
  algorithm: 'AES-256-GCM';
}

/**
 * Generate a cryptographically secure 256-bit (32-byte) AES key as a hex string.
 */
export function generateKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Compute SHA-256 hash of file buffer for blockchain anchoring.
 * @param data File content buffer
 * @returns Hex-encoded SHA-256 checksum string prefixed with '0x'
 */
export function computeFileHash(data: Buffer | Uint8Array): string {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `0x${hash}`;
}

/**
 * Convert string or buffer key representation to a 32-byte Buffer.
 */
function normalizeKey(key: string | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(key)) {
    if (key.length !== 32) {
      throw new Error(`Invalid key length. Expected 32 bytes, got ${key.length}`);
    }
    return key;
  }
  if (key instanceof Uint8Array) {
    const buf = Buffer.from(key);
    if (buf.length !== 32) {
      throw new Error(`Invalid key length. Expected 32 bytes, got ${buf.length}`);
    }
    return buf;
  }
  if (typeof key === 'string') {
    const cleanHex = key.startsWith('0x') ? key.slice(2) : key;
    if (cleanHex.length === 64) {
      return Buffer.from(cleanHex, 'hex');
    }
    // If raw string of 32 chars
    if (Buffer.from(key, 'utf-8').length === 32) {
      return Buffer.from(key, 'utf-8');
    }
  }
  throw new Error('Key must be a 32-byte Buffer/Uint8Array or 64-character Hex string');
}

/**
 * Client-side AES-256-GCM Encryption Utility.
 * Encrypts a raw file buffer before uploading to off-chain storage.
 * 
 * @param fileData Raw file contents as Buffer or Uint8Array
 * @param key 256-bit encryption key (32-byte Buffer or 64-char Hex string)
 * @returns EncryptedPayload object containing iv, ciphertext, tag, and algorithm
 */
export async function encryptFile(
  fileData: Buffer | Uint8Array,
  key: string | Buffer | Uint8Array
): Promise<EncryptedPayload> {
  const keyBuf = normalizeKey(key);
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for AES-GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuf, iv);
  const dataBuf = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);

  const encrypted = Buffer.concat([cipher.update(dataBuf), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    ciphertext: encrypted.toString('base64'),
    tag: tag.toString('hex'),
    algorithm: 'AES-256-GCM',
  };
}

/**
 * Client-side AES-256-GCM Decryption Utility.
 * Decrypts an EncryptedPayload after authorized retrieval from off-chain storage.
 * 
 * @param payload Encrypted payload containing iv, ciphertext, tag
 * @param key 256-bit encryption key used during encryption
 * @returns Decrypted raw file Buffer
 */
export async function decryptFile(
  payload: EncryptedPayload,
  key: string | Buffer | Uint8Array
): Promise<Buffer> {
  if (payload.algorithm !== 'AES-256-GCM') {
    throw new Error(`Unsupported algorithm: ${payload.algorithm}. Expected AES-256-GCM`);
  }

  const keyBuf = normalizeKey(key);
  const ivBuf = Buffer.from(payload.iv, 'hex');
  const tagBuf = Buffer.from(payload.tag, 'hex');
  const ciphertextBuf = Buffer.from(payload.ciphertext, 'base64');

  if (ivBuf.length !== 12) {
    throw new Error(`Invalid IV length. Expected 12 bytes, got ${ivBuf.length}`);
  }
  if (tagBuf.length !== 16) {
    throw new Error(`Invalid authentication tag length. Expected 16 bytes, got ${tagBuf.length}`);
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf, ivBuf);
  decipher.setAuthTag(tagBuf);

  const decrypted = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]);
  return decrypted;
}

/**
 * Packs EncryptedPayload into a single combined Buffer for storage efficiency.
 * Format: [12 bytes IV] [16 bytes Auth Tag] [N bytes Ciphertext]
 */
export function packEncryptedPayload(payload: EncryptedPayload): Buffer {
  const ivBuf = Buffer.from(payload.iv, 'hex');
  const tagBuf = Buffer.from(payload.tag, 'hex');
  const cipherBuf = Buffer.from(payload.ciphertext, 'base64');

  return Buffer.concat([ivBuf, tagBuf, cipherBuf]);
}

/**
 * Unpacks a combined Buffer back into an EncryptedPayload structure.
 */
export function unpackEncryptedPayload(packed: Buffer): EncryptedPayload {
  if (packed.length < 28) {
    throw new Error('Packed encrypted buffer is too short to contain valid IV and Auth Tag');
  }

  const ivBuf = packed.subarray(0, 12);
  const tagBuf = packed.subarray(12, 28);
  const cipherBuf = packed.subarray(28);

  return {
    iv: ivBuf.toString('hex'),
    tag: tagBuf.toString('hex'),
    ciphertext: cipherBuf.toString('base64'),
    algorithm: 'AES-256-GCM',
  };
}
