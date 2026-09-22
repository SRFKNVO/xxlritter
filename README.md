# XXL Ritter — Reservierungszentrale

Website & Reservierungszentrale für **Landgasthof Ritter XXL**, Herzogenweiler (Villingen-Schwenningen). Ersetzt die bestehende WordPress-Visitenkarte (xxlritter.de) durch ein System, das Tisch- und Zimmerreservierungen automatisch entgegennimmt, Doppelbuchungen technisch ausschließt und alles gebündelt in einem internen Dashboard zeigt.

Kundin: Leila Ihle. Hintergrund und Angebot siehe [docs/Briefing_RitterXXL.pdf](docs/Briefing_RitterXXL.pdf) und [docs/angebot-XXLRitter_Webapp.pdf](docs/angebot-XXLRitter_Webapp.pdf) (Quelle der Wahrheit für Preise/Leistungsumfang).

Ursprünglich als Frontend-Gerüst mit [Bolt.new](https://bolt.new) erstellt, wird ab jetzt unabhängig davon direkt über Claude Code weiterentwickelt und verwaltet.

## Tech-Stack

- **React 18 + TypeScript + Vite 5** — SPA mit react-router-dom
- **Tailwind CSS 3** — Styling
- **Framer Motion** — Animationen
- **Lucide React** — Icons
- **Supabase** — Postgres + Auth für die Reservierungszentrale (Schema fertig, siehe unten für die Einrichtung)

## Lokales Setup

Voraussetzungen: Node.js ≥ 18, npm.

```bash
npm install
npm run dev       # Vite-Dev-Server, siehe Terminal-Ausgabe für Port
npm run build     # Produktionsbuild → dist/
npm run preview   # Lokale Vorschau des Produktionsbuilds
npm run typecheck # TypeScript ohne Emit prüfen
npm run lint      # ESLint
```

Ohne verbundenes Supabase-Projekt läuft die Seite trotzdem — Reservierungsformular, Login und Dashboard zeigen dann einen Hinweis statt Daten, statt abzustürzen.

## Supabase — self-hosted auf eigenem VPS-Stack

Kein Supabase-Cloud-Projekt — Backend läuft **self-hosted** auf derselben VPS wie andere kinavio-Projekte (n8n, Urologie Mannheim), aber komplett isoliert von deren Stack.

### Wo & wie erkennbar

| | |
|---|---|
| **VPS** | Hostinger KVM, `31.97.78.189` (`srv922224.hstgr.cloud`) |
| **Pfad auf der VPS** | `/root/ritter-xxl-supabase/` (getrennt von `/root/supabase/` = Urologie Mannheim) |
| **Compose-Projektname** | `ritter-xxl-supabase` |
| **Docker-Netzwerk** | `ritter-xxl-supabase_default` (isoliert; einzige Ausnahme: der Gateway-Container hängt zusätzlich im bereits bestehenden `root_default`-Netz, ausschließlich damit Traefik ihn erreicht) |
| **Container** | `ritter-xxl-db`, `ritter-xxl-auth`, `ritter-xxl-rest`, `ritter-xxl-meta`, `ritter-xxl-studio`, `ritter-xxl-gw` (alle mit `ritter-xxl-`-Präfix, keine Namensüberschneidung mit `supabase-*` von Urologie Mannheim) |
| **Öffentliche API** | `https://ritter-xxl-api.kinavio.com` (nur diese eine Subdomain ist von außen erreichbar) |
| **Basis** | offizielles `supabase/supabase`-Repo, `docker/`-Ordner, getrimmt auf `db`+`auth`+`rest`+`meta`+`studio` (Realtime/Storage/ImgProxy/Edge-Functions/Pooler entfernt — für Phase 1 ungenutzt, spart RAM auf der eng bemessenen VPS) |

### Isolation im Detail

- **Kein gemeinsamer Container, kein gemeinsames Netzwerk, keine gemeinsame Datenbank** mit `/root/supabase/` (Urologie Mannheim) — komplett eigener Ordner, eigene Secrets, eigene Volumes.
- **Postgres-Port ist nirgends veröffentlicht** — weder an den Host noch nach außen, genau wie beim bestehenden Stack.
- **Kein neuer offener Firewall-Port nötig**: der Gateway-Container hat keinen `ports:`-Eintrag; er ist nur über das bereits laufende Traefik (Port 80/443, in `ufw` längst erlaubt) erreichbar. `ufw status` wurde nicht verändert.
- Frontend-Zugangsdaten kommen ausschließlich aus der lokalen `.env` dieses Repos (siehe oben) — nichts davon ist im Code hartcodiert.

### Betrieb

```bash
ssh root@31.97.78.189
cd /root/ritter-xxl-supabase
docker compose ps          # Status
docker compose up -d       # Starten
docker compose down        # Stoppen (Daten bleiben im Volume erhalten)
docker compose logs -f     # Logs
```

Migrationen liegen zusätzlich unter `/root/ritter-xxl-supabase/app-migrations/` auf dem Server (Kopie von `supabase/migrations/` aus diesem Repo) und wurden bereits ausgeführt. Erneut anwenden z. B. mit:
```bash
docker exec -i ritter-xxl-db psql -U postgres -d postgres < app-migrations/0001_init.sql
```

### Backup

`/root/ritter-xxl-supabase/backup.sh` läuft täglich um 03:15 Uhr per Cronjob (`crontab -l` auf der VPS): `pg_dump` (komprimiertes custom format) aus `ritter-xxl-db`, lokal abgelegt unter `/root/ritter-xxl-supabase/backups/` (14 Tage Aufbewahrung), zusätzlich Upload zu **Cloudflare R2** via `rclone` — Upload ist vorbereitet, aber noch **nicht aktiv**, da noch kein R2-Bucket/API-Token existiert (siehe „Offene Punkte" unten). Bis dahin liegen Backups nur lokal auf der VPS.

**Backup im Ernstfall zurückspielen:**
```bash
ssh root@31.97.78.189
cd /root/ritter-xxl-supabase
docker compose down                    # Stack stoppen
docker exec -i ritter-xxl-db pg_restore -U postgres -d postgres --clean --if-exists < backups/ritter-xxl-db-<timestamp>.dump
docker compose up -d
```

### Erreichbarkeit

Das Frontend läuft **nicht** auf dieser VPS (statische Vite-Seite, siehe „Deployment" unten — GitHub Pages o. ä.), Gäste-Browser rufen Supabase also direkt über das offene Internet auf. Deshalb öffentlich per HTTPS über den bestehenden Traefik (kein neuer Reverse Proxy) unter `ritter-xxl-api.kinavio.com`.

### Offene Punkte (brauchen dein Zutun)

- **DNS:** A-Record `ritter-xxl-api.kinavio.com` → `31.97.78.189` in Cloudflare anlegen, **Proxy-Status „DNS only" (graue Wolke)** — sonst kann Traefik das Let's-Encrypt-Zertifikat nicht ausstellen (TLS-ALPN-Challenge braucht direkten Zugriff auf Port 443 der VPS).
- **Cloudflare R2 für Backups:** Bucket (z. B. `ritter-xxl-backups`) + API-Token mit Object-Read/Write-Rechten anlegen, dann auf der VPS `rclone config` mit Remote-Namen `ritter-xxl-r2` einrichten (Endpoint, Access Key, Secret Key von R2). Danach läuft der nächtliche Upload automatisch mit.

### Erster Mitarbeiter-Account

Bereits angelegt für den Login-Test: `info@kinavio.com` (Passwort separat mitgeteilt).

### Supabase Studio (Admin-UI)

Bewusst **nicht** öffentlich geroutet — nur auf `127.0.0.1:18000` der VPS gebunden (nicht `0.0.0.0`, Port 8000 war durch den bestehenden Urologie-Mannheim-Stack schon belegt). Zugriff per SSH-Tunnel:

```bash
ssh -L 18000:127.0.0.1:18000 root@31.97.78.189
```

Dann im Browser `http://localhost:18000` öffnen — HTTP-Basic-Auth mit `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` aus `/root/ritter-xxl-supabase/.env` auf der VPS. Von dort aus lassen sich weitere Mitarbeiter-Accounts anlegen (Authentication → Users → Add user, „Auto Confirm User" aktivieren, da kein SMTP eingerichtet ist).

## Projektstruktur

```
XXLRitter/
├── docs/
│   ├── Briefing_RitterXXL.pdf          Interne Analyse + Preisstrategie (Juni 2026)
│   └── angebot-XXLRitter_Webapp.pdf    Finales Angebot Nr. 2002 an die Kundin
├── supabase/
│   ├── config.toml                     Eigene project_id + eigene lokale Ports (Kollisionsschutz)
│   └── migrations/                     Postgres-Schema, RLS, Buchungs-RPC (der Reihe nach ausführen)
├── src/
│   ├── App.tsx                         Öffentliche Seiten + /login + geschütztes /dashboard/*
│   ├── pages/                          Öffentliche Seiten + pages/dashboard/ (Mitarbeiterbereich)
│   ├── components/                     Navigation, Hero, Reservierung, Hotel, Footer, dashboard/DashboardLayout, ...
│   ├── context/AuthContext.tsx         Supabase-Auth-Session
│   ├── lib/supabase.ts, reservations.ts  Supabase-Client + Datenzugriff
│   ├── types/reservations.ts           Typen für Tische, Zimmer, Reservierungen
│   └── assets/                         Fotos & Logo (teils doppelt/unbereinigt aus dem Bolt-Export)
├── public/
└── index.html                          Meta-Tags, Schema.org (Restaurant + LodgingBusiness)
```

## Stand & offene Punkte

**Phase 1 (Tischreservierung) — fertig:**
- [x] Öffentliches Reservierungsformular an echte Verfügbarkeit angebunden (Öffnungszeiten, Dauer, Personenzahl), serverseitig race-condition-sicher (Postgres Exclusion-Constraint)
- [x] Mitarbeiter-Login (Supabase Auth) + geschütztes Dashboard
- [x] Dashboard: Tisch-Reservierungen verwalten (Status, Filter heute/Woche, Überschneidungs-Warnung) + Tische anlegen/bearbeiten/deaktivieren ohne Codeänderung
- [x] Adresse/Telefon/Öffnungszeiten von Demo-Platzhaltern auf bestätigte echte Daten korrigiert

**Noch offen (nächste Phasen laut Projekt-Prompt):**
- [ ] Öffentliche Zimmerbuchung + Verfügbarkeitsprüfung (Schema & RLS stehen schon, `rooms`/`room_bookings`, 3 Zimmer geseedet)
- [ ] Zimmerkalender im Dashboard (Website- vs. Booking.com-Belegung, manuelles Sperren)
- [ ] Speisekarte & Aktionen inkl. Bilder-Karussell (max. 3 Bilder, Auto-Rotation)
- [ ] Booking.com-Anbindung (iCal-Sync) + Facebook-Vorschau
- [ ] E-Mail-Bestätigung an Gäste nach Reservierung/Buchung
- [ ] SMS/WhatsApp-Benachrichtigung (niedrige Priorität, Architektur ist dafür vorbereitet)
- [ ] Echte Zimmernamen/-beschreibungen vom Kunden (aktuell nur die 3 Kategorien von xxlritter.de)
- [ ] Klärung: bestehende WordPress-Seite ersetzen oder parallel betreiben? Wo hosten (EU)? Frühstückspreis?
- [ ] `src/assets/` enthält doppelte Bilddateien (u. a. `... copy.jpg/png`) — vor Go-Live bereinigen
- [ ] Deployment für die öffentliche Seite (GitHub Pages vorbereitet, siehe unten; Domain xxlritter.de zeigt aktuell noch auf die alte WordPress-Seite)

## Deployment

GitHub-Actions-Workflow (`.github/workflows/deploy.yml`) baut bei jedem Push auf `main` und deployt nach GitHub Pages — dafür muss das Repo public sein (Pages ist bei privaten Repos im kostenlosen Plan nicht verfügbar) und Pages einmalig in den Repo-Settings mit Quelle „GitHub Actions" aktiviert werden.

Alternative Hoster (erkennen Vite-Defaults automatisch):

- **Netlify** — Build command `npm run build`, Publish directory `dist`
- **Vercel** — Framework-Preset „Vite"
- **Cloudflare Pages** — Build command `npm run build`, Build output `dist`
