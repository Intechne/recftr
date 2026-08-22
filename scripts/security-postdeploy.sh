#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://www.recfturkiye.com}"
echo "[1/2] Application security smoke"
node scripts/security-smoke.mjs "$BASE"
echo
echo "[2/2] Edge/TLS/header smoke"
bash scripts/security-edge.sh "$BASE"
echo
echo "Post-deploy security smoke PASS."
