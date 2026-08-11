"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const local_adapter_js_1 = require("./local.adapter.js");
const s3_adapter_js_1 = require("./s3.adapter.js");
const storage_service_js_1 = require("./storage.service.js");
(0, node_test_1.describe)('Off-Chain Storage Backend Services', () => {
    (0, node_test_1.test)('LocalStorageAdapter uploads and retrieves encrypted buffers successfully', async () => {
        const adapter = new local_adapter_js_1.LocalStorageAdapter('./test_vault');
        const sampleBuffer = Buffer.from('ENCRYPTED_DOC_PAYLOAD_TEST_BYTES');
        const result = await adapter.uploadFile(sampleBuffer);
        node_assert_1.default.ok(result.cid);
        node_assert_1.default.ok(result.hash.startsWith('0x'));
        node_assert_1.default.strictEqual(result.driver, 'local');
        node_assert_1.default.strictEqual(result.size, sampleBuffer.length);
        const fetchedBuffer = await adapter.retrieveFile(result.cid);
        node_assert_1.default.strictEqual(fetchedBuffer.toString('utf-8'), 'ENCRYPTED_DOC_PAYLOAD_TEST_BYTES');
    });
    (0, node_test_1.test)('S3StorageAdapter uploads and retrieves successfully', async () => {
        const s3Adapter = new s3_adapter_js_1.S3StorageAdapter('sih1284-bucket', 'us-east-1');
        const sampleBuffer = Buffer.from('S3_ENCRYPTED_BUFFER');
        const result = await s3Adapter.uploadFile(sampleBuffer);
        node_assert_1.default.ok(result.cid.startsWith('s3-doc-'));
        node_assert_1.default.strictEqual(result.driver, 's3');
        const retrieved = await s3Adapter.retrieveFile(result.cid);
        node_assert_1.default.strictEqual(retrieved.toString('utf-8'), 'S3_ENCRYPTED_BUFFER');
    });
    (0, node_test_1.test)('Unified StorageService delegates to configured driver', async () => {
        const service = new storage_service_js_1.StorageService('local');
        const sampleData = Buffer.from('UNIFIED_SERVICE_DATA');
        const uploadRes = await service.uploadFile(sampleData);
        node_assert_1.default.ok(uploadRes.cid);
        const retrievedData = await service.retrieveFile(uploadRes.cid);
        node_assert_1.default.strictEqual(retrievedData.toString('utf-8'), 'UNIFIED_SERVICE_DATA');
    });
});
//# sourceMappingURL=storage.test.js.map