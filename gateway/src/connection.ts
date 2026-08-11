import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as grpc from '@grpc/grpc-js';
import {
  connect,
  Gateway,
  Identity,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';

/**
 * All paths/values below default to Org1's identity in the standard
 * fabric-samples/test-network layout, matching evaultchannel. Override via
 * env vars if evault-backend runs from a different location or against a
 * different org/network.
 */
const CONFIG = {
  MSP_ID: process.env.FABRIC_MSP_ID ?? 'Org1MSP',
  PEER_ENDPOINT: process.env.FABRIC_PEER_ENDPOINT ?? 'localhost:7051',
  PEER_HOST_ALIAS:
    process.env.FABRIC_PEER_HOST_ALIAS ?? 'peer0.org1.example.com',
  CHANNEL_NAME: process.env.FABRIC_CHANNEL_NAME ?? 'evaultchannel',
  CHAINCODE_NAME: process.env.FABRIC_CHAINCODE_NAME ?? 'evaultcc',
  CRYPTO_PATH:
    process.env.FABRIC_CRYPTO_PATH ??
    path.resolve(
      __dirname,
      '../../',
      'fabric',
      'test-network',
      'organizations',
      'peerOrganizations',
      'org1.example.com'
    ),
};

let cachedGateway: Gateway | undefined;
let cachedGrpcClient: grpc.Client | undefined;

async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsRootCertPath = path.join(
    CONFIG.CRYPTO_PATH,
    'peers',
    'peer0.org1.example.com',
    'tls',
    'ca.crt'
  );
  const tlsRootCert = await fs.readFile(tlsRootCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(CONFIG.PEER_ENDPOINT, tlsCredentials, {
    'grpc.ssl_target_name_override': CONFIG.PEER_HOST_ALIAS,
  });
}

async function newIdentity(): Promise<Identity> {
  const certDir = path.join(
    CONFIG.CRYPTO_PATH,
    'users',
    'Admin@org1.example.com',
    'msp',
    'signcerts'
  );
  const files = await fs.readdir(certDir);
  const certPath = path.join(certDir, files[0]);
  const credentials = await fs.readFile(certPath);
  return { mspId: CONFIG.MSP_ID, credentials };
}

async function newSigner(): Promise<Signer> {
  const keyDir = path.join(
    CONFIG.CRYPTO_PATH,
    'users',
    'Admin@org1.example.com',
    'msp',
    'keystore'
  );
  const files = await fs.readdir(keyDir);
  const keyPath = path.join(keyDir, files[0]);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

/**
 * Returns a cached Gateway connection, establishing it on first use.
 * Kept as a singleton so evault-backend doesn't re-establish a gRPC
 * connection + TLS handshake on every single request.
 */
export async function getGateway(): Promise<Gateway> {
  if (cachedGateway) return cachedGateway;

  cachedGrpcClient = await newGrpcConnection();
  cachedGateway = connect({
    client: cachedGrpcClient,
    identity: await newIdentity(),
    signer: await newSigner(),
  });
  return cachedGateway;
}

export function getContract(contractName: string) {
  return getGateway().then((gateway) => {
    const network = gateway.getNetwork(CONFIG.CHANNEL_NAME);
    return network.getContract(CONFIG.CHAINCODE_NAME, contractName);
  });
}

export function closeConnection(): void {
  cachedGateway?.close();
  cachedGrpcClient?.close();
  cachedGateway = undefined;
  cachedGrpcClient = undefined;
}

export { CONFIG as GATEWAY_CONFIG };
