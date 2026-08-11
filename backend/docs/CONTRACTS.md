# eVault Service Contracts — Interface Specification

> **Status**: Active  
> **Owner**: Backend / API Lead  
> **Audience**: Member 3 (Blockchain), Member 4 (Storage/Security)  
> **Last Updated**: 2026-08-04

This document defines the **exact method signatures** for the service abstractions
that sit between the eVault backend and the real Hyperledger Fabric / IPFS infrastructure.
The backend currently uses **mock implementations** that match these signatures exactly.

When you (Member 3, Member 4) are ready to integrate, swap the mock implementation
file — **not** the controller or service layer that calls it. The contract is the
function signature + return shape. If you need to change either, update this doc first
and notify the backend lead.

---

## 1. Blockchain Service (`src/services/blockchain/blockchain.service.js`)

All methods are `async` and return Promises.

### `registerUser(id, role)`

Register a user identity on the blockchain ledger.

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `id`      | string | User UUID            |
| `role`    | string | One of: LAWYER, JUDGE, CLIENT, ADMIN |

**Returns**: `{ userId: string, role: string, txId: string }`

---

### `recordDocument(docId, hash, metadata, ownerId)`

Record a new document on the DocumentRegistryContract.

| Parameter  | Type   | Description                      |
| ---------- | ------ | -------------------------------- |
| `docId`    | string | UUID — unique document reference |
| `hash`     | string | SHA-256 hash of file content     |
| `metadata` | object | `{ filename, mimetype, sizeBytes }` |
| `ownerId`  | string | Owner user UUID                  |

**Returns**: `{ docId: string, hash: string, txId: string }`

---

### `updateDocument(docId, newHash, metadata)`

Append a new version to the document's on-chain history.

| Parameter  | Type   | Description                      |
| ---------- | ------ | -------------------------------- |
| `docId`    | string | Existing document reference      |
| `newHash`  | string | SHA-256 hash of new file version |
| `metadata` | object | Updated metadata (includes version) |

**Returns**: `{ docId: string, hash: string, txId: string }`

---

### `getDocument(docId)`

Get the latest state of a document from the ledger.

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `docId`   | string | Document reference |

**Returns**: `{ hash: string, metadata: object }`

---

### `getVersionHistory(docId)`

Get the full version history of a document.

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `docId`   | string | Document reference |

**Returns**: `Array<{ hash: string, metadata: object, timestamp: string }>`

---

### `grantAccess(docId, userId, permission)`

Grant a user access to a document (AccessControlContract).

| Parameter    | Type   | Description                  |
| ------------ | ------ | ---------------------------- |
| `docId`      | string | Document reference           |
| `userId`     | string | User to grant access to      |
| `permission` | string | `'READ'` or `'WRITE'`       |

**Returns**: `{ docId: string, userId: string, permission: string, txId: string }`

---

### `revokeAccess(docId, userId)`

Revoke a user's access to a document.

| Parameter | Type   | Description             |
| --------- | ------ | ----------------------- |
| `docId`   | string | Document reference      |
| `userId`  | string | User to revoke from     |

**Returns**: `{ docId: string, userId: string, txId: string }`

---

### `checkAccess(docId, userId)`

Check if a user has access to a document.

| Parameter | Type   | Description             |
| --------- | ------ | ----------------------- |
| `docId`   | string | Document reference      |
| `userId`  | string | User to check           |

**Returns**: `boolean`

---

## 2. Storage Service (`src/services/storage/storage.service.js`)

All methods are `async` and return Promises.

### `upload(encryptedBuffer, metadata)`

Upload an encrypted file to off-chain storage.

| Parameter         | Type   | Description                    |
| ----------------- | ------ | ------------------------------ |
| `encryptedBuffer` | Buffer | Encrypted file data            |
| `metadata`        | object | `{ filename, mimetype }`       |

**Returns**: `{ cid: string }` — IPFS Content Identifier

---

### `download(cid)`

Download a file by its CID.

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `cid`     | string | Content Identifier   |

**Returns**: `Buffer` — the encrypted file data

**Throws**: `{ statusCode: 404, errorCode: 'NOT_FOUND' }` if CID not found

---

### `delete(cid)`

Delete a file by its CID.

| Parameter | Type   | Description          |
| --------- | ------ | -------------------- |
| `cid`     | string | Content Identifier   |

**Returns**: `void`

---

## 3. Integration Service (`src/services/integration/integration.service.js`)

### `syncWithCIS({ documentId, caseNumber, courtCode })`

Sync a document reference with the external Court Case-Management System.

> **Note**: This is permanently mocked for the hackathon demo.

| Parameter    | Type   | Description                   |
| ------------ | ------ | ----------------------------- |
| `documentId` | string | eVault document UUID          |
| `caseNumber` | string | Court case number             |
| `courtCode`  | string | Court identifier (e.g. 'SC')  |

**Returns**:
```json
{
  "caseId": "CIS-XXXXXXXX",
  "status": "SYNCED",
  "syncedAt": "2024-01-15T10:30:00.000Z",
  "caseRecord": {
    "caseNumber": "WP-2024-001",
    "courtCode": "SC",
    "courtName": "Supreme Court of India",
    "documentRef": "<documentId>",
    "filingDate": "2024-01-15",
    "status": "REGISTERED",
    "nextHearingDate": "2024-02-14",
    "judge": "Hon. Justice Mock Presiding",
    "parties": {
      "petitioner": "...",
      "respondent": "..."
    }
  }
}
```

---

## Implementation Notes

1. **Swap, don't modify**: Replace the mock file contents, keep the export signatures identical.
2. **Error handling**: Throw errors with `statusCode` and `errorCode` properties — the central error handler catches them.
3. **Logging**: Use `require('../../utils/logger')` for structured logging.
4. **Testing**: After swapping, run `npm test` to verify the integration tests still pass.
