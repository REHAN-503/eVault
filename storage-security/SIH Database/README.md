# SIH1284 — Member 4 Scope: Storage, Security & Database Module

Module Lead: Member 4 (Storage, Security & Database Lead)  
Project: SIH1284 — Blockchain-Based eVault for Legal Records (Ministry of Law and Justice)

---

## Deliverables Summary

1. **Client-Side AES-256 Encryption/Decryption (`src/crypto`)** [T17]
2. **Off-Chain Storage Backend (`src/storage`)** [T16]
3. **PostgreSQL Schema & Migrations (`migrations/`, `src/db`)** [T18]
4. **Key Management & Access Gating Module (`src/key-management`)** [T19]
5. **Security Audit Checklist (`SECURITY_CHECKLIST.md`)** [T20]

---

## Integration Handoff Guide for Teammates

### Member 1 (Frontend UI Lead)
Use `encryptFile` before uploading document bytes, and `decryptFile` after retrieving encrypted bytes.

```typescript
import { generateKey, encryptFile, decryptFile, computeFileHash } from './src/crypto';

// 1. Calculate document hash for blockchain
const docHash = computeFileHash(fileBuffer);

// 2. Encrypt file on client side with per-document key (DEK)
const encryptedPayload = await encryptFile(fileBuffer, dek);
```

---

### Member 2 (Backend Gateway Lead)
Use `storageService` and `keyManagerService` from `src/index.ts`.

```typescript
import { storageService, keyManagerService } from './src';

// 1. Upload encrypted buffer to off-chain storage
const { cid, hash } = await storageService.uploadFile(packedEncryptedBuffer);

// 2. Create and store envelope-encrypted document key
const dek = await keyManagerService.createDocumentKey(docId, ownerUserId);

// 3. Authorized retrieval gated by checkAccess stub
const dek = await keyManagerService.retrieveDocumentKey(docId, requestingUserId);
const encryptedBuffer = await storageService.retrieveFile(cid);
```

---

### Member 3 (Blockchain Smart Contract Lead)
Pass the returned `hash` (`0x...`) and `cid` (`Qm...`) to your Fabric contract `recordDocument(docId, docHash, storageCid)`.

---

### Member 5 (DevOps Lead)
Build and run the standalone storage backend container:

```bash
docker build -t sih1284-storage -f docker/Dockerfile.storage .
docker run -p 4001:4001 -e STORAGE_DRIVER=local sih1284-storage
```

---

## Running Unit Tests & Database Migrations

```bash
# Run unit tests across all modules
npm run test:src

# Run PostgreSQL database migrations
npm run db:migrate
```
