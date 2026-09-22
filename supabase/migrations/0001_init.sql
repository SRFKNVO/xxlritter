-- Reservierungszentrale Ritter XXL — Grundschema
-- Tische und Zimmer sind Datensätze, keine Festwerte: beide Bestände sind
-- über das Dashboard erweiter- und deaktivierbar, ohne Codeänderung.

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

create type reservation_status as enum ('neu', 'bestätigt', 'erledigt', 'storniert');

-- ─── Restaurant: Tische ────────────────────────────────────────────────

create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table table_reservations (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references restaurant_tables(id),
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  party_size int not null check (party_size > 0),
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  note text,
  status reservation_status not null default 'neu',
  reference_code text not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at timestamptz not null default now(),
  constraint table_reservations_time_order check (end_time > start_time),
  -- Serverseitiger, transaktionssicherer Overlap-Schutz: zwei Reservierungen
  -- für denselben Tisch mit überlappendem Zeitraum können nie beide bestehen,
  -- auch nicht bei gleichzeitigen Anfragen (Race Condition ausgeschlossen).
  exclude using gist (
    table_id with =,
    tsrange((reservation_date + start_time)::timestamp, (reservation_date + end_time)::timestamp) with &&
  ) where (status <> 'storniert')
);

create index on table_reservations (reservation_date);

-- ─── Hotel: Zimmer ──────────────────────────────────────────────────────
-- Schema bereits jetzt vollständig angelegt (inkl. Overlap-Schutz), auch wenn
-- die öffentliche Buchungsstrecke dafür erst in Phase 2 gebaut wird.

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_per_night numeric(10,2),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id),
  check_in date not null,
  check_out date not null,
  guest_name text not null,
  guest_phone text,
  guest_email text,
  breakfast boolean not null default false,
  note text,
  status reservation_status not null default 'neu',
  reference_code text not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  constraint room_bookings_date_order check (check_out > check_in),
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status <> 'storniert')
);

-- ─── Stammdaten: Öffnungszeiten & Reservierungs-Einstellungen ──────────
-- weekday folgt JS Date.getDay(): 0 = Sonntag ... 6 = Samstag.
-- Mehrere Zeilen pro Wochentag erlauben Splits wie Sonntag Mittag+Abend.

create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  constraint opening_hours_time_order check (close_time > open_time)
);

create table reservation_settings (
  key text primary key,
  value jsonb not null
);

-- ─── Start-Seed ─────────────────────────────────────────────────────────

insert into restaurant_tables (name, capacity) values
  ('Tisch 1', 6),
  ('Tisch 2', 6),
  ('Tisch 3', 6),
  ('Tisch 4', 6);

-- Namen laut xxlritter.de: keine individuellen Zimmernamen genannt, nur
-- diese drei Kategorien. Beschreibungen/Fotos später im Dashboard ergänzbar.
insert into rooms (name, description, price_per_night) values
  ('Einzelzimmer', 'Komfortables Einzelzimmer mit WLAN, TV und Parkplatz. Frühstück auf Wunsch zubuchbar.', null),
  ('Doppelzimmer', 'Komfortables Doppelzimmer mit WLAN, TV und Parkplatz. Frühstück auf Wunsch zubuchbar.', null),
  ('Familienzimmer', 'Geräumiges Familienzimmer mit WLAN, TV und Parkplatz. Frühstück auf Wunsch zubuchbar.', null);

-- Montag (1) bewusst ohne Eintrag = Ruhetag.
insert into opening_hours (weekday, open_time, close_time) values
  (0, '11:00', '14:00'),
  (0, '17:00', '21:00'),
  (2, '17:00', '22:00'),
  (3, '17:00', '22:00'),
  (4, '17:00', '22:00'),
  (5, '17:00', '22:00'),
  (6, '17:00', '22:00');

insert into reservation_settings (key, value) values
  ('table_duration', '{"min_minutes": 90, "max_minutes": 120, "step_minutes": 15, "default_minutes": 90}');
