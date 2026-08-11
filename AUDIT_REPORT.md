# eVault Audit Report

## 1. Architecture Overview
The eVault project is a service-oriented, blockchain-backed legal document management system consisting of:
- **Frontend**: React application built with Vite and TailwindCSS, served via Nginx in production.
- **Backend API**: Node.js/Express service providing RESTful endpoints, documented via Swagger.
- **Database**: PostgreSQL accessed via Prisma ORM for relational metadata, users, roles, and access control mappings.
- **Storage**: Secure local storage vault (currently simulating decentralized storage/IPFS) for encrypted document blobs.
- **Blockchain Gateway**: A Node.js/TypeScript intermediary service connecting the Backend to the Hyperledger Fabric network.
- **Chaincode**: Hyperledger Fabric smart contracts managing immutable access records and cryptographic verification hashes.

## 2. Components
- **`frontend/`**: Contains React components, pages (dashboard, documents, login), context providers for Auth, and API integration hooks.
- **`backend/`**: Node.js service containing controllers, repositories, Prisma schema, services (document, audit, auth, blockchain, storage).
- **`gateway/`**: TypeScript service acting as a bridge to Fabric.
- **`chaincode/`**: TypeScript smart contracts (`accessControl`, `documentRegistry`, `auditLog`).
- **`fabric/`**: Infrastructure configuration for local Hyperledger Fabric test network.
- **`storage_vault/`**: Secure local storage for encrypted uploaded documents.

## 3. Data Flow
1. **Upload**: Client -> Nginx -> Backend (document.service) -> StorageVault -> PostgreSQL (metadata) -> Gateway -> Fabric (hash).
2. **Retrieve/Download**: Client -> Backend -> PostgreSQL (Access check) -> StorageVault (Decrypt) -> Client.
3. **Verify**: Judge Client -> Backend -> PostgreSQL (hash) + Gateway/Fabric (hash) -> Comparison -> Result to Client.
4. **Share**: Judge/Admin/Lawyer -> Backend -> PostgreSQL (relation) + Gateway/Fabric (Grant Access) -> Client.

## 4. Role Matrix
| Operation               | Admin | Judge | Lawyer | Client|
|-------------------------|-------|-------|--------|-------|
| Login                   | YES   | YES   | YES    | YES   |
| View own profile        | YES   | YES   | YES    | YES   |
| Upload legal document   | YES   | NO    | YES    | NO    |
| View own documents      | YES   | YES   | YES    | YES   |
| Update own document     | YES   | NO    | YES    | NO    |
| Delete own document     | YES   | NO    | YES    | NO    |
| Verify ledger           | YES   | YES   | NO     | NO    |
| Grant document access   | YES   | YES   | NO     | NO    |
| Revoke document access  | YES   | YES   | NO     | NO    |
| Manage users            | YES   | NO    | NO     | NO    |
| View audit logs         | YES   | YES   | LIMITED| LIMITED|

## 5. Current Issues Identified (Phase 2 Roadmap)
- **Security/API Issues**: Need to double check IDOR across all document fetch/update operations (most recent tests pass, but need regression check).
- **Interoperability**: Missing explicit mock adapter for external legal database integration as per hackathon requirement.
- **UI/Dark Mode**: Dark mode consistency needs verification across all dashboards.
- **Docker Integration**: `docker-compose.yml` needs testing for clean multi-container startup without race conditions.
- **Documentation**: Several markdown files (`ARCHITECTURE.md`, `SECURITY.md`, `BUSINESS_PLAN.md`, etc.) are missing or incomplete.
