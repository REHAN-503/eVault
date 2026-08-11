# eVault API Documentation

## Auth Routes (`/api/v1/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and receive JWTs.
- `GET /me`: Retrieve current user profile.
- `POST /refresh`: Refresh access token.
- `POST /logout`: Invalidate session.

## Document Routes (`/api/v1/documents`)
- `POST /upload`: Upload a new encrypted document (Lawyer, Admin).
- `GET /`: List paginated documents based on RBAC visibility.
- `GET /:id`: Retrieve document metadata.
- `GET /:id/download`: Download and decrypt document binary.
- `PUT /:id`: Update document (new version).
- `DELETE /:id`: Soft delete document.
- `POST /:id/share`: Grant access to a user (Lawyer owner, Judge, Admin).
- `POST /:id/revoke`: Revoke access from a user (Lawyer owner, Judge, Admin).
- `GET /:id/verify`: Query Fabric ledger and verify integrity (Judge, Admin).
- `GET /:id/audit`: Retrieve blockchain audit history.

## Integration Routes (`/api/v1/integration`)
- `POST /cis/sync`: Trigger sync with external Case Information System.

## System Routes
- `GET /health`: Basic health check.
