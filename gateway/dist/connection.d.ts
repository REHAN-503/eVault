import { Gateway } from '@hyperledger/fabric-gateway';
/**
 * All paths/values below default to Org1's identity in the standard
 * fabric-samples/test-network layout, matching evaultchannel. Override via
 * env vars if evault-backend runs from a different location or against a
 * different org/network.
 */
declare const CONFIG: {
    MSP_ID: string;
    PEER_ENDPOINT: string;
    PEER_HOST_ALIAS: string;
    CHANNEL_NAME: string;
    CHAINCODE_NAME: string;
    CRYPTO_PATH: string;
};
/**
 * Returns a cached Gateway connection, establishing it on first use.
 * Kept as a singleton so evault-backend doesn't re-establish a gRPC
 * connection + TLS handshake on every single request.
 */
export declare function getGateway(): Promise<Gateway>;
export declare function getContract(contractName: string): Promise<import("@hyperledger/fabric-gateway").Contract>;
export declare function closeConnection(): void;
export { CONFIG as GATEWAY_CONFIG };
