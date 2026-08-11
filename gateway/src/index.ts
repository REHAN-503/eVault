import { getContract } from './connection';
import { translateChaincodeError } from './errors';

/**
 * Drop-in replacement for evault-backend's mock blockchain.service.js.
 * Same 8 function names, same parameter order, same return shapes —
 * see docs/CONTRACTS.md / docs/TEAM_API_CONTRACT.md in evault-backend.
 *
 * Internally, each function submits/evaluates a transaction against the
 * real Hyperledger Fabric network (via @hyperledger/fabric-gateway),
 * targeting one of the three deployed contracts: AccessControlContract,
 * DocumentRegistryContract, AuditLogContract — all part of the single
 * 'evaultcc' chaincode on the 'evaultchannel' channel.
 */

function decode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('utf8');
}

async function submit(
  contractName: string,
  fn: string,
  ...args: string[]
): Promise<string> {
  try {
    const contract = await getContract(contractName);
    const result = await contract.submitTransaction(fn, ...args);
    return decode(result);
  } catch (err) {
    throw translateChaincodeError(err);
  }
}

async function evaluate(
  contractName: string,
  fn: string,
  ...args: string[]
): Promise<string> {
  try {
    const contract = await getContract(contractName);
    const result = await contract.evaluateTransaction(fn, ...args);
    return decode(result);
  } catch (err) {
    throw translateChaincodeError(err);
  }
}

// ---- AccessControlContract ----

export async function registerUser(
  id: string,
  role: string
): Promise<{ userId: string; role: string; txId: string }> {
  const raw = await submit('AccessControlContract', 'registerUser', id, role);
  return JSON.parse(raw);
}

export async function grantAccess(
  docId: string,
  userId: string,
  permission: string
): Promise<{ docId: string; userId: string; permission: string; txId: string }> {
  const raw = await submit(
    'AccessControlContract',
    'grantAccess',
    docId,
    userId,
    permission
  );
  return JSON.parse(raw);
}

export async function revokeAccess(
  docId: string,
  userId: string
): Promise<{ docId: string; userId: string; txId: string }> {
  const raw = await submit('AccessControlContract', 'revokeAccess', docId, userId);
  return JSON.parse(raw);
}

export async function checkAccess(
  docId: string,
  userId: string
): Promise<boolean> {
  const raw = await evaluate(
    'AccessControlContract',
    'checkAccess',
    docId,
    userId
  );
  return raw === 'true';
}

// ---- DocumentRegistryContract ----

export async function recordDocument(
  docId: string,
  hash: string,
  metadata: Record<string, unknown>,
  ownerId: string,
  ownerRole: string
): Promise<{ docId: string; hash: string; txId: string }> {
  const raw = await submit(
    'DocumentRegistryContract',
    'recordDocument',
    docId,
    hash,
    JSON.stringify(metadata),
    ownerId,
    ownerRole
  );
  return JSON.parse(raw);
}

export async function updateDocument(
  docId: string,
  newHash: string,
  metadata: Record<string, unknown>
): Promise<{ docId: string; hash: string; txId: string }> {
  const raw = await submit(
    'DocumentRegistryContract',
    'updateDocument',
    docId,
    newHash,
    JSON.stringify(metadata)
  );
  return JSON.parse(raw);
}

export async function getDocument(
  docId: string
): Promise<{ hash: string; metadata: Record<string, unknown> }> {
  const raw = await evaluate('DocumentRegistryContract', 'getDocument', docId);
  return JSON.parse(raw);
}

export async function getVersionHistory(
  docId: string
): Promise<Array<{ hash: string; metadata: Record<string, unknown>; timestamp: string }>> {
  const raw = await evaluate(
    'DocumentRegistryContract',
    'getVersionHistory',
    docId
  );
  return JSON.parse(raw);
}

// ---- AuditLogContract (bonus, not in the original 8 but useful) ----

export async function logAction(
  docId: string,
  userId: string,
  action: string
): Promise<{ docId: string; userId: string; action: string; txId: string }> {
  const raw = await submit('AuditLogContract', 'logAction', docId, userId, action);
  return JSON.parse(raw);
}

export async function getAuditTrail(
  docId: string
): Promise<Array<{ docId: string; userId: string; action: string; timestamp: string }>> {
  const raw = await evaluate('AuditLogContract', 'getAuditTrail', docId);
  return JSON.parse(raw);
}

export { closeConnection } from './connection';
