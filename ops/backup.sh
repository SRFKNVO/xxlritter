#!/bin/sh
# Tägliches Backup für den isolierten Ritter-XXL-Supabase-Stack.
# pg_dump (custom format, komprimiert) + Storage-Volume (hochgeladene
# Zimmer-/Aktionsbilder) -> lokal behalten (14 Tage) -> Upload zu Cloudflare
# R2 via rclone (Remote "ritter-xxl-r2", Rotation dort 30 Tage). Ohne
# konfiguriertes Remote läuft das Backup trotzdem durch, nur der Upload
# wird übersprungen.

set -eu

PROJECT_DIR="/root/ritter-xxl-supabase"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$BACKUP_DIR/backup.log"
CONTAINER="ritter-xxl-db"
RCLONE_REMOTE="ritter-xxl-r2"
RCLONE_BUCKET="ritter-xxl-backups"
KEEP_DAYS=14
R2_KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

ts=$(date +%Y%m%d-%H%M%S)
dump_file="$BACKUP_DIR/ritter-xxl-db-$ts.dump"
storage_file="$BACKUP_DIR/ritter-xxl-storage-$ts.tar.gz"

log() {
    printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

log "Backup gestartet: $dump_file"

if ! docker exec "$CONTAINER" pg_dump -U postgres -d postgres -Fc > "$dump_file"; then
    log "FEHLER: pg_dump fehlgeschlagen"
    rm -f "$dump_file"
    exit 1
fi
log "pg_dump ok ($(du -h "$dump_file" | cut -f1))"

if [ -d "$PROJECT_DIR/volumes/storage" ]; then
    tar -czf "$storage_file" -C "$PROJECT_DIR/volumes" storage
    log "Storage-Volume gesichert ($(du -h "$storage_file" | cut -f1))"
else
    storage_file=""
fi

if rclone listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE}:"; then
    if rclone copy "$dump_file" "${RCLONE_REMOTE}:${RCLONE_BUCKET}/" 2>>"$LOG_FILE"; then
        log "Upload DB nach ${RCLONE_REMOTE}:${RCLONE_BUCKET} ok"
    else
        log "WARNUNG: Upload DB nach ${RCLONE_REMOTE}:${RCLONE_BUCKET} fehlgeschlagen, Backup bleibt nur lokal liegen"
    fi
    if [ -n "$storage_file" ]; then
        if rclone copy "$storage_file" "${RCLONE_REMOTE}:${RCLONE_BUCKET}/" 2>>"$LOG_FILE"; then
            log "Upload Storage nach ${RCLONE_REMOTE}:${RCLONE_BUCKET} ok"
        else
            log "WARNUNG: Upload Storage nach ${RCLONE_REMOTE}:${RCLONE_BUCKET} fehlgeschlagen"
        fi
    fi
    if rclone delete "${RCLONE_REMOTE}:${RCLONE_BUCKET}" --min-age "${R2_KEEP_DAYS}d" 2>>"$LOG_FILE"; then
        log "R2: alte Backups (>${R2_KEEP_DAYS} Tage) im Bucket aufgeräumt"
    else
        log "WARNUNG: Aufräumen alter R2-Backups fehlgeschlagen"
    fi
else
    log "WARNUNG: rclone-Remote '${RCLONE_REMOTE}' noch nicht konfiguriert (rclone config) — Backup bleibt nur lokal liegen"
fi

find "$BACKUP_DIR" -name "ritter-xxl-db-*.dump" -mtime "+$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name "ritter-xxl-storage-*.tar.gz" -mtime "+$KEEP_DAYS" -delete
log "Alte lokale Backups (>${KEEP_DAYS} Tage) aufgeräumt"
