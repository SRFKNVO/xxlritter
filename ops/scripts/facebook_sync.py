#!/usr/bin/env python3
"""
Facebook-Vorschau-Sync für die Ritter-XXL-Reservierungszentrale.

Läuft per Cron (empfohlen: alle 30 Minuten) auf der VPS. Holt den neuesten
Post der Facebook-Seite über die Meta Graph API und schreibt NUR das bereits
öffentliche Ergebnis (Text, Bild, Link) in facebook_cache — der Access Token
selbst verlässt niemals /root/ritter-xxl-supabase/secrets/facebook.env und
landet nie in Postgres oder im Frontend-Code.

Token-Hinweis: siehe README, Abschnitt "Facebook Long-Lived Token" für die
empfohlene Beschaffung (Page-Token über einen langlebigen User-Token, nicht
der kurzlebige Token aus dem Graph-API-Explorer) und was zu tun ist, wenn
der Token doch einmal ungültig wird.
"""

import sys
from datetime import datetime

import requests

API_BASE = "http://127.0.0.1:18000"
ENV_FILE = "/root/ritter-xxl-supabase/.env"
SECRETS_FILE = "/root/ritter-xxl-supabase/secrets/facebook.env"
LOG_FILE = "/root/ritter-xxl-supabase/scripts/facebook_sync.log"
GRAPH_VERSION = "v21.0"


def log(msg: str) -> None:
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def read_var(path: str, name: str) -> str:
    with open(path) as f:
        for line in f:
            if line.startswith(f"{name}="):
                return line.strip().split("=", 1)[1]
    raise RuntimeError(f"{name} nicht in {path} gefunden")


def main() -> None:
    page_id = read_var(SECRETS_FILE, "FB_PAGE_ID")
    token = read_var(SECRETS_FILE, "FB_PAGE_ACCESS_TOKEN")
    service_role_key = read_var(ENV_FILE, "SERVICE_ROLE_KEY")

    resp = requests.get(
        f"https://graph.facebook.com/{GRAPH_VERSION}/{page_id}/posts",
        params={
            "fields": "id,message,permalink_url,full_picture,created_time",
            "limit": 1,
            "access_token": token,
        },
        timeout=20,
    )
    data = resp.json()

    if "error" in data:
        err = data["error"]
        if err.get("code") == 190:
            log(f"FEHLER: Access Token ungültig/abgelaufen (code 190) — {err.get('message')}. "
                f"Neuen Long-Lived Page Token besorgen, siehe README.")
        else:
            log(f"FEHLER Graph API: {err}")
        return

    posts = data.get("data", [])
    if not posts:
        log("Kein Post gefunden")
        return

    post = posts[0]
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    upsert_resp = requests.post(
        f"{API_BASE}/rest/v1/facebook_cache?on_conflict=id",
        headers=headers,
        json={
            "id": True,
            "post_id": post.get("id"),
            "message": post.get("message"),
            "permalink_url": post.get("permalink_url"),
            "picture_url": post.get("full_picture"),
            "posted_at": post.get("created_time"),
            "fetched_at": datetime.utcnow().isoformat() + "Z",
        },
        timeout=20,
    )
    if upsert_resp.status_code >= 300:
        log(f"FEHLER beim Schreiben nach facebook_cache: {upsert_resp.text}")
    else:
        log(f"OK: Post {post.get('id')} aktualisiert")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        log(f"FATAL: {exc}")
        sys.exit(1)
