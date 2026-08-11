#!/usr/bin/env sh
set -e

exec /tini -- ./node_modules/.bin/fabric-chaincode-node server \
  --chaincode-address="${CHAINCODE_SERVER_ADDRESS}" \
  --chaincode-id="${CHAINCODE_ID}"
