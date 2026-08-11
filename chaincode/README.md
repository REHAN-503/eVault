# evault-chaincode

SIH1284 blockchain layer: three Hyperledger Fabric contracts —
`AccessControlContract`, `DocumentRegistryContract`, `AuditLogContract` —
deployed as Chaincode-as-a-Service (CCaaS) against the fabric-samples
test-network on channel `evaultchannel`.

Built and unit-tested outside the network (18/18 tests passing, see
`src/*.test.ts`) using an in-memory mock of the Fabric stub
(`src/testHelpers/mockContext.ts`). This validates the contract logic
itself; it does not replace testing against the real network.

## Why CCaaS, not the standard deploy path

The standard `peer lifecycle chaincode install` triggers the peer to build
a Docker image internally (Docker-in-Docker via a mounted socket), which
was unreliable in this environment (Docker Desktop + WSL2 — repeated
`broken pipe` errors). CCaaS builds the image via a normal host-side
`docker compose build` instead, which is proven stable here.

## Setup (run inside WSL2, from ~/fabric/evault-chaincode)

```bash
npm install
npm run build      # compiles src/ -> dist/
npm run test:src   # runs all unit tests (should show 18 passing)
```

## Deploy to the network

Make sure the test-network is up and you're on channel `evaultchannel`
(see test-network's own README/your prior session for bringing the
network up). Then, from `fabric-samples/test-network`:

```bash
./network.sh deployCCAAS -ccn evaultcc -ccp /home/<you>/fabric/evault-chaincode -ccl typescript -c evaultchannel
```

Adjust `-ccp` to wherever you actually placed this folder. `-ccn evaultcc`
is the chaincode name the gateway wrapper (`evault-gateway`) expects by
default (`FABRIC_CHAINCODE_NAME` env var) — keep them in sync if you rename it.

## Verifying after deploy

```bash
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Register a user (must be a real UUID)
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls \
  --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C evaultchannel -n evaultcc \
  --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"AccessControlContract:registerUser","Args":["11111111-1111-4111-8111-111111111111","LAWYER"]}'
```

Note the `ContractName:functionName` syntax (`AccessControlContract:registerUser`)
— required because this chaincode has multiple named contracts.

## Files

- `src/accessControl.contract.ts` — registerUser, grantAccess, revokeAccess, checkAccess
- `src/documentRegistry.contract.ts` — recordDocument, updateDocument, getDocument, getVersionHistory (real ledger history via `getHistoryForKey`, not a manual array)
- `src/auditLog.contract.ts` — logAction, getAuditTrail, emits DocumentAdded/AccessGranted/AccessRevoked events
- `src/ledgerHelpers.ts` — shared world-state composite-key helpers used by all three contracts
- `src/validation.ts` — UUID/role/permission validation shared across contracts
- `src/errors.ts` — encodes status codes into thrown error messages as `[404] message`, so the gateway wrapper can reconstruct HTTP-style errors

## Known open item

`recordDocument` requires the caller to pass `ownerRole` explicitly (5
params, not 4) — chaincode can't reach evault-backend's Postgres to look up
a role itself. This was flagged as a known constraint in an earlier
conversation; confirm with Member 2 whether their `document.service.js`
needs a one-line update to pass the caller's role through.
