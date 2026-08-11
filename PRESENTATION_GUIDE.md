# eVault Presentation Guide

## 2-Minute Pitch
"eVault is a blockchain-backed legal document management system. It solves the problem of evidence tampering and fragmented legal records by allowing Lawyers to securely upload encrypted documents, while Judges can cryptographically verify their integrity against a Hyperledger Fabric ledger. It features strict Role-Based Access Control and a clean, institutional design."

## 5-Minute Technical Explanation
1. **Architecture**: Point out the separation of concerns. The React frontend talks to an Express backend. Document metadata lives in Postgres, the actual files in an encrypted storage vault, and the SHA-256 hashes on Hyperledger Fabric.
2. **Blockchain Role**: Emphasize that we don't put files on the blockchain. We put the *trust* on the blockchain. When a document is verified, the backend compares the Postgres hash with the Fabric ledger hash.
3. **Security**: Show the strict RBAC matrix. A Lawyer cannot verify a document. A Client cannot upload a document. 

## The Golden Path Demonstration
1. **Log in as Lawyer**: Upload a document ("Supreme Court Digital Evidence Record"). Show the generated hash and storage reference.
2. **Log in as Judge**: Go to the verification queue. Click "Verify Ledger". Highlight that this performs a real cryptographic comparison, not a fake UI toggle.
3. **Log in as Lawyer**: Share the document with a Client.
4. **Log in as Client**: Show that the document appears in "Shared With Me".
5. **Log in as Lawyer/Judge**: Revoke the access.
6. **Log in as Client**: Show the document is gone, proving access control works.

## Anticipated Judge Questions
- *Q: Is the blockchain actually doing anything, or is this just a database?*
  - A: It is doing real cryptographic verification. We can trace the Gateway logs to see the actual Fabric transactions and chaincode invocations.
- *Q: Why not use public Ethereum?*
  - A: Hyperledger Fabric provides privacy and permissioned access, which is strictly required for sensitive court documents. 
