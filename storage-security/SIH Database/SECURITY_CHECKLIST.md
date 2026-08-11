# SIH1284 — Security Review & Audit Checklist (Member 4 Scope)

This security checklist covers self-audit verification points for **Storage, Security & Database Lead (Member 4)** prior to the Smart India Hackathon demo.

---

## 1. Encryption & Cryptography Audit

- [x] **Zero Plaintext Transmission**: Files are encrypted on the client side (`encryptFile`) before leaving the client context. Raw documents never touch off-chain storage or backend gateways in plaintext.
- [x] **Algorithm Standard**: Uses standard **AES-256-GCM** (Galois/Counter Mode) with 128-bit authentication tags.
- [x] **IV Uniqueness**: Every encryption operation generates a cryptographically random 96-bit (12-byte) Initialization Vector (`crypto.randomBytes(12)`). IVs are never reused across documents.
- [x] **Integrity Verification**: Authentication tags (`tag`) are verified during decryption to prevent tampering or ciphertext modification.
- [x] **Cryptographic Hash Anchoring**: Calculates SHA-256 (`computeFileHash`) of raw document bytes to generate `docHash` (`0x...`) for Hyperledger Fabric blockchain anchoring.

---

## 2. Key Management & Access Control Audit

- [x] **Per-Document Encryption Keys (DEK)**: Unique 256-bit DEK generated for every single uploaded document (no shared global key).
- [x] **Envelope Encryption Architecture**: Document Encryption Keys (DEKs) are wrapped/encrypted using a 256-bit Master Key Encryption Key (KEK) before storage.
- [x] **Smart Contract Access Gating**: `KeyManagerService.retrieveDocumentKey(docId, userId)` enforces a mandatory check against `AccessControlContractStub.checkAccess(docId, userId)`.
- [x] **Unauthorized Access Rejection**: Requests from non-permitted user IDs throw `AccessDeniedError` and immediately abort key unwrapping.
- [x] **Dynamic Grant/Revoke Logic**: Supports `grantAccess` and `revokeAccess` routines to update permission mappings for lawyers, judges, court staff, and clients.

---

## 3. Database Non-Sensitivity & Privacy Audit

- [x] **No Raw Files**: PostgreSQL schema (`document_metadata`) explicitly excludes document binary data or plaintext contents.
- [x] **No Unencrypted Keys**: Database contains NO Document Encryption Keys or Master KEKs.
- [x] **Metadata Scope**: Stores only non-sensitive metadata (`id`, `title`, `doc_hash`, `storage_cid`, `owner_id`, `mime_type`, `file_size_bytes`).
- [x] **Session Token Hashing**: Session tokens are stored as SHA-256 hashes (`token_hash`) rather than plaintext secrets.

---

## 4. Off-Chain Storage & Backend Containerization Audit

- [x] **Encrypted Data Only**: Off-chain storage adapters (IPFS Kubo node / AWS S3 / Local Vault) store exclusively AES-256 encrypted buffers.
- [x] **Immutability & Integrity**: Storage identifiers (IPFS CIDs / hashes) guarantee content addressing.
- [x] **Multi-Driver Fallback**: Supports `STORAGE_DRIVER=ipfs|s3|local` for fallback capability during hackathon presentation if IPFS daemon is unavailable.
- [x] **Container Isolation**: Exposes minimal Docker container (`docker/Dockerfile.storage`) with non-root runtime environment and explicit port binding (`4001`).

---

## 5. Teammate Handoff & Interface Audit

- [x] **Member 1 (Frontend Lead)**: Client-side crypto utility functions (`encryptFile`, `decryptFile`, `generateKey`) exported in `src/crypto/index.ts`.
- [x] **Member 2 (Backend Lead)**: Unified `storageService` (`uploadFile`, `retrieveFile`) and `keyManagerService` exported in `src/index.ts`.
- [x] **Member 3 (Blockchain Lead)**: Unambiguous `0x`-prefixed `docHash` and IPFS `storage_cid` ready for smart contract `recordDocument` call.
- [x] **Member 5 (DevOps Lead)**: Containerized Dockerfile ready at `docker/Dockerfile.storage`.
