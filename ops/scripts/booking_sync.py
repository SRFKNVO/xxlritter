#!/usr/bin/env python3
"""
Booking.com-iCal-Sync für die Ritter-XXL-Reservierungszentrale.

Läuft per Cron alle 5 Minuten auf der VPS (nicht in einem Container — greift
über den loopback-only Gateway-Port 18000 auf die REST-API zu). Synchronisiert
ein Zimmer nur, wenn seit dem letzten erfolgreichen Sync > 55 Minuten vergangen
sind ODER ein manueller Sync über das Dashboard angefordert wurde
(channel_settings.sync_requested_at neuer als last_synced_at) — dadurch reicht
eine stündliche Aktualisierung, aber der "Jetzt synchronisieren"-Button im
Dashboard wirkt trotzdem innerhalb weniger Minuten.

Nutzt den service_role-Key (umgeht RLS bewusst — dies ist ein vertrauens-
würdiges Server-Skript, kein Browser-Client) über die interne, nur auf
127.0.0.1 gebundene Gateway-Adresse, nie über die öffentliche Domain.
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

import requests

API_BASE = "http://127.0.0.1:18000"
ENV_FILE = "/root/ritter-xxl-supabase/.env"
LOG_FILE = "/root/ritter-xxl-supabase/scripts/booking_sync.log"
RESYNC_AFTER_MINUTES = 55


def log(msg: str) -> None:
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def read_env_var(name: str) -> str:
    with open(ENV_FILE) as f:
        for line in f:
            if line.startswith(f"{name}="):
                return line.strip().split("=", 1)[1]
    raise RuntimeError(f"{name} nicht in {ENV_FILE} gefunden")


def rest_headers(service_role_key: str) -> dict:
    return {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }


def unfold_ics(text: str) -> list:
    """RFC5545: Zeilen, die mit Leerzeichen/Tab beginnen, sind Fortsetzungen der vorigen Zeile."""
    raw_lines = text.replace("\r\n", "\n").split("\n")
    lines = []
    for line in raw_lines:
        if line.startswith(" ") or line.startswith("\t"):
            if lines:
                lines[-1] += line[1:]
        else:
            lines.append(line)
    return lines


def parse_date(value: str) -> str:
    """DTSTART/DTEND-Werte (DATE oder DATE-TIME) auf YYYY-MM-DD reduzieren."""
    date_part = value.split("T")[0]
    return f"{date_part[0:4]}-{date_part[4:6]}-{date_part[6:8]}"


def parse_ics_events(text: str) -> list:
    events = []
    current = None
    for raw_line in unfold_ics(text):
        line = raw_line.strip()
        if line == "BEGIN:VEVENT":
            current = {}
        elif line == "END:VEVENT":
            if current and current.get("uid") and current.get("dtstart") and current.get("dtend"):
                events.append(current)
            current = None
        elif current is not None:
            if line.startswith("UID"):
                current["uid"] = line.split(":", 1)[1].strip()
            elif line.startswith("DTSTART"):
                current["dtstart"] = parse_date(line.split(":", 1)[1].strip())
            elif line.startswith("DTEND"):
                current["dtend"] = parse_date(line.split(":", 1)[1].strip())
    return events


def should_sync(settings: dict) -> bool:
    last_synced = settings.get("last_synced_at")
    requested = settings.get("sync_requested_at")
    if not last_synced:
        return True
    last_synced_dt = datetime.fromisoformat(last_synced.replace("Z", "+00:00"))
    if datetime.now(timezone.utc) - last_synced_dt > timedelta(minutes=RESYNC_AFTER_MINUTES):
        return True
    if requested:
        requested_dt = datetime.fromisoformat(requested.replace("Z", "+00:00"))
        if requested_dt > last_synced_dt:
            return True
    return False


def sync_room(room_id: str, ical_url: str, headers: dict) -> None:
    try:
        resp = requests.get(ical_url, timeout=20)
        resp.raise_for_status()
        events = parse_ics_events(resp.text)

        existing_resp = requests.get(
            f"{API_BASE}/rest/v1/room_bookings",
            headers=headers,
            params={
                "room_id": f"eq.{room_id}",
                "source": "eq.booking_com",
                "select": "id,external_uid",
            },
            timeout=20,
        )
        existing_resp.raise_for_status()
        existing = {row["external_uid"]: row["id"] for row in existing_resp.json()}

        fresh_uids = {e["uid"] for e in events}
        new_events = [e for e in events if e["uid"] not in existing]
        removed_uids = [uid for uid in existing if uid not in fresh_uids]

        for event in new_events:
            insert_resp = requests.post(
                f"{API_BASE}/rest/v1/room_bookings",
                headers={**headers, "Prefer": "return=minimal"},
                json={
                    "room_id": room_id,
                    "check_in": event["dtstart"],
                    "check_out": event["dtend"],
                    "source": "booking_com",
                    "external_uid": event["uid"],
                },
                timeout=20,
            )
            if insert_resp.status_code >= 300:
                log(f"WARNUNG room={room_id} Insert fehlgeschlagen für {event['uid']}: {insert_resp.text}")

        for uid in removed_uids:
            requests.delete(
                f"{API_BASE}/rest/v1/room_bookings",
                headers=headers,
                params={"room_id": f"eq.{room_id}", "source": "eq.booking_com", "external_uid": f"eq.{uid}"},
                timeout=20,
            )

        requests.patch(
            f"{API_BASE}/rest/v1/channel_settings",
            headers={**headers, "Prefer": "return=minimal"},
            params={"room_id": f"eq.{room_id}"},
            json={
                "last_synced_at": datetime.now(timezone.utc).isoformat(),
                "last_sync_status": "ok",
                "last_sync_error": None,
                "last_imported_count": len(new_events),
            },
            timeout=20,
        )
        log(f"OK room={room_id}: {len(new_events)} neu, {len(removed_uids)} entfernt, {len(events)} gesamt")

    except Exception as exc:  # noqa: BLE001 — bewusst breit, damit ein Zimmer-Fehler die anderen nicht blockiert
        requests.patch(
            f"{API_BASE}/rest/v1/channel_settings",
            headers={**headers, "Prefer": "return=minimal"},
            params={"room_id": f"eq.{room_id}"},
            json={"last_sync_status": "error", "last_sync_error": str(exc)[:500]},
            timeout=20,
        )
        log(f"FEHLER room={room_id}: {exc}")


def main() -> None:
    service_role_key = read_env_var("SERVICE_ROLE_KEY")
    headers = rest_headers(service_role_key)

    resp = requests.get(
        f"{API_BASE}/rest/v1/channel_settings",
        headers=headers,
        params={"select": "room_id,booking_com_ical_url,last_synced_at,sync_requested_at"},
        timeout=20,
    )
    resp.raise_for_status()

    for settings in resp.json():
        if not settings.get("booking_com_ical_url"):
            continue
        if should_sync(settings):
            sync_room(settings["room_id"], settings["booking_com_ical_url"], headers)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        log(f"FATAL: {exc}")
        sys.exit(1)
