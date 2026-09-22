-- Phase 2: Kanäle (Booking.com-iCal + Facebook-Vorschau).
--
-- Wichtig für die Sicherheit dieser Architektur (Gäste-Browser spricht
-- Supabase direkt an, kein eigenes Backend): Booking.com-iCal-URLs enthalten
-- ein geheimes Token in der Query-String und dürfen niemals von anon
-- lesbar sein. channel_settings hat deshalb bewusst KEINE anon-Policy —
-- RLS ist aktiviert, ohne passende Policy ist der Zugriff für anon damit
-- vollständig verweigert (nur authenticated/service_role kommen ran).
--
-- Der Facebook-Access-Token landet überhaupt nie in Postgres — nur das
-- bereits abgerufene, ohnehin öffentliche Post-Ergebnis (facebook_cache).
-- Der Sync selbst läuft serverseitig per Cron auf der VPS mit dem
-- service_role-Key (umgeht RLS bewusst, ist kein Browser-Client).

create table channel_settings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) unique,
  booking_com_ical_url text,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  last_imported_count int,
  sync_requested_at timestamptz,
  created_at timestamptz not null default now()
);

alter table channel_settings enable row level security;

create policy "staff_all_channel_settings" on channel_settings
  for all to authenticated using (true) with check (true);

-- Ein channel_settings-Datensatz pro Start-Zimmer vorbereiten (ical_url
-- bleibt leer, bis die Kundin echte Booking.com-Export-URLs liefert).
insert into channel_settings (room_id)
select id from rooms
on conflict (room_id) do nothing;

-- Singleton-Tabelle: genau eine Zeile, der zuletzt abgerufene Facebook-Post.
create table facebook_cache (
  id boolean primary key default true check (id),
  post_id text,
  message text,
  permalink_url text,
  picture_url text,
  posted_at timestamptz,
  fetched_at timestamptz not null default now()
);

alter table facebook_cache enable row level security;

-- Öffentlich lesbar (ist ohnehin ein öffentlicher Facebook-Post), aber
-- weder von anon noch von authenticated beschreibbar — nur der Sync-Cron
-- mit dem service_role-Key darf schreiben.
create policy "facebook_cache_public_read" on facebook_cache
  for select to anon, authenticated using (true);
