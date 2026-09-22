-- Row Level Security: Gäste (anon) reservieren ausschließlich über die
-- untenstehenden Funktionen, nie mit direktem Tabellenzugriff. Mitarbeiter
-- (authenticated, siehe Supabase Auth) verwalten alles im Dashboard.

alter table restaurant_tables enable row level security;
alter table table_reservations enable row level security;
alter table rooms enable row level security;
alter table room_bookings enable row level security;
alter table opening_hours enable row level security;
alter table reservation_settings enable row level security;

-- Öffnungszeiten & Reservierungs-Einstellungen sind unkritisch und werden
-- vom öffentlichen Buchungsformular direkt gelesen (z. B. für die
-- Uhrzeit-Auswahl passend zum gewählten Wochentag).
create policy "opening_hours_public_read" on opening_hours
  for select to anon using (true);
create policy "reservation_settings_public_read" on reservation_settings
  for select to anon using (true);

-- Aktive Zimmer dürfen öffentlich gelistet werden (z. B. für die künftige
-- Verfügbarkeitsprüfung), Buchungen selbst laufen aber nur über Funktionen.
create policy "rooms_public_read_active" on rooms
  for select to anon using (is_active);

-- Mitarbeiter: volle Verwaltung aller Bereiche im Dashboard.
create policy "staff_all_restaurant_tables" on restaurant_tables
  for all to authenticated using (true) with check (true);
create policy "staff_all_table_reservations" on table_reservations
  for all to authenticated using (true) with check (true);
create policy "staff_all_rooms" on rooms
  for all to authenticated using (true) with check (true);
create policy "staff_all_room_bookings" on room_bookings
  for all to authenticated using (true) with check (true);
create policy "staff_all_opening_hours" on opening_hours
  for all to authenticated using (true) with check (true);
create policy "staff_all_reservation_settings" on reservation_settings
  for all to authenticated using (true) with check (true);

-- ─── RPC: Tischreservierung anlegen ─────────────────────────────────────
-- Läuft als SECURITY DEFINER, damit anon weder Tische noch andere
-- Reservierungen direkt sehen muss. Prüft Öffnungszeiten und Dauer
-- serverseitig neu (dem Client wird nicht vertraut) und probiert alle
-- passenden Tische der Reihe nach durch; der Exclusion-Constraint aus
-- Migration 0001 verhindert dabei jede Doppelbuchung, auch bei
-- gleichzeitigen Anfragen.

create or replace function create_table_reservation(
  p_date date,
  p_start_time time,
  p_duration_minutes int,
  p_party_size int,
  p_guest_name text,
  p_guest_phone text,
  p_guest_email text default null,
  p_note text default null
) returns table_reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb;
  v_min int;
  v_max int;
  v_end_time time;
  v_weekday int;
  v_is_open boolean;
  v_table record;
  v_result table_reservations;
begin
  if p_guest_name is null or btrim(p_guest_name) = '' then
    raise exception 'guest_name_required';
  end if;
  if p_guest_phone is null or btrim(p_guest_phone) = '' then
    raise exception 'guest_phone_required';
  end if;
  if p_party_size is null or p_party_size < 1 then
    raise exception 'invalid_party_size';
  end if;

  select value into v_settings from reservation_settings where key = 'table_duration';
  v_min := coalesce((v_settings ->> 'min_minutes')::int, 60);
  v_max := coalesce((v_settings ->> 'max_minutes')::int, 180);

  if p_duration_minutes is null or p_duration_minutes < v_min or p_duration_minutes > v_max then
    raise exception 'invalid_duration';
  end if;

  v_end_time := p_start_time + make_interval(mins => p_duration_minutes);
  v_weekday := extract(dow from p_date)::int;

  select exists (
    select 1 from opening_hours
    where weekday = v_weekday
      and open_time <= p_start_time
      and close_time >= v_end_time
  ) into v_is_open;

  if not v_is_open then
    raise exception 'outside_opening_hours';
  end if;

  if (p_date + p_start_time)::timestamp < (now() at time zone 'Europe/Berlin') then
    raise exception 'in_the_past';
  end if;

  for v_table in
    select * from restaurant_tables
    where is_active and capacity >= p_party_size
    order by capacity asc, name asc
  loop
    begin
      insert into table_reservations (
        table_id, reservation_date, start_time, end_time, party_size,
        guest_name, guest_phone, guest_email, note
      ) values (
        v_table.id, p_date, p_start_time, v_end_time, p_party_size,
        p_guest_name, p_guest_phone, p_guest_email, p_note
      )
      returning * into v_result;

      return v_result;
    exception when exclusion_violation then
      -- Dieser Tisch ist im Zeitraum schon belegt, nächsten probieren.
      continue;
    end;
  end loop;

  raise exception 'no_table_available';
end;
$$;

grant execute on function create_table_reservation(
  date, time, int, int, text, text, text, text
) to anon, authenticated;
