# eVault Security & Access Control

## 1. Authentication
- JWT (JSON Web Tokens) are used for authentication.
- Access tokens expire in 15m. Refresh tokens expire in 7d.
- Passwords are hashed using bcrypt.

## 2. Authorization & RBAC
Strict Role-Based Access Control (RBAC) is enforced at the backend middleware layer and within business logic services.
- **Admin**: Full infrastructure oversight, user management, and audit log access.
- **Judge**: Access to verify ledger integrity, view shared documents, and grant/revoke access.
- **Lawyer**: Can upload documents, view own documents, and share explicit access to others. Cannot verify ledgers or bypass ownership.
- **Client**: Can only view documents explicitly shared with them.

## 3. Cryptography & Immutability
- **Document Hashing**: Every uploaded document is hashed using SHA-256 before encryption.
- **Storage Encryption**: Documents are encrypted before being saved to the `storage_vault/`.
- **Blockchain Ledger**: The SHA-256 hash is recorded on Hyperledger Fabric. When a Judge verifies a document, the backend queries both PostgreSQL and Fabric to ensure the hashes match perfectly.

## 4. Protection Mechanisms
- **IDOR Prevention**: All document retrieval endpoints (`/:id`, `/:id/download`) check if `req.user.id === document.ownerId` or if a valid `sharedWith` relation exists in Postgres + Fabric.
- **Input Validation**: Upload size limits, MIME type checking, and sanitized query parameters.
- **Gateway Isolation**: Direct Fabric access is isolated behind a Gateway service; clients never interact with the blockchain directly.
