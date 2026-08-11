import assert from 'node:assert';
import { test, describe } from 'node:test';
import {
  generateKey,
  encryptFile,
  decryptFile,
  computeFileHash,
  packEncryptedPayload,
  unpackEncryptedPayload,
} from './aes256.js';

describe('AES-256-GCM Encryption/Decryption Utilities', () => {
  test('Key generation creates a valid 64-char hex string (256 bits)', () => {
    const key = generateKey();
    assert.strictEqual(typeof key, 'string');
    assert.strictEqual(key.length, 64);
  });

  test('SHA-256 document hashing returns prefixed hex checksum', () => {
    const fileBuffer = Buffer.from('Legal Document Confidential Notice');
    const hash = computeFileHash(fileBuffer);
    assert.ok(hash.startsWith('0x'));
    assert.strictEqual(hash.length, 66); // 0x + 64 hex chars
  });

  test('Encrypt and Decrypt roundtrip works accurately', async () => {
    const key = generateKey();
    const originalText = 'CONFIDENTIAL COURT EVIDENCE #40912 - DO NOT DISTRIBUTE';
    const originalBuffer = Buffer.from(originalText, 'utf-8');

    const encryptedPayload = await encryptFile(originalBuffer, key);
    assert.strictEqual(encryptedPayload.algorithm, 'AES-256-GCM');
    assert.ok(encryptedPayload.iv);
    assert.ok(encryptedPayload.tag);
    assert.ok(encryptedPayload.ciphertext);

    const decryptedBuffer = await decryptFile(encryptedPayload, key);
    assert.strictEqual(decryptedBuffer.toString('utf-8'), originalText);
  });

  test('Packing and Unpacking payload preserves data integrity', async () => {
    const key = generateKey();
    const originalBuffer = Buffer.from('Pack / Unpack binary binary test data');

    const payload = await encryptFile(originalBuffer, key);
    const packed = packEncryptedPayload(payload);
    assert.ok(Buffer.isBuffer(packed));

    const unpacked = unpackEncryptedPayload(packed);
    assert.strictEqual(unpacked.iv, payload.iv);
    assert.strictEqual(unpacked.tag, payload.tag);
    assert.strictEqual(unpacked.ciphertext, payload.ciphertext);

    const decrypted = await decryptFile(unpacked, key);
    assert.strictEqual(decrypted.toString('utf-8'), 'Pack / Unpack binary binary test data');
  });

  test('Decryption fails if ciphertext or tag is tampered with', async () => {
    const key = generateKey();
    const payload = await encryptFile(Buffer.from('Sensitive case files'), key);

    // Tamper tag
    const tamperedPayload = {
      ...payload,
      tag: '0'.repeat(32),
    };

    await assert.rejects(async () => {
      await decryptFile(tamperedPayload, key);
    });
  });
});
