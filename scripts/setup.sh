#!/usr/bin/env bash
# PingX — one-command local setup
# Usage: bash scripts/setup.sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== PingX Setup ==="

# 1. Install deps
echo "[1/4] Installing dependencies..."
pnpm install

# 2. Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  # Try .env file
  if [ -f "artifacts/api-server/.env" ]; then
    source "artifacts/api-server/.env" 2>/dev/null || true
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo ""
  echo "⚠️  DATABASE_URL is not set."
  echo "   1. Create a free PostgreSQL database at https://neon.tech"
  echo "   2. Copy the connection string into artifacts/api-server/.env"
  echo "   3. Re-run this script"
  echo ""
  exit 1
fi

# 3. Push DB schema
echo "[2/4] Pushing database schema..."
DATABASE_URL="$DATABASE_URL" pnpm --filter @workspace/db run push-force

# 4. Build backend
echo "[3/4] Building API server..."
pnpm --filter @workspace/api-server run build

echo "[4/4] Done!"
echo ""
echo "Start the backend:  pnpm --filter @workspace/api-server run start"
echo "Start the frontend: pnpm --filter @workspace/pingx run dev"
