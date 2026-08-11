# evault-gateway

Node.js client that connects evault-backend to the real Hyperledger Fabric
network via `@hyperledger/fabric-gateway`. This is the **real** replacement
for evault-backend's mock `src/services/blockchain/blockchain.service.js`
— same 8 function names/signatures as documented in evault-backend's
`docs/CONTRACTS.md` and `docs/TEAM_API_CONTRACT.md`, so no controller or
service-layer changes are needed on the backend side (same pattern used
for the Member 4 storage-module integration).

Unit-tested: 6/6 tests passing for the error-translation logic
(`src/errors.test.ts`) — the piece most likely to have subtle bugs, since
it has to reliably pull chaincode error status codes back out of Fabric
Gateway's wrapped gRPC errors.

**Not yet integration-tested against a live network** — that requires
running from inside WSL2 with the real network up and real crypto material
present (can't be done in this sandbox, no Docker/Fabric here).

## Setup

```bash
npm install
npm run build
npm run test:src   # runs the 6 error-translation tests
```

## Before using against the real network

1. Deploy `evault-chaincode` first (see its README).
2. Set `FABRIC_CRYPTO_PATH` to point at
   `<path-to>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com`
   (defaults to `./crypto/org1.example.com` — override via env var or copy
   the folder there).
3. Confirm `FABRIC_CHANNEL_NAME` (`evaultchannel`) and
   `FABRIC_CHAINCODE_NAME` (`evaultcc`) match what you actually deployed.

## Wiring into evault-backend

Same `file:` dependency pattern as the storage module:

```json
"dependencies": {
  "evault-gateway": "file:../evault-gateway"
}
```

Then replace `evault-backend/src/services/blockchain/blockchain.service.js`:

```js
'use strict';
const gateway = require('evault-gateway/dist/index.js');

module.exports = {
  registerUser: gateway.registerUser,
  recordDocument: gateway.recordDocument,
  updateDocument: gateway.updateDocument,
  getDocument: gateway.getDocument,
  getVersionHistory: gateway.getVersionHistory,
  grantAccess: gateway.grantAccess,
  revokeAccess: gateway.revokeAccess,
  checkAccess: gateway.checkAccess,
};
```

## Known open item (same as flagged for evault-chaincode)

`recordDocument` here takes `(docId, hash, metadata, ownerId, ownerRole)`
— one extra parameter (`ownerRole`) versus the original 4-parameter mock
signature. `document.service.js`'s call site will need to pass the
authenticated user's role through (already available on `req.user.role`
per evault-backend's JWT payload) for this to work end-to-end.
