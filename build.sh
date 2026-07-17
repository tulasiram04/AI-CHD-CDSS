#!/usr/bin/env bash
##############################################################################
# build.sh — Render pre-deploy build script for AI-CHD-CDSS backend
# Runs Alembic DB migrations before the server starts.
##############################################################################

set -e  # Exit immediately on any error

echo "=============================================="
echo " AI-CHD-CDSS — Render Deploy Script"
echo "=============================================="

echo "[1/3] Checking environment..."
echo "  ENV         = ${ENV:-not set}"
echo "  DATABASE_URL = ${DATABASE_URL:+set (hidden)}"

echo "[2/3] Running Alembic database migrations..."
alembic upgrade head
echo "  ✓ Migrations applied successfully."

echo "[3/3] Starting Uvicorn server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1
