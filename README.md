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
| **Container** | `ritter-xxl-db`, `ritter-xxl-auth`, `ritter-xxl-rest`, `ritter-xxl-meta`, `ritter-xxl-studio`, `ritter-xxl-storage`, `ritter-xxl-gw` (alle mit `ritter-xxl-`-Präfix, keine Namensüberschneidung mit `supabase-*` von Urologie Mannheim) |
| **Öffentliche API** | `https://ritter-xxl-api.kinavio.com` (nur diese eine Subdomain ist von außen erreichbar) |
| **Basis** | offizielles `supabase/supabase`-Repo, `docker/`-Ordner, getrimmt auf `db`+`auth`+`rest`+`meta`+`studio`+`storage` (Realtime/ImgProxy/Edge-Functions/Pooler weiterhin entfernt — ungenutzt, spart RAM auf der eng bemessenen VPS; Storage kam in Phase 2 für Zimmer-/Aktionsbilder dazu, bewusst ohne ImgProxy — Bilder werden im Browser vor dem Upload verkleinert) |

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

Migrationen liegen zusätzlich unter `/root/ritter-xxl-supabase/app-migrations/` auf dem Server (Kopie von `supabase/migrations/` aus diesem Repo) und wurden bereits ausgeführt (0001–0006). Erneut anwenden z. B. mit:
```bash
docker exec -i ritter-xxl-db psql -U postgres -d postgres < app-migrations/0001_init.sql
```

