# eVault Frontend Integration Guide

This document outlines how the backend team should integrate with the eVault React frontend.

The frontend uses a **per-concern mock/live switch** in `src/api/auth.js`, `src/api/documents.js`, and `src/api/system.js`. Each file imports from `src/api/mock/*` or `src/api/live/*` based on `VITE_USE_MOCK`. UI components never branch on mock mode — only the API facades do.

## Switching to Live Mode

The frontend environment is controlled via the `.env` file at the root of the project.

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

1. Set `VITE_USE_MOCK=false`.
2. Set `VITE_API_BASE_URL` to point to the API Gateway.
3. Restart the Vite dev server (`npm run dev`).

Each facade file (`src/api/auth.js`, `src/api/documents.js`, `src/api/system.js`) will now route calls through `src/api/live/` instead of `src/api/mock/`.

## API Contracts to Implement

The backend must implement the following endpoints to satisfy the frontend's expectations. All endpoints expect and return JSON, and all endpoints (except login/register) expect an Authorization header (e.g., `Bearer <token>`).

> **Note:** User provisioning is handled via `POST /auth/register` (not a separate `/users` module). Access control is on the documents routes. Audit trail is per-document via `GET /documents/:docId/audit`.

### 1. Authentication (`src/api/live/auth.js`)

#### `POST /auth/login`
- **Request:** `{ email, password }`
- **Response:** `{ token, refreshToken?, user: { id, name, email, role } }`

#### `POST /auth/register`
- **Request:** `{ fullName, email, password, role }`
- **Response:** `{ success: true, message: "User registered" }`

#### `GET /auth/me`
- **Response:** `{ id, name, email, role }`

#### `POST /auth/refresh`
- **Request:** `{ refreshToken }`
- **Response:** `{ token, refreshToken? }`

#### `POST /auth/logout`
- **Request:** `{ refreshToken }`
- **Response:** `{ success: true }`

### 2. Documents (`src/api/live/documents.js`)

#### `GET /documents`
- **Query params:** `page`, `limit`, `search` (optional)
- **Response:** `{ data: [ { docId, title, caseNo, version, status, hash, cid, ownerId, ownerName, sharedWith, size, createdAt, updatedAt }, ... ] }`

#### `GET /documents/:docId`
- **Response:** `{ docId, title, caseNo, version, status, hash, cid, ownerId, ownerName, sharedWith, size, createdAt, updatedAt }`

#### `GET /documents/:docId/history`
- **Response:** `[ { version, hash, cid, url, updatedBy, updatedAt }, ... ]`

#### `GET /documents/:docId/audit`
- **Response:** `[ { id, docId, action, userId, userName, timestamp }, ... ]`

#### `GET /documents/:docId/download`
- **Response:** Encrypted file blob (client decrypts with demo key)

#### `POST /documents/upload`
- **Request (FormData):** `file` (File, AES-256 encrypted client-side), `title` (String), `caseNo` (String)
- **Response:** `{ docId, hash, cid, version, status, updatedAt, ... }`

#### `PUT /documents/:docId`
- **Request (FormData):** `file` (File, encrypted)
- **Response:** `{ version, hash, cid, updatedAt, ... }`

#### `POST /documents/:docId/share`
- **Request:** `{ userId, permission }` — permission is `READ` or `WRITE`
- **Response:** `{ success: true }`

#### `POST /documents/:docId/revoke`
- **Request:** `{ userId }`
- **Response:** `{ success: true }`

#### `DELETE /documents/:docId`
- **Response:** `{ success: true }`

> Access verification in the UI calls `GET /documents/:docId` and treats a 200 as `{ allowed: true }`.

### 3. System Status (`src/api/live/system.js`)

#### `GET /system/status`
- **Response:** `{ status: 'ok', version: '1.0.0', services: { database: 'connected', blockchain: 'operational', storage: 'operational' } }`

#### `GET /system/info`
- **Response:** `{ environment: 'production', metrics: { totalDocuments: 15, verifiedToday: 3, auditEvents: 45, registeredUsers: 8 } }`

## Error Handling

The frontend expects standard HTTP status codes.
- `401 Unauthorized`: Triggers token refresh; on failure, clears session and dispatches `auth:unauthorized`.
- `400 / 500`: Returns the JSON error payload. The frontend expects `{ message: "Error description" }` to display to the user.
