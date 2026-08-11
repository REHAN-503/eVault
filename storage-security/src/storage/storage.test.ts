import assert from 'node:assert';
import { test, describe } from 'node:test';
import { LocalStorageAdapter } from './local.adapter.js';
import { S3StorageAdapter } from './s3.adapter.js';
import { StorageService } from './storage.service.js';

describe('Off-Chain Storage Backend Services', () => {
  test('LocalStorageAdapter uploads and retrieves encrypted buffers successfully', async () => {
    const adapter = new LocalStorageAdapter('./test_vault');
    const sampleBuffer = Buffer.from('ENCRYPTED_DOC_PAYLOAD_TEST_BYTES');

    const result = await adapter.uploadFile(sampleBuffer);
    assert.ok(result.cid);
    assert.ok(result.hash.startsWith('0x'));
    assert.strictEqual(result.driver, 'local');
    assert.strictEqual(result.size, sampleBuffer.length);

    const fetchedBuffer = await adapter.retrieveFile(result.cid);
    assert.strictEqual(fetchedBuffer.toString('utf-8'), 'ENCRYPTED_DOC_PAYLOAD_TEST_BYTES');
  });

  test('S3StorageAdapter uploads and retrieves successfully', async () => {
    const s3Adapter = new S3StorageAdapter('sih1284-bucket', 'us-east-1');
    const sampleBuffer = Buffer.from('S3_ENCRYPTED_BUFFER');

    const result = await s3Adapter.uploadFile(sampleBuffer);
    assert.ok(result.cid.startsWith('s3-doc-'));
    assert.strictEqual(result.driver, 's3');

    const retrieved = await s3Adapter.retrieveFile(result.cid);
    assert.strictEqual(retrieved.toString('utf-8'), 'S3_ENCRYPTED_BUFFER');
  });

  test('Unified StorageService delegates to configured driver', async () => {
    const service = new StorageService('local');
    const sampleData = Buffer.from('UNIFIED_SERVICE_DATA');

    const uploadRes = await service.uploadFile(sampleData);
    assert.ok(uploadRes.cid);

    const retrievedData = await service.retrieveFile(uploadRes.cid);
    assert.strictEqual(retrievedData.toString('utf-8'), 'UNIFIED_SERVICE_DATA');
  });
});
