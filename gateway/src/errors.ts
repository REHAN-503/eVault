/**
 * Translates errors coming back from a Fabric Gateway submit/evaluate call
 * into a plain JS Error carrying .statusCode/.errorCode, matching what
 * evault-backend's mock blockchain.service.js already throws — so this
 * wrapper is a true drop-in replacement with no controller/service changes
 * needed on the backend side.
 *
 * The chaincode encodes its status code as a "[404] message" prefix (see
 * evault-chaincode/src/errors.ts). Fabric Gateway wraps the original
 * chaincode error message inside a GatewayError, generally reachable via
 * err.message and/or err.details[].message depending on where in the
 * endorse/submit/commit pipeline the failure occurred. We scan every place
 * that text could show up rather than assuming one specific shape.
 */

export interface StatusError extends Error {
  statusCode: number;
  errorCode: string;
}

const STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

const PREFIX_RE = /\[(\d{3})\]\s*(.+)/;

function extractCandidateMessages(err: any): string[] {
  const messages: string[] = [];
  if (!err) return messages;
  if (typeof err.message === 'string') messages.push(err.message);
  if (Array.isArray(err.details)) {
    for (const d of err.details) {
      if (typeof d?.message === 'string') messages.push(d.message);
    }
  }
  if (Array.isArray(err.cause)) {
    for (const c of err.cause) {
      messages.push(...extractCandidateMessages(c));
    }
  }
  return messages;
}

export function translateChaincodeError(err: unknown): StatusError {
  const candidates = extractCandidateMessages(err);

  for (const msg of candidates) {
    const match = msg.match(PREFIX_RE);
    if (match) {
      const status = Number(match[1]);
      const cleanMessage = match[2].trim();
      const wrapped = new Error(cleanMessage) as StatusError;
      wrapped.statusCode = status;
      wrapped.errorCode = STATUS_TO_ERROR_CODE[status] ?? 'CHAINCODE_ERROR';
      return wrapped;
    }
  }

  // No recognizable status prefix found — surface as a generic 500-style
  // error rather than silently swallowing it.
  const fallbackMessage =
    candidates[0] ?? (err instanceof Error ? err.message : String(err));
  const wrapped = new Error(fallbackMessage) as StatusError;
  wrapped.statusCode = 500;
  wrapped.errorCode = 'CHAINCODE_ERROR';
  return wrapped;
}
