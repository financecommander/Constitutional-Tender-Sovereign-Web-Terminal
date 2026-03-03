#!/bin/bash
# Constitutional Tender - PostgreSQL Database Backup Script
# Run via cron: 0 2 * * * /opt/ct-app/deploy/backup-db.sh
#
# Setup:
#   mkdir -p /opt/ct-backups
#   chmod +x /opt/ct-app/deploy/backup-db.sh
#   crontab -e  →  0 2 * * * /opt/ct-app/deploy/backup-db.sh >> /var/log/ct-backup.log 2>&1

set -euo pipefail

# Configuration
DB_NAME="${DB_NAME:-constitutional_tender}"
DB_USER="${DB_USER:-ctuser}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/opt/ct-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of ${DB_NAME}..."

# Perform the backup with compression
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="${BACKUP_FILE%.gz}" \
  2>&1

# Verify the backup file exists and is non-empty
if [ -s "${BACKUP_FILE%.gz}" ]; then
  FILESIZE=$(stat -f%z "${BACKUP_FILE%.gz}" 2>/dev/null || stat --printf="%s" "${BACKUP_FILE%.gz}" 2>/dev/null || echo "unknown")
  echo "[$(date)] Backup successful: ${BACKUP_FILE%.gz} (${FILESIZE} bytes)"
else
  echo "[$(date)] ERROR: Backup file is empty or missing!"
  exit 1
fi

# Cleanup old backups
echo "[$(date)] Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql*" -type f -mtime +${RETENTION_DAYS} -delete
REMAINING=$(find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql*" -type f | wc -l)
echo "[$(date)] ${REMAINING} backup(s) remaining after cleanup."

# Optional: Upload to Google Cloud Storage
if command -v gsutil &> /dev/null && [ -n "${GCS_BACKUP_BUCKET:-}" ]; then
  echo "[$(date)] Uploading to gs://${GCS_BACKUP_BUCKET}..."
  gsutil cp "${BACKUP_FILE%.gz}" "gs://${GCS_BACKUP_BUCKET}/db-backups/${DB_NAME}_${TIMESTAMP}.sql"
  echo "[$(date)] GCS upload complete."
fi

echo "[$(date)] Backup process finished."
