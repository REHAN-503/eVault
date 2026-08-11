#!/bin/sh

set -eu

echo "=========================================="
echo " eVault Fabric Bootstrap"
echo "=========================================="

PACKAGE_ID="evaultcc_1.0:a70a80e54772578c88157fef7a272cb8d044ebbdd6afe59631319d362e21114c"
CHAINCODE_IMAGE="evaultcc_ccaas_image:latest"
FABRIC_NETWORK="fabric_test"

FABRIC_CONTAINERS="
ca_org1
ca_orderer
ca_org2
orderer.example.com
peer0.org1.example.com
peer0.org2.example.com
"

CCAAS_CONTAINERS="
peer0org1_evaultcc_ccaas
peer0org2_evaultcc_ccaas
"

echo "[1/3] Checking Docker access..."

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not available."
    exit 1
fi

echo "✓ Docker available"
echo

echo "[2/3] Starting Fabric network..."

for container in $FABRIC_CONTAINERS; do
    if docker inspect "$container" >/dev/null 2>&1; then
        STATUS="$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)"

        if [ "$STATUS" = "running" ]; then
            echo "  ✓ $container already running"
        else
            docker start "$container" >/dev/null
            echo "  ✓ $container started"
        fi
    else
        echo "  ERROR: Required Fabric container '$container' does not exist."
        exit 1
    fi
done

echo
echo "[3/3] Ensuring eVault chaincode containers exist..."

for container in $CCAAS_CONTAINERS; do

    if docker inspect "$container" >/dev/null 2>&1; then

        STATUS="$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || true)"

        if [ "$STATUS" = "running" ]; then
            echo "  ✓ $container already running"
        else
            docker start "$container" >/dev/null
            echo "  ✓ $container started"
        fi

    else

        echo "  → Creating $container"

        docker run -d \
            --name "$container" \
            --network "$FABRIC_NETWORK" \
            -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
            -e CHAINCODE_ID="$PACKAGE_ID" \
            -e CORE_CHAINCODE_ID_NAME="$PACKAGE_ID" \
            "$CHAINCODE_IMAGE" >/dev/null

        echo "  ✓ $container created"

    fi

done

echo
echo "Waiting for Fabric..."

REQUIRED_CONTAINERS="
orderer.example.com
peer0.org1.example.com
peer0.org2.example.com
peer0org1_evaultcc_ccaas
peer0org2_evaultcc_ccaas
"

ATTEMPTS=0
MAX_ATTEMPTS=30

while [ "$ATTEMPTS" -lt "$MAX_ATTEMPTS" ]; do

    ALL_RUNNING=true

    for container in $REQUIRED_CONTAINERS; do

        STATUS="$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo missing)"

        if [ "$STATUS" != "running" ]; then
            ALL_RUNNING=false
            break
        fi

    done

    if [ "$ALL_RUNNING" = true ]; then
        break
    fi

    ATTEMPTS=$((ATTEMPTS + 1))
    echo "Waiting for Fabric... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 2

done

if [ "$ALL_RUNNING" != true ]; then

    echo
    echo "ERROR: Fabric did not become ready."

    docker ps -a \
        --format 'table {{.Names}}\t{{.Status}}'

    exit 1

fi

echo
echo "=========================================="
echo " Fabric is READY"
echo "=========================================="

docker ps \
    --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' |
grep -E \
'ca_org1|ca_orderer|ca_org2|orderer.example.com|peer0.org1.example.com|peer0.org2.example.com|peer0org1_evaultcc_ccaas|peer0org2_evaultcc_ccaas' \
|| true

echo
echo "eVault Fabric bootstrap is running."
echo "Keeping this container alive for Docker Desktop."

exec tail -f /dev/null