`/root/ritter-xxl-supabase/scripts/` enthält die beiden Cron-Skripte für Booking.com- und Facebook-Sync (laufen als Python3 direkt auf dem Host, nicht in einem Container — siehe „Kanäle" unten), `crontab -l` zeigt alle drei geplanten Jobs (Backup täglich, Booking.com alle 5 Min., Facebook alle 30 Min.).

### Backup

`/root/ritter-xxl-supabase/backup.sh` läuft täglich um 03:15 Uhr per Cronjob (`crontab -l` auf der VPS): `pg_dump` (komprimiertes custom format) aus `ritter-xxl-db` **und** ein `tar.gz` des Storage-Volumes (hochgeladene Zimmer-/Aktionsbilder — die stehen nicht in der DB, ein reines DB-Backup würde sie sonst nicht mitsichern), beides lokal abgelegt unter `/root/ritter-xxl-supabase/backups/` (14 Tage Aufbewahrung), zusätzlich Upload zu **Cloudflare R2** via `rclone` (Remote `ritter-xxl-r2`, Bucket `ritter-xxl-backups`) — **aktiv seit 2026-09-23**, dort 30 Tage Aufbewahrung (`rclone delete --min-age 30d`).

**Stolperfalle beim Einrichten (falls je neu aufgesetzt werden muss):** Die per `apt` installierte `rclone`-Version auf Ubuntu 24.04 war stark veraltet (v1.60.1) und lieferte bei R2-Uploads ein nichtssagendes `AccessDenied`, obwohl das Token korrekte Rechte hatte — Lesen ging, Schreiben nicht. Fix: `rclone` über den offiziellen Installer aktualisieren (`curl https://rclone.org/install.sh | sudo bash`). Danach zeigte die neuere Version den echten Grund: rclone versucht standardmäßig vor jedem Upload per `CreateBucket`-Call zu prüfen, ob der Bucket existiert — das darf ein bucket-beschränktes R2-Token aber nicht (korrekt so, es soll ja nur in den Bucket schreiben, keine Buckets verwalten). Lösung: in der Remote-Konfiguration `no_check_bucket = true` setzen.

**Backup im Ernstfall zurückspielen:**
```bash
ssh root@31.97.78.189
cd /root/ritter-xxl-supabase
docker compose down                    # Stack stoppen
docker exec -i ritter-xxl-db pg_restore -U postgres -d postgres --clean --if-exists < backups/ritter-xxl-db-<timestamp>.dump
tar -xzf backups/ritter-xxl-storage-<timestamp>.tar.gz -C volumes/   # hochgeladene Bilder zurückspielen
docker compose up -d
```

### Erreichbarkeit

Das Frontend läuft **nicht** auf dieser VPS (statische Vite-Seite, siehe „Deployment" unten — GitHub Pages o. ä.), Gäste-Browser rufen Supabase also direkt über das offene Internet auf. Deshalb öffentlich per HTTPS über den bestehenden Traefik (kein neuer Reverse Proxy) unter `ritter-xxl-api.kinavio.com`.

### Offene Punkte (brauchen dein Zutun)

- **DNS:** A-Record `ritter-xxl-api.kinavio.com` → `31.97.78.189` in Cloudflare anlegen, **Proxy-Status „DNS only" (graue Wolke)** — sonst kann Traefik das Let's-Encrypt-Zertifikat nicht ausstellen (TLS-ALPN-Challenge braucht direkten Zugriff auf Port 443 der VPS).
- ~~Cloudflare R2 für Backups~~ — erledigt (2026-09-23), Upload + 30-Tage-Rotation laufen automatisch mit dem täglichen Cronjob.

### Erster Mitarbeiter-Account

Bereits angelegt für den Login-Test: `info@kinavio.com` (Passwort separat mitgeteilt).

### Supabase Studio (Admin-UI)

Bewusst **nicht** öffentlich geroutet — nur auf `127.0.0.1:18000` der VPS gebunden (nicht `0.0.0.0`, Port 8000 war durch den bestehenden Urologie-Mannheim-Stack schon belegt). Zugriff per SSH-Tunnel:

```bash
ssh -L 18000:127.0.0.1:18000 root@31.97.78.189
```

Dann im Browser `http://localhost:18000` öffnen — HTTP-Basic-Auth mit `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` aus `/root/ritter-xxl-supabase/.env` auf der VPS. Von dort aus lassen sich weitere Mitarbeiter-Accounts anlegen (Authentication → Users → Add user, „Auto Confirm User" aktivieren, da kein SMTP eingerichtet ist).

## Sicherheitsmodell: Row Level Security

Das Frontend ist eine statische SPA ohne eigenes Backend — der Gäste-Browser spricht die Supabase-API direkt an. **RLS ist deshalb die einzige Schutzschicht**, nicht nur eine Nebensache. Prinzip in diesem Projekt: Für alles, was Gästedaten enthält (Namen, Telefonnummern, E-Mails), bekommt `anon` **keine** direkte `SELECT`/`INSERT`/`UPDATE`-Policy auf der Tabelle — der einzige Weg ist eine `SECURITY DEFINER`-Funktion (RPC), die serverseitig validiert und nur das zurückgibt, was die anfragende Person selbst gerade angelegt hat. So kann ein Gast beim Buchen nie die Daten anderer Gäste mitlesen, egal was er im Browser an Requests bastelt.

| Tabelle / Bucket | `anon` (Gäste-Browser) | `authenticated` (Mitarbeiter) |
|---|---|---|
| `restaurant_tables` | kein Zugriff | voll (CRUD) |
| `table_reservations` | kein Zugriff — nur über RPC `create_table_reservation` | voll (CRUD) |
| `rooms` | `SELECT` nur `is_active = true` | voll (CRUD) |
| `room_bookings` | kein Zugriff — nur über RPC `create_room_booking` / `find_available_rooms` | voll (CRUD) |
| `opening_hours` | `SELECT` (unkritisch, wird fürs Buchungsformular gebraucht) | voll (CRUD) |
| `reservation_settings` | `SELECT` (unkritisch) | voll (CRUD) |
| `menu_items` | `SELECT` nur `is_active = true` | voll (CRUD) |
| `promotions` | `SELECT` nur `is_published = true` und `carousel_slot` gesetzt (Entwürfe unsichtbar) | voll (CRUD) |
| `channel_settings` | **kein Zugriff, keine einzige Policy** — RLS aktiv ohne Match heißt kompletter Ausschluss. Enthält die Booking.com-iCal-URL mit geheimem Token; darf nie öffentlich lesbar sein. | voll (CRUD) |
| `facebook_cache` | `SELECT` (ist ohnehin ein öffentlicher Facebook-Post) | `SELECT` — auch Mitarbeiter haben keine Schreib-Policy, nur das `service_role`-Sync-Skript schreibt |
| `storage.objects` (Bucket `public-images`) | `SELECT` | `SELECT`/`INSERT`/`UPDATE`/`DELETE` |

**RPC-Funktionen** (`SECURITY DEFINER`, für `anon` freigegeben): `create_table_reservation`, `find_available_rooms`, `create_room_booking`. Alle validieren serverseitig neu (Datum/Uhrzeit/Öffnungszeiten/Verfügbarkeit), dem Client wird nichts geglaubt.

**Der Facebook-Access-Token landet nie in Postgres** — er liegt ausschließlich in `/root/ritter-xxl-supabase/secrets/facebook.env` auf der VPS (chmod 600, nicht im Git-Repo). Der Sync-Cron liest ihn dort, ruft die Graph API auf und schreibt nur das bereits öffentliche Ergebnis (Text/Bild/Link des Posts) in `facebook_cache`.

## Kanäle: Booking.com & Facebook

### Booking.com (iCal-Sync)

1. Im Booking.com-Extranet pro Zimmer den **Export-iCal-Link** kopieren (Kalender → Kalender synchronisieren → Exportieren).
2. Im Dashboard unter **Kanäle** bei dem jeweiligen Zimmer einfügen.
3. `/root/ritter-xxl-supabase/scripts/booking_sync.py` läuft per Cron alle 5 Minuten auf der VPS (nicht im Container) und synchronisiert ein Zimmer, sobald seit dem letzten erfolgreichen Lauf > 55 Minuten vergangen sind **oder** der „Jetzt synchronisieren"-Button im Dashboard gedrückt wurde (wirkt dann innerhalb der nächsten 5 Minuten). Zugriff auf die REST-API läuft über den lokalen, nicht-öffentlichen Gateway-Port `127.0.0.1:18000` mit dem `service_role`-Key.
4. Importierte Belegungen landen als `room_bookings` mit `source='booking_com'` und `external_uid` (dedupliziert gegen erneuten Import), ohne Gastnamen (Booking.com liefert im iCal aus Datenschutzgründen keine Gästedaten). Auf Booking.com stornierte Termine werden beim nächsten Sync automatisch wieder entfernt.
5. Logs: `/root/ritter-xxl-supabase/scripts/booking_sync.log`. Status pro Zimmer auch im Dashboard sichtbar (`channel_settings.last_sync_status`/`last_sync_error`).

### Facebook-Vorschau

1. Secrets-Datei auf der VPS anlegen (liegt **nicht** im Git-Repo):
   ```bash
   ssh root@31.97.78.189
   cp /root/ritter-xxl-supabase/secrets/facebook.env.example /root/ritter-xxl-supabase/secrets/facebook.env
   nano /root/ritter-xxl-supabase/secrets/facebook.env   # FB_PAGE_ID + FB_PAGE_ACCESS_TOKEN eintragen
   chmod 600 /root/ritter-xxl-supabase/secrets/facebook.env
   ```
2. `/root/ritter-xxl-supabase/scripts/facebook_sync.py` läuft per Cron alle 30 Minuten, schreibt den neuesten Post in `facebook_cache`. Logs: `scripts/facebook_sync.log`.

**Empfehlung zum Token-Ablauf (deine Entscheidung stand noch aus):** Ein Page-Access-Token direkt aus dem Graph-API-Explorer ist nur kurzlebig (Stunden). Robust für dieses Projekt — ein einzelnes, wenig kritisches Vorschau-Widget — ist folgender Weg:

1. Kurzlebigen **User**-Access-Token holen (Facebook-Login-Flow oder Graph-API-Explorer) mit den Rechten `pages_show_list` + `pages_read_engagement`, als Admin der Seite `facebook.com/RitterRestaurant`.
2. Gegen einen **langlebigen User-Token** (~60 Tage) tauschen: `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=KURZER_TOKEN`.
3. Mit diesem langlebigen User-Token `GET /me/accounts` aufrufen → der darin enthaltene **Page-Access-Token ist praktisch nicht-ablaufend** (bleibt gültig, solange der User-Token gültig bleibt, der Admin die Seite nicht verlässt/das Passwort nicht ändert und die App nicht deautorisiert wird). Genau dieser Page-Token gehört in `facebook.env` — nicht der direkte Kurzzeit-Token aus dem Explorer.
4. Ein voll automatischer Refresh (App Secret + erneuter Tausch alle paar Wochen) wäre für dieses kleine Vorschau-Widget Overkill. Stattdessen erkennt `facebook_sync.py` einen ungültigen Token am Graph-API-Fehlercode `190` und loggt das klar in `facebook_sync.log` — die Website zeigt in diesem Fall einfach weiter den letzten erfolgreich abgerufenen Post (kein Absturz, nur „einfriert" optisch). Praktikabel: gelegentlich (z. B. alle paar Monate) `facebook_sync.log` prüfen oder die Kanäle-Seite im Dashboard anschauen.

## Projektstruktur

```
XXLRitter/
├── docs/
│   ├── Briefing_RitterXXL.pdf          Interne Analyse + Preisstrategie (Juni 2026)
│   └── angebot-XXLRitter_Webapp.pdf    Finales Angebot Nr. 2002 an die Kundin
├── ops/                                 Kopie der VPS-Artefakte zur Versionierung (keine Secrets):
│   ├── docker-compose.yml              Referenz des self-hosted Stacks (${VAR}-Platzhalter, keine echten Werte)
│   ├── backup.sh                       Backup-Script (Original läuft von /root/ritter-xxl-supabase/backup.sh)
│   └── scripts/                        booking_sync.py, facebook_sync.py (Original unter .../scripts/)
├── supabase/
│   ├── config.toml                     Eigene project_id + eigene lokale Ports (Kollisionsschutz)
│   └── migrations/                     0001–0006: Schema, RLS, RPCs (der Reihe nach ausführen)
├── src/
│   ├── App.tsx                         Öffentliche Seiten + /login + geschütztes /dashboard/*
│   ├── pages/                          Öffentliche Seiten + pages/dashboard/ (Mitarbeiterbereich)
│   ├── components/                     Navigation, Hero, Reservierung, Hotel, Footer, AktionenKarussell,
│   │                                    FacebookVorschau, SpeisekartenListe, dashboard/DashboardLayout, ...
│   ├── context/AuthContext.tsx         Supabase-Auth-Session
│   ├── lib/supabase.ts, reservations.ts, image.ts  Supabase-Client, Datenzugriff, Bild-Resize vor Upload
│   ├── types/reservations.ts           Typen für Tische, Zimmer, Reservierungen, Speisekarte, Kanäle
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

**Phase 2 (Zimmerbuchung, Speisekarte/Aktionen, Kanäle) — fertig:**
- [x] Öffentliche Zimmerverfügbarkeit + Buchung, serverseitig race-condition-sicher (gleiches Exclusion-Constraint-Muster wie Tische)
- [x] Zimmerkalender im Dashboard (Website/Booking.com/gesperrt farblich unterschieden, manuelles Sperren) + Zimmer verwalten (inkl. Bild-Upload)
- [x] Speisekarte (Kategorien, Inline-Bearbeitung) + Aktionen-Karussell (max. 3 Slots, Konflikt erfordert aktive Auswahl statt stillem Überschreiben) — beides jetzt auch öffentlich sichtbar (`/speisekarte`, Startseite)
- [x] Storage-Bucket `public-images` für Zimmer-/Aktionsbilder, Bilder werden im Browser auf 1600px verkleinert vor dem Upload
- [x] Booking.com-iCal-Sync (Cron alle 5 Min.) + Facebook-Vorschau-Sync (Cron alle 30 Min.), beides mit eigenem Status-/Fehler-Tracking
- [x] RLS für alle neuen Tabellen dokumentiert (siehe „Sicherheitsmodell" oben), `channel_settings` bewusst ohne jede anon-Policy

**Noch offen:**
- [ ] **Booking.com-iCal-URLs pro Zimmer** eintragen (Dashboard → Kanäle) — Sync läuft erst, wenn eine URL hinterlegt ist
- [ ] **Facebook-Token einrichten** (`secrets/facebook.env` auf der VPS, siehe „Kanäle" oben) — Empfehlung zum langlebigen Token dort dokumentiert
- [ ] **DNS** für `ritter-xxl-api.kinavio.com` (siehe oben)
- [ ] E-Mail-Bestätigung an Gäste nach Reservierung/Buchung
- [ ] SMS/WhatsApp-Benachrichtigung (niedrige Priorität, Architektur ist dafür vorbereitet)
- [ ] Echte Zimmernamen/-beschreibungen vom Kunden (aktuell nur die 3 Kategorien von xxlritter.de)
- [ ] Klärung: bestehende WordPress-Seite ersetzen oder parallel betreiben? Frühstückspreis?
- [ ] `src/assets/` enthält doppelte Bilddateien (u. a. `... copy.jpg/png`) — vor Go-Live bereinigen
- [ ] Deployment für die öffentliche Seite (GitHub Pages vorbereitet, siehe unten; Domain xxlritter.de zeigt aktuell noch auf die alte WordPress-Seite)

## Deployment

GitHub-Actions-Workflow (`.github/workflows/deploy.yml`) baut bei jedem Push auf `main` und deployt nach GitHub Pages — dafür muss das Repo public sein (Pages ist bei privaten Repos im kostenlosen Plan nicht verfügbar) und Pages einmalig in den Repo-Settings mit Quelle „GitHub Actions" aktiviert werden.

Alternative Hoster (erkennen Vite-Defaults automatisch):

- **Netlify** — Build command `npm run build`, Publish directory `dist`
- **Vercel** — Framework-Preset „Vite"
- **Cloudflare Pages** — Build command `npm run build`, Build output `dist`
