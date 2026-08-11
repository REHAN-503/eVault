import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DocumentRegistryContract } from './documentRegistry.contract';
import { createMockContext } from './testHelpers/mockContext';

const OWNER = '11111111-1111-4111-8111-111111111111';
const DOC1 = '33333333-3333-4333-8333-333333333333';

test('recordDocument: records a new document and auto-registers the owner', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  const result = JSON.parse(
    await registry.recordDocument(
      ctx,
      DOC1,
      'hash-v1',
      JSON.stringify({ filename: 'contract.pdf', mimetype: 'application/pdf', sizeBytes: 1024 }),
      OWNER,
      'LAWYER'
    )
  );

  assert.equal(result.docId, DOC1);
  assert.equal(result.hash, 'hash-v1');
  assert.ok(result.txId);

  // Owner should now be registered on-chain (composite key User\0<id>\0)
  const userKey = ctx.stub.createCompositeKey('User', [OWNER]);
  const stored = await ctx.stub.getState(userKey);
  assert.ok(stored.length > 0);
  const userRecord = JSON.parse(stored.toString('utf8'));
  assert.equal(userRecord.role, 'LAWYER');
});

test('recordDocument: rejects duplicate docId with 409', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  await registry.recordDocument(
    ctx,
    DOC1,
    'hash-v1',
    JSON.stringify({ filename: 'a.pdf' }),
    OWNER,
    'LAWYER'
  );

  await assert.rejects(
    () =>
      registry.recordDocument(
        ctx,
        DOC1,
        'hash-v2',
        JSON.stringify({ filename: 'a.pdf' }),
        OWNER,
        'LAWYER'
      ),
    /\[409\]/
  );
});

test('getDocument: returns 404 for unknown docId', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  await assert.rejects(() => registry.getDocument(ctx, DOC1), /\[404\]/);
});

test('updateDocument + getVersionHistory: real ledger history reflects every version', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  await registry.recordDocument(
    ctx,
    DOC1,
    'hash-v1',
    JSON.stringify({ filename: 'a.pdf', version: 1 }),
    OWNER,
    'LAWYER'
  );

  await registry.updateDocument(
    ctx,
    DOC1,
    'hash-v2',
    JSON.stringify({ filename: 'a.pdf', version: 2 })
  );

  await registry.updateDocument(
    ctx,
    DOC1,
    'hash-v3',
    JSON.stringify({ filename: 'a.pdf', version: 3 })
  );

  const current = JSON.parse(await registry.getDocument(ctx, DOC1));
  assert.equal(current.hash, 'hash-v3');

  const history = JSON.parse(await registry.getVersionHistory(ctx, DOC1));
  assert.equal(history.length, 3);
  assert.equal(history[0].hash, 'hash-v1');
  assert.equal(history[1].hash, 'hash-v2');
  assert.equal(history[2].hash, 'hash-v3');
  // Every entry should have a real timestamp string
  for (const entry of history) {
    assert.ok(entry.timestamp);
    assert.ok(!Number.isNaN(new Date(entry.timestamp).getTime()));
  }
});

test('updateDocument: 404 when document does not exist', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  await assert.rejects(
    () => registry.updateDocument(ctx, DOC1, 'hash-v2', JSON.stringify({})),
    /\[404\]/
  );
});

test('recordDocument: rejects invalid metadata JSON', async () => {
  const ctx = createMockContext();
  const registry = new DocumentRegistryContract();

  await assert.rejects(
    () =>
      registry.recordDocument(ctx, DOC1, 'hash-v1', 'not-json{{{', OWNER, 'LAWYER'),
    /\[400\]/
  );
});
