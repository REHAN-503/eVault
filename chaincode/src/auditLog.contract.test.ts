import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AuditLogContract } from './auditLog.contract';
import { createMockContext } from './testHelpers/mockContext';

const USER = '11111111-1111-4111-8111-111111111111';
const DOC1 = '33333333-3333-4333-8333-333333333333';

test('logAction: records an entry and returns txId', async () => {
  const ctx = createMockContext();
  const audit = new AuditLogContract();

  const result = JSON.parse(await audit.logAction(ctx, DOC1, USER, 'UPLOAD'));
  assert.equal(result.docId, DOC1);
  assert.equal(result.action, 'UPLOAD');
  assert.ok(result.txId);
});

test('getAuditTrail: returns entries for a document in chronological order', async () => {
  const ctx = createMockContext();
  const audit = new AuditLogContract();

  await audit.logAction(ctx, DOC1, USER, 'UPLOAD');
  await audit.logAction(ctx, DOC1, USER, 'VIEW');
  await audit.logAction(ctx, DOC1, USER, 'SHARE');

  const trail = JSON.parse(await audit.getAuditTrail(ctx, DOC1));
  assert.equal(trail.length, 3);
  assert.deepEqual(
    trail.map((e: any) => e.action),
    ['UPLOAD', 'VIEW', 'SHARE']
  );
});

test('getAuditTrail: returns empty array for a document with no actions', async () => {
  const ctx = createMockContext();
  const audit = new AuditLogContract();

  const trail = JSON.parse(await audit.getAuditTrail(ctx, DOC1));
  assert.deepEqual(trail, []);
});

test('logAction: rejects empty action string', async () => {
  const ctx = createMockContext();
  const audit = new AuditLogContract();

  await assert.rejects(
    () => audit.logAction(ctx, DOC1, USER, ''),
    /\[400\]/
  );
});
