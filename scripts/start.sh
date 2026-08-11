#!/usr/bin/env bash

set -e

EVAULT_ROOT="$HOME/eVault"
BACKEND="$EVAULT_ROOT/backend"
GATEWAY="$EVAULT_ROOT/gateway"
FABRIC="$EVAULT_ROOT/fabric"
TEST_NETWORK="$FABRIC/test-network"

echo "=========================================="
echo "        eVault FULL STACK START"
echo "=========================================="

echo
echo "[1/5] Checking Docker..."

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not running."
    exit 1
fi

echo "✓ Docker"

echo
echo "[2/5] Checking PostgreSQL..."

if ! docker ps --format '{{.Names}}' | grep -qx "evault-postgres"; then
    echo "ERROR: evault-postgres is not running."
    exit 1
fi

echo "✓ PostgreSQL"

echo
echo "[3/5] Checking Fabric..."

for container in \
    orderer.example.com \
    peer0.org1.example.com \
    peer0.org2.example.com
do
    if ! docker ps --format '{{.Names}}' | grep -qx "$container"; then
        echo "ERROR: Fabric container $container is not running."
        exit 1
    fi
done

echo "✓ Fabric network"

echo
echo "[4/5] Configuring Fabric Gateway..."

export EVAULT_ROOT="$EVAULT_ROOT"

export FABRIC_CRYPTO_PATH="$TEST_NETWORK/organizations/peerOrganizations/org1.example.com"

export FABRIC_PEER_ENDPOINT="localhost:7051"
export FABRIC_PEER_HOST_ALIAS="peer0.org1.example.com"
export FABRIC_CHANNEL_NAME="evaultchannel"
export FABRIC_CHAINCODE_NAME="evaultcc"
export FABRIC_MSP_ID="Org1MSP"

export PATH="$FABRIC/bin:$PATH"
export FABRIC_CFG_PATH="$FABRIC/config"

echo "✓ Fabric environment configured"

echo
echo "[5/5] Starting eVault backend..."

cd "$BACKEND"

export NODE_ENV=development

echo
echo "=========================================="
echo " Backend: http://localhost:3000"
echo " Swagger: http://localhost:3000/api-docs"
echo " Health:  http://localhost:3000/health"
echo "=========================================="
echo

exec npm run dev
