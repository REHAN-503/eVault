/**
 * Shared error helper for chaincode contracts.
 *
 * Fabric chaincode transactions surface thrown Errors back to the calling
 * SDK/gateway as the transaction's error message. To let the Node.js gateway
 * wrapper (outside the network) reconstruct proper HTTP-style status codes
 * (400/404/409) without fragile string-matching, we encode the status code
 * directly into the error message using a small prefix convention:
 *
 *   "[404] Document not found: abc-123"
 *
 * The gateway wrapper parses this prefix back out. This keeps the chaincode
 * itself dependency-free (no custom error classes need to cross the
 * chaincode/gateway process boundary — only plain strings do, since that's
 * all a Fabric transaction error carries).
 */

export type StatusCode = 400 | 404 | 409;

export function statusError(status: StatusCode, message: string): Error {
  return new Error(`[${status}] ${message}`);
}

export function badRequest(message: string): Error {
  return statusError(400, message);
}

export function notFound(message: string): Error {
  return statusError(404, message);
}

export function conflict(message: string): Error {
  return statusError(409, message);
}
