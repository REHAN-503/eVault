import assert from 'node:assert';
import { test, describe } from 'node:test';
import { encryptFile, decryptFile } from '../crypto/aes256.js';
import { KeyManagerService, AccessDeniedError } from './key-manager.service.js';
import { AccessControlContractStub } from './access-stub.js';

describe('Key Management & Access Gating Module (T19)', () => {
  test('Creates per-document DEK and stores wrapped key', async () => {
    const keyManager = new KeyManagerService();
    const docId = 'doc-case-101';
    const ownerId = 'lawyer-alice';

    const dek = await keyManager.createDocumentKey(docId, ownerId);
    assert.strictEqual(typeof dek, 'string');
    assert.strictEqual(dek.length, 64);

    // Owner can retrieve DEK
    const retrievedDek = await keyManager.retrieveDocumentKey(docId, ownerId);
    assert.strictEqual(retrievedDek, dek);
  });

  test('Denies key retrieval to unauthorized users', async () => {
    const keyManager = new KeyManagerService();
    const docId = 'doc-evidence-999';
    const ownerId = 'lawyer-bob';
    const intruderId = 'unauthorized-user';

    await keyManager.createDocumentKey(docId, ownerId);

    await assert.rejects(
      async () => {
        await keyManager.retrieveDocumentKey(docId, intruderId);
      },
      (err: any) => {
        return err instanceof AccessDeniedError;
      }
    );
  });

  test('Allows authorized party access after explicit grantAccess call', async () => {
    const keyManager = new KeyManagerService();
    const docId = 'doc-hearing-303';
    const ownerId = 'lawyer-alice';
    const judgeId = 'judge-patel';

    const dek = await keyManager.createDocumentKey(docId, ownerId);

    // Grant access to judge
    const granted = await keyManager.grantAccess(docId, ownerId, judgeId);
    assert.strictEqual(granted, true);

    // Judge can now retrieve DEK
    const judgeDek = await keyManager.retrieveDocumentKey(docId, judgeId);
    assert.strictEqual(judgeDek, dek);
  });

  test('Revokes key access when owner calls revokeAccess', async () => {
    const keyManager = new KeyManagerService();
    const docId = 'doc-affidavit-707';
    const ownerId = 'lawyer-alice';
    const client = 'client-sharma';

    await keyManager.createDocumentKey(docId, ownerId);
    await keyManager.grantAccess(docId, ownerId, client);

    // Client can access
    const dek = await keyManager.retrieveDocumentKey(docId, client);
    assert.ok(dek);

    // Owner revokes access
    await keyManager.revokeAccess(docId, ownerId, client);

    // Access now denied
    await assert.rejects(async () => {
      await keyManager.retrieveDocumentKey(docId, client);
    }, AccessDeniedError);
  });

  test('Full End-to-End Workflow: Encrypt -> Storage -> Key Management -> Decrypt', async () => {
    const keyManager = new KeyManagerService();
    const docId = 'doc-e2e-workflow';
    const ownerId = 'lawyer-lead';
    const judgeId = 'judge-supreme';

    // 1. Generate DEK
    const dek = await keyManager.createDocumentKey(docId, ownerId);

    // 2. Encrypt legal document
    const rawDocumentText = 'SUPREME COURT ORDER: CASE #2026-SIH-1284 FINAL VERDICT';
    const encryptedPayload = await encryptFile(Buffer.from(rawDocumentText), dek);

    // 3. Grant access to Judge
    await keyManager.grantAccess(docId, ownerId, judgeId);

    // 4. Judge retrieves DEK via KeyManager
    const judgeDek = await keyManager.retrieveDocumentKey(docId, judgeId);

    // 5. Judge decrypts payload
    const decryptedBuffer = await decryptFile(encryptedPayload, judgeDek);
    assert.strictEqual(decryptedBuffer.toString('utf-8'), rawDocumentText);
  });
});
