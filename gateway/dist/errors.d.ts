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
export declare function translateChaincodeError(err: unknown): StatusError;
