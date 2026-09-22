-- Booking.com liefert im iCal-Export aus Datenschutzgründen keine
-- Gästenamen (nur "Reserviert"/"Nicht verfügbar" o. ä.) — die Pflicht für
-- guest_name gilt deshalb nur noch für echte Website-Direktbuchungen.

alter table room_bookings
  drop constraint room_bookings_guest_name_required_unless_blocked;

alter table room_bookings
  add constraint room_bookings_guest_name_required_for_website
  check (source <> 'website' or guest_name is not null);
