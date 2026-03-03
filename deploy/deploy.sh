#!/bin/bash
# Constitutional Tender — Deploy Script
# Run on the VM to pull latest code and redeploy
# Usage: bash deploy.sh

set -euo pipefail

APP_DIR="/opt/ct"
cd "$APP_DIR"

echo "=== Deploying Constitutional Tender ==="

# Pull latest code
echo "[1/5] Pulling latest code..."
git pull origin main

# Install dependencies
echo "[2/5] Installing dependencies..."
npm ci

# Generate Prisma client
echo "[3/5] Generating Prisma client..."
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd "$APP_DIR"

# Build
echo "[4/5] Building applications..."
npx turbo run build

# Restart processes
echo "[5/5] Restarting PM2 processes..."
pm2 restart all
pm2 save

echo ""
echo "=== Deploy Complete ==="
pm2 status
