# XXL Ritter — Restaurant, Landhotel & Events

Website & Reservierungszentrale für **Landgasthof Ritter XXL**, Herzogenweiler (Villingen-Schwenningen). Ersetzt die bestehende WordPress-Visitenkarte (xxlritter.de) durch ein System, das Tischreservierungen und Zimmerbuchungen automatisch entgegennimmt.

Kundin: Leila Ihle. Hintergrund und Angebot siehe [docs/Briefing_RitterXXL.pdf](docs/Briefing_RitterXXL.pdf) und [docs/angebot-XXLRitter_Webapp.pdf](docs/angebot-XXLRitter_Webapp.pdf) (Quelle der Wahrheit für Preise/Leistungsumfang).

Ursprünglich als Frontend-Gerüst mit [Bolt.new](https://bolt.new) erstellt, wird ab jetzt unabhängig davon direkt über Claude Code weiterentwickelt und verwaltet.

## Tech-Stack

- **React 18 + TypeScript + Vite 5** — SPA mit react-router-dom
- **Tailwind CSS 3** — Styling
- **Framer Motion** — Animationen
- **Lucide React** — Icons
- **Supabase** — als Dependency vorhanden, noch **nicht angebunden** (kein `.env`, keine Aufrufe im Code) — wird für die Reservierungszentrale (Dashboard, Zimmerkalender, Push-Benachrichtigung laut Angebot) benötigt

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

## Projektstruktur

```
XXLRitter/
├── docs/
│   ├── Briefing_RitterXXL.pdf          Interne Analyse + Preisstrategie (Juni 2026)
│   └── angebot-XXLRitter_Webapp.pdf    Finales Angebot Nr. 2002 an die Kundin
├── src/
│   ├── App.tsx                         Router: /, /speisekarte, /erlebnis, /hotel, /events, /galerie, /kontakt
│   ├── pages/                          Eine Seite pro Route
│   ├── components/                     Navigation, Hero, Reservierung, Hotel, Speisekarte, Events, Galerie, Bewertungen, Footer, WhatsAppButton
│   └── assets/                         Fotos & Logo (teils doppelt/unbereinigt aus dem Bolt-Export)
├── public/
└── index.html                          Meta-Tags, Schema.org (Restaurant + LodgingBusiness)
```

## Stand & offene Punkte

- [x] Frontend-Seiten für alle Bereiche (Restaurant, Hotel, Events, Galerie) vorhanden
- [x] Build läuft sauber (`npm run build`)
- [ ] **Supabase-Backend fehlt komplett** — keine echte Reservierungs-/Buchungslogik, keine `.env`
- [ ] Dashboard/Inbox für Reservierungen (Baustein 2 im Angebot)
- [ ] Zimmerkalender mit Belegungslogik (Baustein 4)
- [ ] Push-Benachrichtigung (Baustein 3)
- [ ] Speisekarten-Verwaltung im Dashboard (Baustein 5)
- [ ] Booking.com-Anbindung (Option laut Angebot)
- [ ] `src/assets/` enthält doppelte Bilddateien (u. a. `... copy.jpg/png`) — vor Go-Live bereinigen
- [ ] Kein Deployment konfiguriert (kein `netlify.toml`, keine Site-ID im Repo) — Domain xxlritter.de zeigt aktuell noch auf die alte WordPress-Seite

## Deployment

Noch nicht eingerichtet. Erkennt Vite-Defaults automatisch bei:

- **Netlify** — Build command `npm run build`, Publish directory `dist`
- **Vercel** — Framework-Preset „Vite"
- **Cloudflare Pages** — Build command `npm run build`, Build output `dist`
