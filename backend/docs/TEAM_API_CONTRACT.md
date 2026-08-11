# Team API Contracts

This document establishes the API contracts between the Backend, Frontend, Blockchain, and Storage teams. These interfaces are considered stable and should not be modified without cross-team agreement.

## 1. Frontend Contract

The frontend must provide `Authorization: Bearer <token>` in the header for protected routes.
The backend promises to always return data in the following standardized JSON format:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... } // Or an array
}
```

In case of error:
```json
{
  "success": false,
  "message": "Human readable error",
  "error": {
    "code": "ERROR_CODE_STRING",
    "details": "Optional details or array of validation errors"
  }
}
```

## 2. Blockchain Contract (Hyperledger Fabric)

The backend expects the `BlockchainService` to implement the following interface:

```typescript
interface IBlockchainService {
  /**
   * Register a user identity on the blockchain.
   */
  registerUser(id: string, role: string): Promise<{ userId: string, role: string, txId: string }>;

  /**
   * Record a document hash and metadata on the ledger.
   */
  recordDocument(docId: string, hash: string, metadata: { filename: string, mimetype: string, sizeBytes: number }, ownerId: string): Promise<{ docId: string, hash: string, txId: string }>;

  /**
   * Update a document with a new hash (version update).
   */
  updateDocument(docId: string, newHash: string, metadata: { filename: string, mimetype: string, sizeBytes: number, version: number }): Promise<{ docId: string, hash: string, txId: string }>;

  /**
   * Retrieve the current document hash and metadata.
   */
  getDocument(docId: string): Promise<{ hash: string, metadata: object }>;

  /**
   * Retrieve the full version history of a document.
   */
  getVersionHistory(docId: string): Promise<Array<{ hash: string, metadata: object, timestamp: string }>>;

  /**
   * Grant a user access (READ or WRITE) to a document.
   */
  grantAccess(docId: string, userId: string, permission: string): Promise<{ docId: string, userId: string, permission: string, txId: string }>;

  /**
   * Revoke a user's access from a document.
   */
  revokeAccess(docId: string, userId: string): Promise<{ docId: string, userId: string, txId: string }>;

  /**
   * Check if a user has access to a document.
   */
  checkAccess(docId: string, userId: string): Promise<boolean>;
}
```

### Integration Details
* **Who generates docId**: The Backend generates all UUIDs (including `docId`) and provides them to the blockchain. The blockchain must not generate document IDs.
* **Who generates hashes**: The Backend performs cryptographic hashing (SHA-256) of the file contents before passing the hash to the blockchain.
* **Who owns metadata**: Metadata ownership lies with the Backend, which stores it off-chain. Only a critical subset (filename, mimetype, sizeBytes, version) is passed to the blockchain for immutability tracking.
* **When `registerUser()` is executed**: Explicitly, never. Controllers and services do not call `registerUser`. It is invoked implicitly through automatic registration.
* **Automatic registration behavior**: The drop-in `RealBlockchainService` module MUST automatically register users by invoking `registerUser` behind the scenes if they do not exist on-chain during `recordDocument` and `grantAccess`. To resolve the user's role, the blockchain module must fetch the user details using the backend's `userRepository`. `checkAccess` and `revokeAccess` must not auto-register users (if they aren't registered, they implicitly have no access).
* **Permission model**: Only `READ` and `WRITE` permissions are allowed. Duplicate grants for the same permission level will throw an error, while updating permissions (e.g., READ to WRITE) is allowed.
* **Return values**: Functions must strictly return the defined objects (e.g., `{ docId, hash, txId }`). `checkAccess` must return a pure boolean (`true` or `false`), not an object.
* **Error handling**: The blockchain service must throw operational errors with correct HTTP status codes (e.g., 400 Validation Error, 404 Not Found, 409 Conflict) for invalid inputs, missing documents, or duplicate registrations/grants.
* **Integration expectations**: The `RealBlockchainService` must be a direct drop-in replacement for the mock implementation. The backend interfaces, controllers, services, and repositories must remain completely unchanged. The blockchain implementation must adhere to all validations (UUID, roles) and idempotency checks currently present in the mock.

## 3. Storage Contract (IPFS)

The backend expects the `StorageService` to implement the following interface:

```typescript
interface IStorageService {
  /**
   * Uploads file buffer to IPFS.
   * Returns a CID (Content Identifier).
   */
  uploadFile(fileBuffer: Buffer, mimetype: string): Promise<string>;

  /**
   * Retrieves file buffer from IPFS given a CID.
   */
  getFile(cid: string): Promise<Buffer>;
}
```
Currently, the backend uses `MockStorageService` which adheres to this contract.

## 4. Audit Contract

All major actions (`UPLOAD`, `VIEW`, `SHARE`, `REVOKE`, `UPDATE`) trigger an audit log. The audit logs are stored in PostgreSQL but in the future could be written to an immutable ledger if required.

## Correlation IDs

All API responses include an `X-Request-ID` header. Frontend applications should log this ID when encountering errors to allow the backend team to trace the issue in the logs.
