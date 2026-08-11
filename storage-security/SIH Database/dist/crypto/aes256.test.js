"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const aes256_js_1 = require("./aes256.js");
(0, node_test_1.describe)('AES-256-GCM Encryption/Decryption Utilities', () => {
    (0, node_test_1.test)('Key generation creates a valid 64-char hex string (256 bits)', () => {
        const key = (0, aes256_js_1.generateKey)();
        node_assert_1.default.strictEqual(typeof key, 'string');
        node_assert_1.default.strictEqual(key.length, 64);
    });
    (0, node_test_1.test)('SHA-256 document hashing returns prefixed hex checksum', () => {
        const fileBuffer = Buffer.from('Legal Document Confidential Notice');
        const hash = (0, aes256_js_1.computeFileHash)(fileBuffer);
        node_assert_1.default.ok(hash.startsWith('0x'));
        node_assert_1.default.strictEqual(hash.length, 66); // 0x + 64 hex chars
    });
    (0, node_test_1.test)('Encrypt and Decrypt roundtrip works accurately', async () => {
        const key = (0, aes256_js_1.generateKey)();
        const originalText = 'CONFIDENTIAL COURT EVIDENCE #40912 - DO NOT DISTRIBUTE';
        const originalBuffer = Buffer.from(originalText, 'utf-8');
        const encryptedPayload = await (0, aes256_js_1.encryptFile)(originalBuffer, key);
        node_assert_1.default.strictEqual(encryptedPayload.algorithm, 'AES-256-GCM');
        node_assert_1.default.ok(encryptedPayload.iv);
        node_assert_1.default.ok(encryptedPayload.tag);
        node_assert_1.default.ok(encryptedPayload.ciphertext);
        const decryptedBuffer = await (0, aes256_js_1.decryptFile)(encryptedPayload, key);
        node_assert_1.default.strictEqual(decryptedBuffer.toString('utf-8'), originalText);
    });
    (0, node_test_1.test)('Packing and Unpacking payload preserves data integrity', async () => {
        const key = (0, aes256_js_1.generateKey)();
        const originalBuffer = Buffer.from('Pack / Unpack binary binary test data');
        const payload = await (0, aes256_js_1.encryptFile)(originalBuffer, key);
        const packed = (0, aes256_js_1.packEncryptedPayload)(payload);
        node_assert_1.default.ok(Buffer.isBuffer(packed));
        const unpacked = (0, aes256_js_1.unpackEncryptedPayload)(packed);
        node_assert_1.default.strictEqual(unpacked.iv, payload.iv);
        node_assert_1.default.strictEqual(unpacked.tag, payload.tag);
        node_assert_1.default.strictEqual(unpacked.ciphertext, payload.ciphertext);
        const decrypted = await (0, aes256_js_1.decryptFile)(unpacked, key);
        node_assert_1.default.strictEqual(decrypted.toString('utf-8'), 'Pack / Unpack binary binary test data');
    });
    (0, node_test_1.test)('Decryption fails if ciphertext or tag is tampered with', async () => {
        const key = (0, aes256_js_1.generateKey)();
        const payload = await (0, aes256_js_1.encryptFile)(Buffer.from('Sensitive case files'), key);
        // Tamper tag
        const tamperedPayload = {
            ...payload,
            tag: '0'.repeat(32),
        };
        await node_assert_1.default.rejects(async () => {
            await (0, aes256_js_1.decryptFile)(tamperedPayload, key);
        });
    });
});
//# sourceMappingURL=aes256.test.js.map