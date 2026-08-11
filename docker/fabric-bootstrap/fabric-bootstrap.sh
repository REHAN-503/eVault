#!/bin/bash
set -e

NETWORK_DIR="/eVault/fabric/test-network"

echo "=========================================="
echo " eVault Fabric Bootstrap"
echo "=========================================="

cd "$NETWORK_DIR"

echo "[1/3] Checking Docker access..."
docker info >/dev/null
echo "✓ Docker available"

echo
echo "[2/3] Checking Fabric containers..."

if docker ps --format '{{.Names}}' | grep -qx "peer0.org1.example.com" &&
   docker ps --format '{{.Names}}' | grep -qx "peer0.org2.example.com" &&
   docker ps --format '{{.Names}}' | grep -qx "orderer.example.com"; then

    echo "✓ Fabric network already running"

else

    echo "Fabric network is not running."
    echo "Starting existing Fabric test network..."

    ./network.sh up -ca

    echo "✓ Fabric network started"
fi

echo
echo "[3/3] Checking Fabric containers..."

for container in     peer0.org1.example.com     peer0.org2.example.com     orderer.example.com
do
    if docker ps --format '{{.Names}}' | grep -qx "$container"; then
        echo "✓ $container"
    else
        echo "ERROR: $container did not start."
        exit 1
    fi
done

echo
echo "=========================================="
echo " Fabric bootstrap complete"
echo "=========================================="
