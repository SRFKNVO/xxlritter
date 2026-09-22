-- Phase 2: Zimmerbuchung fertigstellen + Speisekarte/Aktionen-Grundlage.
-- Knüpft an die Muster aus 0001/0002 an: Overlap-Schutz per Exclusion-
-- Constraint, öffentlicher Zugriff ausschließlich über SECURITY DEFINER-
-- Funktionen, nie über direkte Tabellen-Grants für Gästedaten.

-- ─── Zimmerbuchungen: manuelle Sperrungen & Booking.com-Importe erlauben ──
-- Sperrungen (Renovierung etc.) haben keinen Gast — kein Fantasie-Gast nötig.

alter table room_bookings alter column guest_name drop not null;

alter table room_bookings
  add constraint room_bookings_guest_name_required_unless_blocked
  check (source = 'blocked' or guest_name is not null);

alter table room_bookings
  add constraint room_bookings_source_check
  check (source in ('website', 'booking_com', 'blocked'));

-- Für Booking.com-Importe: eindeutige externe ID pro Zimmer, damit ein
-- erneuter iCal-Sync dieselbe Buchung nicht doppelt anlegt.
alter table room_bookings add column external_uid text;

create unique index room_bookings_external_uid_unique
  on room_bookings (room_id, external_uid)
  where external_uid is not null;

-- ─── RPC: freie Zimmer im Zeitraum finden (öffentlich, ohne Gästedaten) ──

create or replace function find_available_rooms(p_check_in date, p_check_out date)
returns setof rooms
language sql
security definer
set search_path = public
stable
as $$
  select r.*
  from rooms r
  where r.is_active
    and p_check_out > p_check_in
    and not exists (
      select 1 from room_bookings b
      where b.room_id = r.id
        and b.status <> 'storniert'
        and daterange(b.check_in, b.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
    )
  order by r.price_per_night nulls last, r.name;
$$;

grant execute on function find_available_rooms(date, date) to anon, authenticated;

-- ─── RPC: Zimmerbuchung anlegen (analog create_table_reservation) ───────

create or replace function create_room_booking(
  p_room_id uuid,
  p_check_in date,
  p_check_out date,
  p_guest_name text,
  p_guest_phone text,
  p_guest_email text default null,
  p_breakfast boolean default false,
  p_note text default null
) returns room_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result room_bookings;
begin
  if p_guest_name is null or btrim(p_guest_name) = '' then
    raise exception 'guest_name_required';
  end if;
  if p_guest_phone is null or btrim(p_guest_phone) = '' then
    raise exception 'guest_phone_required';
  end if;
  if p_check_out is null or p_check_in is null or p_check_out <= p_check_in then
    raise exception 'invalid_date_range';
  end if;
  if p_check_in < current_date then
    raise exception 'in_the_past';
  end if;
  if not exists (select 1 from rooms where id = p_room_id and is_active) then
    raise exception 'room_not_available';
  end if;

  begin
    insert into room_bookings (
      room_id, check_in, check_out, guest_name, guest_phone, guest_email,
      breakfast, note, source
    ) values (
      p_room_id, p_check_in, p_check_out, p_guest_name, p_guest_phone,
      p_guest_email, coalesce(p_breakfast, false), p_note, 'website'
    )
    returning * into v_result;
  exception when exclusion_violation then
    raise exception 'room_not_available';
  end;

  return v_result;
end;
$$;

grant execute on function create_room_booking(uuid, date, date, text, text, text, boolean, text) to anon, authenticated;

-- ─── Speisekarte ─────────────────────────────────────────────────────────

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table menu_items enable row level security;

create policy "menu_items_public_read_active" on menu_items
  for select to anon using (is_active);

create policy "staff_all_menu_items" on menu_items
  for all to authenticated using (true) with check (true);

-- ─── Aktionen / Karussell ────────────────────────────────────────────────
-- carousel_slot 1..3 = aktiv im öffentlichen Karussell. Der Unique-Index
-- erzwingt technisch, dass ein Slot immer nur eine veröffentlichte Aktion
-- gleichzeitig belegt — ein zweiter Versuch auf denselben Slot schlägt
-- fehl, statt die bestehende Aktion still zu ersetzen. Das UI muss den
-- Mitarbeiter aktiv einen Slot wählen/freigeben lassen (siehe README).

create table promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_path text,
  is_published boolean not null default false,
  carousel_slot smallint check (carousel_slot between 1 and 3),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create unique index promotions_carousel_slot_unique
  on promotions (carousel_slot)
  where is_published and carousel_slot is not null;

alter table promotions enable row level security;

create policy "promotions_public_read_carousel" on promotions
  for select to anon using (is_published and carousel_slot is not null);

create policy "staff_all_promotions" on promotions
  for all to authenticated using (true) with check (true);
