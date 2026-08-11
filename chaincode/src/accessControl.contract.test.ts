import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AccessControlContract } from './accessControl.contract';
import { DocumentRegistryContract } from './documentRegistry.contract';
import { createMockContext } from './testHelpers/mockContext';

const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';
const DOC1 = '33333333-3333-4333-8333-333333333333';

test('registerUser: registers a valid user and returns txId', async () => {
  const ctx = createMockContext();
  const contract = new AccessControlContract();

  const result = await contract.registerUser(ctx, U1, 'LAWYER');
  const parsed = JSON.parse(result);

  assert.equal(parsed.userId, U1);
  assert.equal(parsed.role, 'LAWYER');
  assert.ok(parsed.txId);
});

test('registerUser: rejects invalid role', async () => {
  const ctx = createMockContext();
  const contract = new AccessControlContract();

  await assert.rejects(
    () => contract.registerUser(ctx, U1, 'SUPERADMIN'),
    /\[400\]/
  );
});

test('registerUser: rejects non-UUID id', async () => {
  const ctx = createMockContext();
  const contract = new AccessControlContract();

  await assert.rejects(
    () => contract.registerUser(ctx, 'not-a-uuid', 'LAWYER'),
    /\[400\]/
  );
});

test('registerUser: rejects duplicate registration with 409', async () => {
  const ctx = createMockContext();
  const contract = new AccessControlContract();

  await contract.registerUser(ctx, U1, 'LAWYER');
  await assert.rejects(
    () => contract.registerUser(ctx, U1, 'LAWYER'),
    /\[409\]/
  );
});

test('grantAccess: fails with 404 when document does not exist', async () => {
  const ctx = createMockContext();
  const access = new AccessControlContract();

  await assert.rejects(
    () => access.grantAccess(ctx, DOC1, U2, 'READ'),
    /\[404\]/
  );
});

test('grantAccess / checkAccess / revokeAccess: full happy path', async () => {
  const ctx = createMockContext();
  const access = new AccessControlContract();
  const registry = new DocumentRegistryContract();

  await registry.recordDocument(
    ctx,
    DOC1,
    'deadbeef',
    JSON.stringify({ filename: 'a.pdf' }),
    U1,
    'LAWYER'
  );

  // Not yet granted
  const before = await access.checkAccess(ctx, DOC1, U2);
  assert.equal(before, false);

  const grantResult = JSON.parse(
    await access.grantAccess(ctx, DOC1, U2, 'READ')
  );
  assert.equal(grantResult.permission, 'READ');

  const after = await access.checkAccess(ctx, DOC1, U2);
  assert.equal(after, true);

  // Owner always has implicit access
  const ownerAccess = await access.checkAccess(ctx, DOC1, U1);
  assert.equal(ownerAccess, true);

  await access.revokeAccess(ctx, DOC1, U2);
  const afterRevoke = await access.checkAccess(ctx, DOC1, U2);
  assert.equal(afterRevoke, false);
});

test('grantAccess: same permission twice throws 409, but upgrading READ->WRITE is allowed', async () => {
  const ctx = createMockContext();
  const access = new AccessControlContract();
  const registry = new DocumentRegistryContract();

  await registry.recordDocument(
    ctx,
    DOC1,
    'deadbeef',
    JSON.stringify({ filename: 'a.pdf' }),
    U1,
    'LAWYER'
  );

  await access.grantAccess(ctx, DOC1, U2, 'READ');

  await assert.rejects(
    () => access.grantAccess(ctx, DOC1, U2, 'READ'),
    /\[409\]/
  );

  // Upgrading to WRITE should succeed, not throw
  const upgraded = JSON.parse(
    await access.grantAccess(ctx, DOC1, U2, 'WRITE')
  );
  assert.equal(upgraded.permission, 'WRITE');
});

test('revokeAccess: throws 404 when nothing to revoke', async () => {
  const ctx = createMockContext();
  const access = new AccessControlContract();

  await assert.rejects(
    () => access.revokeAccess(ctx, DOC1, U2),
    /\[404\]/
  );
});
