#!/usr/bin/env bash

echo "=========================================="
echo "        eVault BACKEND STOP"
echo "=========================================="

pkill -f "node src/server.js" 2>/dev/null || true

echo "Backend stopped."
echo
echo "Fabric and PostgreSQL were NOT stopped."
echo "Your ledger/database remain intact."
