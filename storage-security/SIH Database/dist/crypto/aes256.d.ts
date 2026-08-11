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
export declare function generateKey(): string;
/**
 * Compute SHA-256 hash of file buffer for blockchain anchoring.
 * @param data File content buffer
 * @returns Hex-encoded SHA-256 checksum string prefixed with '0x'
 */
export declare function computeFileHash(data: Buffer | Uint8Array): string;
/**
 * Client-side AES-256-GCM Encryption Utility.
 * Encrypts a raw file buffer before uploading to off-chain storage.
 *
 * @param fileData Raw file contents as Buffer or Uint8Array
 * @param key 256-bit encryption key (32-byte Buffer or 64-char Hex string)
 * @returns EncryptedPayload object containing iv, ciphertext, tag, and algorithm
 */
export declare function encryptFile(fileData: Buffer | Uint8Array, key: string | Buffer | Uint8Array): Promise<EncryptedPayload>;
/**
 * Client-side AES-256-GCM Decryption Utility.
 * Decrypts an EncryptedPayload after authorized retrieval from off-chain storage.
 *
 * @param payload Encrypted payload containing iv, ciphertext, tag
 * @param key 256-bit encryption key used during encryption
 * @returns Decrypted raw file Buffer
 */
export declare function decryptFile(payload: EncryptedPayload, key: string | Buffer | Uint8Array): Promise<Buffer>;
/**
 * Packs EncryptedPayload into a single combined Buffer for storage efficiency.
 * Format: [12 bytes IV] [16 bytes Auth Tag] [N bytes Ciphertext]
 */
export declare function packEncryptedPayload(payload: EncryptedPayload): Buffer;
/**
 * Unpacks a combined Buffer back into an EncryptedPayload structure.
 */
export declare function unpackEncryptedPayload(packed: Buffer): EncryptedPayload;
//# sourceMappingURL=aes256.d.ts.map