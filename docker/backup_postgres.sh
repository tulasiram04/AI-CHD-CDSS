#!/bin/bash
set -e

# Config parameters
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATABASE="${POSTGRES_DB:-chd_cdss}"
USER="${POSTGRES_USER:-postgres}"
HOST="${POSTGRES_HOST:-db}"
PORT="5432"

export PGPASSWORD="${POSTGRES_PASSWORD:-postgres_chd_secure_pwd}"

echo "[$TIMESTAMP] Launching Postgres daily backup task..."
mkdir -p "$BACKUP_DIR"

FILENAME="$BACKUP_DIR/backup_${DATABASE}_${TIMESTAMP}.sql.gz"

# Execute compressed postgres dump
pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" | gzip > "$FILENAME"

echo "[$TIMESTAMP] Backup written successfully to: $FILENAME"

# Retention Policy: Clean up backups older than 7 days
echo "[$TIMESTAMP] Applying backup retention policy..."
find "$BACKUP_DIR" -type f -name "backup_${DATABASE}_*.sql.gz" -mtime +7 -exec rm {} \;

echo "[$TIMESTAMP] Clean up completed."
