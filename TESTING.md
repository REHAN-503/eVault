# eVault Testing Strategy

## 1. Automated Testing Suite
eVault relies on Jest and Supertest for automated validation of backend services. The test suite is invoked via `npm test`.

### Unit Tests
- `blockchain.test.js`: Validates the mocked responses of the Hyperledger Fabric Gateway integration layer. Ensures that the internal interface matches the expected Chaincode contract.

### E2E / Integration Tests
- `auth.test.js`: Covers JWT generation, registration, login, token refresh, and logout functionality. Ensures passwords are appropriately hashed.
- `document.test.js`: The most critical suite. Validates the complete lifecycle: Upload -> Retrieve -> Update -> Share -> Revoke -> Verify -> Delete. Also checks access control blockages (e.g. 401s and 403s on unauthorized access).
- `system.test.js`: Checks infrastructure health endpoints.

## 2. Manual Testing (Golden Path)
For hackathon presentations, we manually validate the "Golden Path":
1. Lawyer uploads a document.
2. Judge accesses the verification queue and performs real ledger verification.
3. Lawyer shares document with a Client.
4. Client accesses document.
5. Judge/Lawyer revokes access, and Client loses visibility.

## 3. Security Regression Testing
- Verify that attempting to fetch a `documentId` owned by another user yields `403 Forbidden` unless explicitly shared.
- Verify that bypassing the Gateway to forge `verified: true` is impossible because real hashing is performed by checking the PostgreSQL Hash vs the Fabric Ledger Hash.
