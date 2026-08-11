# eVault Backend — API Gateway

> Blockchain-Based eVault for Legal Records  
> Ministry of Law and Justice — Smart India Hackathon 2024 (SIH1284)

## Overview

This is the backend API gateway for the eVault system. It serves as the central orchestration layer between:
- **React Frontend** (separate repository)
- **PostgreSQL** (relational metadata store)
- **Hyperledger Fabric** (blockchain ledger — mocked)
- **IPFS / Encrypted Storage** (off-chain document storage — mocked)
- **Court Case-Management System** (CIS — permanently mocked for demo)

The backend is fully testable via Postman/Thunder Client without requiring the frontend or any external services.

## Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js (LTS) |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit, bcrypt |
| File Upload | Multer (memoryStorage) |
| API Docs | Swagger / OpenAPI |
| Testing | Jest, Supertest |
| Containerization | Docker, Docker Compose |

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL 14+ (or Docker)

### 1. Clone & Install
```bash
git clone https://github.com/REHAN-503/evault-backend.git
cd evault-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed    # Optional: seeds demo data
```

### 4. Start Server
```bash
npm run dev
```

Server starts at `http://localhost:3000`.

### 5. Explore
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Postman Collection**: Import `docs/evault-postman-collection.json`

## Docker

```bash
docker compose up -d
```

This starts both PostgreSQL and the API server. Then run migrations:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api node scripts/seed.js
```

## Project Structure

```
evault-backend/
├── src/
│   ├── app.js              # Express app (no .listen())
│   ├── server.js            # Entry point (.listen())
│   ├── config/              # Env config + Prisma client
│   ├── routes/v1/           # Versioned route modules
│   ├── controllers/         # Request → Service → Response
│   ├── services/            # Business logic
│   │   ├── auth/            # Authentication service
│   │   ├── document/        # Document orchestration
│   │   ├── blockchain/      # MOCK — Hyperledger Fabric
│   │   ├── storage/         # MOCK — IPFS (local disk)
│   │   ├── audit/           # Audit log service
│   │   └── integration/     # MOCK — Court CIS adapter
│   ├── repositories/        # Data access (ONLY Prisma consumer)
│   ├── middlewares/          # Auth, RBAC, validation, errors
│   ├── validators/          # Zod schemas
│   ├── models/              # Domain enums (mirrors Prisma)
│   ├── utils/               # Response helpers, logger
│   ├── constants/           # App-wide constants
│   ├── types/               # JSDoc typedefs
│   └── docs/                # Swagger config
├── prisma/                  # Schema & migrations
├── tests/                   # Jest + Supertest
├── scripts/                 # Seed, utilities
├── docs/                    # CONTRACTS.md, Postman collection
├── docker/                  # Auxiliary Docker files
└── uploads/                 # Mock IPFS storage (gitignored)
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login, receive tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Current user profile |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/documents/upload` | Upload encrypted document |
| GET | `/api/v1/documents` | List documents (paginated) |
| GET | `/api/v1/documents/:id` | Get document metadata |
| GET | `/api/v1/documents/:id/download` | Download document file |
| PUT | `/api/v1/documents/:id` | Update (new version) |
| DELETE | `/api/v1/documents/:id` | Soft-delete |
| POST | `/api/v1/documents/:id/share` | Grant access |
| POST | `/api/v1/documents/:id/revoke` | Revoke access |
| GET | `/api/v1/documents/:id/history` | Version history |
| GET | `/api/v1/documents/:id/audit` | Audit trail |

### Integration
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/integration/cis/sync` | Sync with Court CIS (mocked) |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check (with DB ping) |
| GET | `/api-docs` | Swagger UI |
| GET | `/api-docs.json` | OpenAPI JSON spec |

## Roles & Permissions

| Role | Upload | View Own | View All | Share/Revoke | Delete | CIS Sync |
|---|---|---|---|---|---|---|
| LAWYER | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| CLIENT | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| JUDGE | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@evault.in | Password123 |
| Lawyer | lawyer@evault.in | Password123 |
| Judge | judge@evault.in | Password123 |
| Client | client@evault.in | Password123 |

## Testing

```bash
npm test                 # Run all tests
npm run test:coverage    # Run with coverage report
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset database |

## For Teammates

- **Member 3 (Blockchain)**: See `docs/CONTRACTS.md` for blockchain service interface spec. Replace `src/services/blockchain/blockchain.service.js`.
- **Member 4 (Storage/Security)**: See `docs/CONTRACTS.md` for storage service interface spec. Replace `src/services/storage/storage.service.js`.
- **Member 5 (DevOps)**: `Dockerfile` and `docker-compose.yml` at repo root. Health check at `/health`.
- **Member 1 (Frontend)**: All endpoints documented at `/api-docs`. Postman collection in `docs/`.

## License

ISC
