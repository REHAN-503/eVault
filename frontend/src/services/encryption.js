// src/services/encryption.js
// Provides client-side AES-256-GCM encryption/decryption using the Web Crypto API
// as mandated by the SIH1284 Technical Architecture Document.

/**
 * Derives an AES-GCM key from a password string.
 * For production, this should integrate with a robust KMS.
 */
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a File or Blob.
 * Prepends the 12-byte IV and 16-byte salt to the ciphertext so it can be decrypted later.
 * 
 * @param {File|Blob} file 
 * @param {string} password 
 * @returns {Promise<File>} Encrypted file with same name
 */
export async function encryptFile(file, password) {
  const arrayBuffer = await file.arrayBuffer();
  
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(password, salt);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    arrayBuffer
  );

  // Combine salt + iv + ciphertext
  const encryptedPayload = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  encryptedPayload.set(salt, 0);
  encryptedPayload.set(iv, salt.length);
  encryptedPayload.set(new Uint8Array(ciphertext), salt.length + iv.length);
  
  return new File([encryptedPayload], file.name || 'encrypted-document', { type: 'application/octet-stream' });
}

/**
 * Decrypts an encrypted Blob.
 * Assumes the Blob has salt and IV prepended as done in encryptFile.
 * 
 * @param {Blob} blob 
 * @param {string} password 
 * @param {string} originalMimeType
 * @returns {Promise<Blob>} Decrypted blob
 */
export async function decryptFile(blob, password, originalMimeType = 'application/pdf') {
  const buffer = await blob.arrayBuffer();
  
  const salt = new Uint8Array(buffer.slice(0, 16));
  const iv = new Uint8Array(buffer.slice(16, 28));
  const ciphertext = buffer.slice(28);
  
  const key = await deriveKey(password, salt);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );
  
  return new Blob([decryptedBuffer], { type: originalMimeType });
}
