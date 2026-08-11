# eVault Interoperability Architecture

## Integration Vision
The hackathon problem statement requires potential interoperability with existing legal databases and case-management systems (CIS). eVault is designed with a clean abstraction layer to facilitate this.

## Integration Adapters Layer
The `backend/src/integrations/` directory holds modular adapters that bridge eVault with external systems.

### 1. CaseManagementAdapter (Mock)
- **Purpose**: Synchronizes document references with an external Court Case-Management System.
- **Workflow**: When an eVault document is uploaded with a `caseNo` and `courtCode`, this adapter can push the generated `documentId` to the external CIS, returning a canonical `caseId`.
- **Status**: Currently implemented as a functional mock for the hackathon prototype.

### 2. LegalDatabaseAdapter (Mock)
- **Purpose**: Queries national legal databases for historical precedence or metadata related to a given case number.
- **Status**: Mock implementation provided to demonstrate REST integration patterns without exposing live endpoints.

## Future Production Integration
In a production deployment, these adapters would be swapped with real HTTP/SOAP clients using mutual TLS (mTLS) to securely communicate with government APIs. The eVault core architecture remains isolated from external API changes through these adapter interfaces.
