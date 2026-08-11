# eVault Limitations & Future Work

As a hackathon prototype, eVault implements the core "strongest honest version" of a blockchain-backed legal document vault. However, certain limitations exist by design to fit within the prototype constraints.

## 1. Storage Backend
- **Current Implementation**: Documents are encrypted and stored in a local folder (`storage_vault/`).
- **Limitation**: While it simulates decentralized storage (generating CIDs and encrypting data off-chain), it is not a true IPFS or AWS S3 integration.
- **Future Fix**: Swap the local `fs` storage service with an IPFS node or an S3-compatible object storage service. The abstraction layer in `storage.service.js` supports this easily.

## 2. Integration Adapters
- **Current Implementation**: `CaseManagementAdapter` and `LegalDatabaseAdapter` are mocks that simulate network latency and return realistic formatted data.
- **Limitation**: They do not connect to real government CIS APIs, as those are usually private and authenticated.
- **Future Fix**: Replace the mock `Promise` returns with real `axios` or `fetch` calls to the respective institution's APIs using mutual TLS.

## 3. Key Management
- **Current Implementation**: A symmetric encryption key and JWT secret are injected via `.env`.
- **Limitation**: Lacks a hardware security module (HSM) or a dedicated Key Management Service (KMS).
- **Future Fix**: Integrate AWS KMS or HashiCorp Vault for envelope encryption of document payloads.
