# eVault — Frontend

Frontend for **SIH1284: Blockchain-Based eVault for Legal Records**, built to the
stack in the architecture doc: **React.js + Tailwind CSS**, talking to a
**Node.js/Express API Gateway**, which fronts the **Document / Blockchain / Audit
microservices**, **Hyperledger Fabric**, **IPFS**, and **PostgreSQL**.

It ships in **mock mode** by default, so the whole app — landing page, login,
all four role portals, upload flow, verification, audit trail — runs and demos
completely standalone, before your teammates' backend, database, or chain are
even up. Flip one env var when they are, and it's live.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Sign in by selecting a role and using the corresponding mock email:
- Lawyer: `lawyer@gov.in`
- Judge: `judge@gov.in`
- Admin: `admin@gov.in`
- Client: `client@gov.in`
*(Any password will work).*

## Connect the real backend

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_BASE_URL` to your deployed API Gateway, e.g.
   `http://localhost:4000/api/v1`.
3. Set `VITE_USE_MOCK=false`.

That's it — no component code changes. Every function in `src/api/*.js` already
calls the REST path your Express gateway is expected to expose. The mock/live
switch lives **per concern** in each facade file (`auth.js`, `documents.js`,
`system.js`) — there is no central `src/api/index.js`.

| File | Talks to |
|---|---|
| `src/api/auth.js` | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` — JWT/OAuth layer |
| `src/api/documents.js` | `/documents` routes — wraps `DocumentRegistryContract` + `AccessControlContract` + per-document audit via `getDocumentAudit` (`recordDocument`, `getDocument`, `getVersionHistory`, `grantAccess`, `revokeAccess`, `checkAccess`) |
| `src/api/system.js` | `GET /system/status`, `GET /system/info` — infrastructure health and registry metrics (document counts, audit event totals) |

The upload flow (`uploadDocument` in `documents.js`) narrates the exact 7-step
pipeline from the architecture doc (encrypt → auth → IPFS → CID → recordDocument
→ ledger write → `DocumentAdded` event) via an `onStep` callback, so once real
upload progress/websocket events exist, you can feed them into the same UI with
no redesign.

Auth uses a JWT stored in `localStorage` and attached to every request via an
axios interceptor in `src/api/client.js` — matches the JWT/OAuth 2.0 + MFA line
in the tech stack table.

## Structure

```
src/
  api/            one file per backend concern, mock/live switch lives here only
  components/     Seal (verification badge), PortalShell (nav shell), Atoms, UploadModal
  context/        auth session
  routes/         role-based route guard
  pages/          Landing, Login, LawyerDashboard, JudgeDashboard, AdminDashboard,
                  ClientDashboard, AuditPage (shared), DocumentDetail
```

## Design notes

- Palette, type, and the "seal" motif (a document's on-chain hash proof rendered
  as an official stamp, pressed down once the ledger confirms it) are described
  so the visual language stays consistent if you extend it — see `Seal.jsx`.
- Layout is responsive down to mobile; the sidebar collapses to a top bar.
- Reduced-motion is respected globally (`src/index.css`).

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy behind whatever serves your API
Gateway, or as a separate static host pointed at it via `VITE_API_BASE_URL`.
