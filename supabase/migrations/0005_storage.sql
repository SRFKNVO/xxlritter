-- Phase 2: Storage-Bucket für Zimmer- und Aktionsbilder.
--
-- Muss NACH dem Storage-Service-Deploy laufen (storage-api legt beim ersten
-- Start das `storage`-Schema inkl. storage.buckets/storage.objects selbst
-- an). Ein Bucket für beide Bild-Arten, Pfad-Präfix unterscheidet
-- (rooms/... bzw. promotions/...) — Größenlimit und erlaubte Formate sind
-- zusätzlich serverseitig in storage.buckets gesetzt (nicht nur im
-- Frontend), Upload-Rechte ausschließlich für Mitarbeiter.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-images',
  'public-images',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "public_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-images');

create policy "public_images_staff_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-images');

create policy "public_images_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-images')
  with check (bucket_id = 'public-images');

create policy "public_images_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-images');
