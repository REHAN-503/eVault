import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translateChaincodeError } from './errors';

test('translateChaincodeError: parses [404] prefix from err.message', () => {
  const err = new Error('some wrapper text: [404] Document not found: abc-123');
  const translated = translateChaincodeError(err);
  assert.equal(translated.statusCode, 404);
  assert.equal(translated.errorCode, 'NOT_FOUND');
  assert.match(translated.message, /Document not found: abc-123/);
});

test('translateChaincodeError: parses [409] from err.details[].message (endorsement error shape)', () => {
  const err = {
    message: 'generic endorsement failure',
    details: [{ message: 'chaincode response: [409] User already registered: xyz' }],
  };
  const translated = translateChaincodeError(err);
  assert.equal(translated.statusCode, 409);
  assert.equal(translated.errorCode, 'CONFLICT');
});

test('translateChaincodeError: parses [400] validation error', () => {
  const err = new Error('[400] role must be one of LAWYER, JUDGE, CLIENT, ADMIN, got: X');
  const translated = translateChaincodeError(err);
  assert.equal(translated.statusCode, 400);
  assert.equal(translated.errorCode, 'BAD_REQUEST');
});

test('translateChaincodeError: falls back to 500 when no recognizable status prefix exists', () => {
  const err = new Error('connection refused: could not reach peer0.org1.example.com:7051');
  const translated = translateChaincodeError(err);
  assert.equal(translated.statusCode, 500);
  assert.equal(translated.errorCode, 'CHAINCODE_ERROR');
  assert.match(translated.message, /connection refused/);
});

test('translateChaincodeError: handles non-Error thrown values gracefully', () => {
  const translated = translateChaincodeError('just a string error');
  assert.equal(translated.statusCode, 500);
  assert.equal(translated.message, 'just a string error');
});

test('translateChaincodeError: searches nested err.cause array', () => {
  const err = {
    message: 'top level wrapper',
    cause: [{ message: '[404] Document not found: nested-case' }],
  };
  const translated = translateChaincodeError(err);
  assert.equal(translated.statusCode, 404);
});
