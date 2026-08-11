# eVault Architecture

## System Overview
eVault is a secure, blockchain-backed legal document management system. It provides an immutable, transparent, and access-controlled vault for legal records, primarily catering to Courts, Judges, Lawyers, and Clients. 

The architecture marries a high-performance web backend with a distributed ledger (Hyperledger Fabric) to ensure data integrity without compromising on storage scalability.

## Core Layers

### 1. Presentation Layer (Frontend)
- **Framework**: React (Vite) with TailwindCSS.
- **Role**: Provides tailored dashboards for Admins, Judges, Lawyers, and Clients.
- **Routing**: Nginx handles reverse proxying in production, serving static files and routing API requests to the backend.

### 2. Application Layer (Backend API)
- **Framework**: Node.js / Express.
- **Role**: Handles business logic, authentication (JWT), role-based access control (RBAC), and document coordination.
- **Key Services**:
  - `document.service.js`: Manages the lifecycle of documents (upload, retrieve, share, verify).
  - `audit.service.js`: Writes immutable audit logs for all sensitive actions to Fabric.
  - `integration.service` (Adapters): Connects to external systems.

### 3. Data Persistence Layer (Relational Database)
- **Engine**: PostgreSQL accessed via Prisma ORM.
- **Role**: Stores highly relational metadata, user profiles, roles, permissions, and rapid-access state (e.g., cached currentHash, fast list queries).

### 4. Storage Layer (Secure Vault)
- **Implementation**: Local encrypted blob storage (`storage_vault/`).
- **Role**: Simulates decentralized storage (like IPFS). It holds the encrypted binary payloads of legal documents off-chain to avoid blooming the ledger.

### 5. Distributed Ledger Layer (Hyperledger Fabric)
- **Components**: Chaincode (`accessControl`, `documentRegistry`, `auditLog`), Gateway.
- **Role**: The source of cryptographic truth. 
- **Workflow**: When a document is uploaded, its SHA-256 hash is recorded on the ledger. When a Judge verifies a document, the backend queries the ledger and compares it against the Postgres metadata to prove immutability.

## Data Flow Diagram
```
Client Request -> Nginx Reverse Proxy
  -> Express API (JWT Auth + RBAC)
     -> Prisma (PostgreSQL) for Auth/Relational Check
     -> Storage Service (Local Vault) for Document Encryption/Decryption
     -> Gateway Service (Fabric SDK)
        -> Chaincode -> Hyperledger Fabric (Ledger Truth)
```
