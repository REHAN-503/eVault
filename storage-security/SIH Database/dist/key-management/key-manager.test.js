"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const aes256_js_1 = require("../crypto/aes256.js");
const key_manager_service_js_1 = require("./key-manager.service.js");
(0, node_test_1.describe)('Key Management & Access Gating Module (T19)', () => {
    (0, node_test_1.test)('Creates per-document DEK and stores wrapped key', async () => {
        const keyManager = new key_manager_service_js_1.KeyManagerService();
        const docId = 'doc-case-101';
        const ownerId = 'lawyer-alice';
        const dek = await keyManager.createDocumentKey(docId, ownerId);
        node_assert_1.default.strictEqual(typeof dek, 'string');
        node_assert_1.default.strictEqual(dek.length, 64);
        // Owner can retrieve DEK
        const retrievedDek = await keyManager.retrieveDocumentKey(docId, ownerId);
        node_assert_1.default.strictEqual(retrievedDek, dek);
    });
    (0, node_test_1.test)('Denies key retrieval to unauthorized users', async () => {
        const keyManager = new key_manager_service_js_1.KeyManagerService();
        const docId = 'doc-evidence-999';
        const ownerId = 'lawyer-bob';
        const intruderId = 'unauthorized-user';
        await keyManager.createDocumentKey(docId, ownerId);
        await node_assert_1.default.rejects(async () => {
            await keyManager.retrieveDocumentKey(docId, intruderId);
        }, (err) => {
            return err instanceof key_manager_service_js_1.AccessDeniedError;
        });
    });
    (0, node_test_1.test)('Allows authorized party access after explicit grantAccess call', async () => {
        const keyManager = new key_manager_service_js_1.KeyManagerService();
        const docId = 'doc-hearing-303';
        const ownerId = 'lawyer-alice';
        const judgeId = 'judge-patel';
        const dek = await keyManager.createDocumentKey(docId, ownerId);
        // Grant access to judge
        const granted = await keyManager.grantAccess(docId, ownerId, judgeId);
        node_assert_1.default.strictEqual(granted, true);
        // Judge can now retrieve DEK
        const judgeDek = await keyManager.retrieveDocumentKey(docId, judgeId);
        node_assert_1.default.strictEqual(judgeDek, dek);
    });
    (0, node_test_1.test)('Revokes key access when owner calls revokeAccess', async () => {
        const keyManager = new key_manager_service_js_1.KeyManagerService();
        const docId = 'doc-affidavit-707';
        const ownerId = 'lawyer-alice';
        const client = 'client-sharma';
        await keyManager.createDocumentKey(docId, ownerId);
        await keyManager.grantAccess(docId, ownerId, client);
        // Client can access
        const dek = await keyManager.retrieveDocumentKey(docId, client);
        node_assert_1.default.ok(dek);
        // Owner revokes access
        await keyManager.revokeAccess(docId, ownerId, client);
        // Access now denied
        await node_assert_1.default.rejects(async () => {
            await keyManager.retrieveDocumentKey(docId, client);
        }, key_manager_service_js_1.AccessDeniedError);
    });
    (0, node_test_1.test)('Full End-to-End Workflow: Encrypt -> Storage -> Key Management -> Decrypt', async () => {
        const keyManager = new key_manager_service_js_1.KeyManagerService();
        const docId = 'doc-e2e-workflow';
        const ownerId = 'lawyer-lead';
        const judgeId = 'judge-supreme';
        // 1. Generate DEK
        const dek = await keyManager.createDocumentKey(docId, ownerId);
        // 2. Encrypt legal document
        const rawDocumentText = 'SUPREME COURT ORDER: CASE #2026-SIH-1284 FINAL VERDICT';
        const encryptedPayload = await (0, aes256_js_1.encryptFile)(Buffer.from(rawDocumentText), dek);
        // 3. Grant access to Judge
        await keyManager.grantAccess(docId, ownerId, judgeId);
        // 4. Judge retrieves DEK via KeyManager
        const judgeDek = await keyManager.retrieveDocumentKey(docId, judgeId);
        // 5. Judge decrypts payload
        const decryptedBuffer = await (0, aes256_js_1.decryptFile)(encryptedPayload, judgeDek);
        node_assert_1.default.strictEqual(decryptedBuffer.toString('utf-8'), rawDocumentText);
    });
});
//# sourceMappingURL=key-manager.test.js.map