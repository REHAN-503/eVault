"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKey = generateKey;
exports.computeFileHash = computeFileHash;
exports.encryptFile = encryptFile;
exports.decryptFile = decryptFile;
exports.packEncryptedPayload = packEncryptedPayload;
exports.unpackEncryptedPayload = unpackEncryptedPayload;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a cryptographically secure 256-bit (32-byte) AES key as a hex string.
 */
function generateKey() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
/**
 * Compute SHA-256 hash of file buffer for blockchain anchoring.
 * @param data File content buffer
 * @returns Hex-encoded SHA-256 checksum string prefixed with '0x'
 */
function computeFileHash(data) {
    const hash = crypto_1.default.createHash('sha256').update(data).digest('hex');
    return `0x${hash}`;
}
/**
 * Convert string or buffer key representation to a 32-byte Buffer.
 */
function normalizeKey(key) {
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
async function encryptFile(fileData, key) {
    const keyBuf = normalizeKey(key);
    const iv = crypto_1.default.randomBytes(12); // 96-bit IV recommended for AES-GCM
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', keyBuf, iv);
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
async function decryptFile(payload, key) {
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
    const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', keyBuf, ivBuf);
    decipher.setAuthTag(tagBuf);
    const decrypted = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]);
    return decrypted;
}
/**
 * Packs EncryptedPayload into a single combined Buffer for storage efficiency.
 * Format: [12 bytes IV] [16 bytes Auth Tag] [N bytes Ciphertext]
 */
function packEncryptedPayload(payload) {
    const ivBuf = Buffer.from(payload.iv, 'hex');
    const tagBuf = Buffer.from(payload.tag, 'hex');
    const cipherBuf = Buffer.from(payload.ciphertext, 'base64');
    return Buffer.concat([ivBuf, tagBuf, cipherBuf]);
}
/**
 * Unpacks a combined Buffer back into an EncryptedPayload structure.
 */
function unpackEncryptedPayload(packed) {
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
//# sourceMappingURL=aes256.js.map