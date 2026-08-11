"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GATEWAY_CONFIG = void 0;
exports.getGateway = getGateway;
exports.getContract = getContract;
exports.closeConnection = closeConnection;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const crypto = __importStar(require("node:crypto"));
const grpc = __importStar(require("@grpc/grpc-js"));
const fabric_gateway_1 = require("@hyperledger/fabric-gateway");
/**
 * All paths/values below default to Org1's identity in the standard
 * fabric-samples/test-network layout, matching evaultchannel. Override via
 * env vars if evault-backend runs from a different location or against a
 * different org/network.
 */
const CONFIG = {
    MSP_ID: process.env.FABRIC_MSP_ID ?? 'Org1MSP',
    PEER_ENDPOINT: process.env.FABRIC_PEER_ENDPOINT ?? 'localhost:7051',
    PEER_HOST_ALIAS: process.env.FABRIC_PEER_HOST_ALIAS ?? 'peer0.org1.example.com',
    CHANNEL_NAME: process.env.FABRIC_CHANNEL_NAME ?? 'evaultchannel',
    CHAINCODE_NAME: process.env.FABRIC_CHAINCODE_NAME ?? 'evaultcc',
    CRYPTO_PATH: process.env.FABRIC_CRYPTO_PATH ??
        path.resolve(__dirname, '../../', 'fabric', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'),
};
exports.GATEWAY_CONFIG = CONFIG;
let cachedGateway;
let cachedGrpcClient;
async function newGrpcConnection() {
    const tlsRootCertPath = path.join(CONFIG.CRYPTO_PATH, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
    const tlsRootCert = await fs.readFile(tlsRootCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(CONFIG.PEER_ENDPOINT, tlsCredentials, {
        'grpc.ssl_target_name_override': CONFIG.PEER_HOST_ALIAS,
    });
}
async function newIdentity() {
    const certDir = path.join(CONFIG.CRYPTO_PATH, 'users', 'Admin@org1.example.com', 'msp', 'signcerts');
    const files = await fs.readdir(certDir);
    const certPath = path.join(certDir, files[0]);
    const credentials = await fs.readFile(certPath);
    return { mspId: CONFIG.MSP_ID, credentials };
}
async function newSigner() {
    const keyDir = path.join(CONFIG.CRYPTO_PATH, 'users', 'Admin@org1.example.com', 'msp', 'keystore');
    const files = await fs.readdir(keyDir);
    const keyPath = path.join(keyDir, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return fabric_gateway_1.signers.newPrivateKeySigner(privateKey);
}
/**
 * Returns a cached Gateway connection, establishing it on first use.
 * Kept as a singleton so evault-backend doesn't re-establish a gRPC
 * connection + TLS handshake on every single request.
 */
async function getGateway() {
    if (cachedGateway)
        return cachedGateway;
    cachedGrpcClient = await newGrpcConnection();
    cachedGateway = (0, fabric_gateway_1.connect)({
        client: cachedGrpcClient,
        identity: await newIdentity(),
        signer: await newSigner(),
    });
    return cachedGateway;
}
function getContract(contractName) {
    return getGateway().then((gateway) => {
        const network = gateway.getNetwork(CONFIG.CHANNEL_NAME);
        return network.getContract(CONFIG.CHAINCODE_NAME, contractName);
    });
}
function closeConnection() {
    cachedGateway?.close();
    cachedGrpcClient?.close();
    cachedGateway = undefined;
    cachedGrpcClient = undefined;
}
