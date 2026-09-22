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

## Supabase einrichten (nötig für Reservierung, Login, Dashboard)

1. Projekt auf [supabase.com](https://supabase.com) anlegen (kostenlos reicht für den Start; **EU-Region wählen** wegen DSGVO).
2. Im SQL-Editor die beiden Migrationen aus `supabase/migrations/` der Reihe nach ausführen (`0001_init.sql`, dann `0002_rls_and_rpc.sql`). Legt Schema, Start-Seed (4 Tische, 3 Zimmer, Öffnungszeiten) und die Buchungs-Funktion an.
3. Unter **Authentication → Users** einen Mitarbeiter-Account anlegen (E-Mail + Passwort) — jeder eingeloggte Nutzer ist Mitarbeiter, es gibt bewusst keine separate Rollenverwaltung für den Start.
4. `.env` aus `.env.example` erstellen und mit **Project Settings → API** befüllen:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. Dev-Server neu starten.

## Projektstruktur

```
XXLRitter/
├── docs/
│   ├── Briefing_RitterXXL.pdf          Interne Analyse + Preisstrategie (Juni 2026)
│   └── angebot-XXLRitter_Webapp.pdf    Finales Angebot Nr. 2002 an die Kundin
├── supabase/migrations/                Postgres-Schema, RLS, Buchungs-RPC (der Reihe nach ausführen)
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
