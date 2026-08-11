# eVault

A secure, presentation-ready, production-grade document management and vault system powered by Hyperledger Fabric, React, Express, and PostgreSQL.

## Architecture

* **Frontend:** React + Vite, TailwindCSS
* **Backend API Gateway:** Node.js, Express, Prisma ORM
* **Database:** PostgreSQL (Metadata \u0026 Audit indexing)
* **Blockchain:** Hyperledger Fabric (Immutable Document Registry \u0026 Access Control)
* **Storage:** Extensible Storage Provider (Local volume used by default)

## Getting Started

### Prerequisites

* Docker \u0026 Docker Compose
* Node.js (v18+)

### Running the Project

To start the full stack (Database, Fabric network, Backend API, Frontend):

```bash
docker-compose up --build -d
```

Once running:
* **Frontend Application:** http://localhost:8080
* **Backend API Gateway:** http://localhost:3000/api/v1
* **API Documentation (Swagger):** http://localhost:3000/api-docs

## Directory Structure

* `backend/` - The Express API Gateway and Prisma ORM configuration.
* `chaincode/` - Hyperledger Fabric Smart Contracts (TypeScript).
* `docker/` - Dockerfiles for deploying the application.
* `fabric/` - Configuration for the Fabric test network.
* `frontend/` - React application.
* `gateway/` - A Node.js module wrapping `@hyperledger/fabric-gateway` for gRPC connectivity.

## Environment Variables

All secrets are managed in `.env` files. Ensure you copy `.env.example` to `.env` in the `backend/` directory before running migrations locally outside of Docker.

## Testing

To build and test components individually:

**Frontend:**
```bash
cd frontend
npm install
npm run build
```

**Gateway Wrapper:**
```bash
cd gateway
npm install
npm run build
```

**Backend API:**
```bash
cd backend
npm install
npm run db:generate
npm run db:migrate # (Requires evault-postgres to be running)
npm test
```
*Note: Backend tests require Jest configuration for ES Module transformations (`@noble/curves`).*
