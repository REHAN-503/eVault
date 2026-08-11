#!/usr/bin/env bash

EVAULT_ROOT="$HOME/eVault"

echo "=========================================="
echo "             eVault STATUS"
echo "=========================================="

echo
echo "---------- PostgreSQL ----------"

if docker ps --format '{{.Names}}' | grep -qx "evault-postgres"; then
    echo "✓ PostgreSQL: RUNNING"
else
    echo "✗ PostgreSQL: STOPPED"
fi

echo
echo "---------- Fabric ----------"

if docker ps --format '{{.Names}}' | grep -qx "orderer.example.com"; then
    echo "✓ Orderer: RUNNING"
else
    echo "✗ Orderer: STOPPED"
fi

if docker ps --format '{{.Names}}' | grep -qx "peer0.org1.example.com"; then
    echo "✓ Org1 Peer: RUNNING"
else
    echo "✗ Org1 Peer: STOPPED"
fi

if docker ps --format '{{.Names}}' | grep -qx "peer0.org2.example.com"; then
    echo "✓ Org2 Peer: RUNNING"
else
    echo "✗ Org2 Peer: STOPPED"
fi

echo
echo "---------- Chaincode ----------"

if docker ps --format '{{.Names}}' | grep -q "peer0org1_evaultcc_ccaas"; then
    echo "✓ evaultcc Org1: RUNNING"
else
    echo "✗ evaultcc Org1: STOPPED"
fi

if docker ps --format '{{.Names}}' | grep -q "peer0org2_evaultcc_ccaas"; then
    echo "✓ evaultcc Org2: RUNNING"
else
    echo "✗ evaultcc Org2: STOPPED"
fi

echo
echo "---------- Backend ----------"

if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    echo "✓ Backend API: RUNNING"
    echo "  http://localhost:3000"
else
    echo "✗ Backend API: STOPPED"
fi

echo
echo "=========================================="
