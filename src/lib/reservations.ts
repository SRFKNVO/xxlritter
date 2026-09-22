import { supabase } from './supabase';
import type {
  ChannelSettings,
  FacebookCache,
  MenuItem,
  OpeningHoursRange,
  Promotion,
  ReservationStatus,
  RestaurantTable,
  Room,
  RoomBooking,
  RoomBookingSource,
  TableDurationSettings,
  TableReservation,
} from '../types/reservations';

const RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  guest_name_required: 'Bitte gib deinen Namen an.',
  guest_phone_required: 'Bitte gib eine Telefonnummer an.',
  invalid_party_size: 'Bitte gib eine gültige Personenzahl an.',
  invalid_duration: 'Die gewählte Dauer ist ungültig.',
  outside_opening_hours: 'Zu dieser Zeit haben wir leider geschlossen.',
  in_the_past: 'Dieser Zeitpunkt liegt in der Vergangenheit.',
  no_table_available: 'Für diesen Zeitraum ist leider kein Tisch mehr frei. Bitte wähle eine andere Uhrzeit.',
  invalid_date_range: 'Bitte wähle einen gültigen Zeitraum (Abreise nach Anreise).',
  room_not_available: 'Dieses Zimmer ist im gewählten Zeitraum leider nicht mehr frei.',
};

export function reservationErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const key = Object.keys(RESERVATION_ERROR_MESSAGES).find((k) => raw.includes(k));
  return key ? RESERVATION_ERROR_MESSAGES[key] : 'Die Reservierung konnte nicht angelegt werden. Bitte versuch es erneut.';
}

export async function fetchOpeningHours(): Promise<OpeningHoursRange[]> {
  const { data, error } = await supabase.from('opening_hours').select('*').order('weekday');
  if (error) throw error;
  return data;
}

export async function fetchTableDurationSettings(): Promise<TableDurationSettings> {
  const { data, error } = await supabase
    .from('reservation_settings')
    .select('value')
    .eq('key', 'table_duration')
    .single();
  if (error) throw error;
  return data.value as TableDurationSettings;
}

export interface CreateTableReservationInput {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  partySize: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  note?: string;
}

export async function createTableReservation(
  input: CreateTableReservationInput
): Promise<TableReservation> {
  const { data, error } = await supabase.rpc('create_table_reservation', {
    p_date: input.date,
    p_start_time: input.startTime,
    p_duration_minutes: input.durationMinutes,
    p_party_size: input.partySize,
    p_guest_name: input.guestName,
    p_guest_phone: input.guestPhone,
    p_guest_email: input.guestEmail || null,
    p_note: input.note || null,
  });
  if (error) throw error;
  return data as TableReservation;
}

// ─── Staff / Dashboard ────────────────────────────────────────────────

export async function fetchTableReservations(): Promise<TableReservation[]> {
  const { data, error } = await supabase
    .from('table_reservations')
    .select('*')
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateTableReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<void> {
  const { error } = await supabase.from('table_reservations').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function fetchRestaurantTables(): Promise<RestaurantTable[]> {
  const { data, error } = await supabase.from('restaurant_tables').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createRestaurantTable(name: string, capacity: number): Promise<void> {
  const { error } = await supabase.from('restaurant_tables').insert({ name, capacity });
  if (error) throw error;
}

export async function updateRestaurantTable(
  id: string,
  updates: Partial<Pick<RestaurantTable, 'name' | 'capacity' | 'is_active'>>
): Promise<void> {
  const { error } = await supabase.from('restaurant_tables').update(updates).eq('id', id);
  if (error) throw error;
}

export async function fetchRoomBookings(): Promise<RoomBooking[]> {
  const { data, error } = await supabase
    .from('room_bookings')
    .select('*')
    .order('check_in', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateRoomBookingStatus(id: string, status: ReservationStatus): Promise<void> {
  const { error } = await supabase.from('room_bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function createRoom(
  input: Pick<Room, 'name' | 'description' | 'price_per_night' | 'image_url'>
): Promise<Room> {
  const { data, error } = await supabase.from('rooms').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateRoom(
  id: string,
  updates: Partial<Pick<Room, 'name' | 'description' | 'price_per_night' | 'image_url' | 'is_active'>>
): Promise<void> {
  const { error } = await supabase.from('rooms').update(updates).eq('id', id);
  if (error) throw error;
}

export async function blockRoomDates(
  roomId: string,
  checkIn: string,
  checkOut: string,
  note?: string
): Promise<void> {
  const { error } = await supabase.from('room_bookings').insert({
    room_id: roomId,
    check_in: checkIn,
    check_out: checkOut,
    source: 'blocked' as RoomBookingSource,
    note: note || null,
  });
  if (error) throw error;
}

// ─── Öffentliche Zimmerbuchung ──────────────────────────────────────────

export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase.from('rooms').select('*').order('price_per_night', { ascending: true });
  if (error) throw error;
  return data;
}

export async function findAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]> {
  const { data, error } = await supabase.rpc('find_available_rooms', {
    p_check_in: checkIn,
    p_check_out: checkOut,
  });
  if (error) throw error;
  return data as Room[];
}

export interface CreateRoomBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  breakfast?: boolean;
  note?: string;
}

export async function createRoomBooking(input: CreateRoomBookingInput): Promise<RoomBooking> {
  const { data, error } = await supabase.rpc('create_room_booking', {
    p_room_id: input.roomId,
    p_check_in: input.checkIn,
    p_check_out: input.checkOut,
    p_guest_name: input.guestName,
    p_guest_phone: input.guestPhone,
    p_guest_email: input.guestEmail || null,
    p_breakfast: input.breakfast || false,
    p_note: input.note || null,
  });
  if (error) throw error;
  return data as RoomBooking;
}

// ─── Speisekarte ─────────────────────────────────────────────────────────

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function createMenuItem(
  input: Pick<MenuItem, 'category' | 'name' | 'description' | 'price'>
): Promise<MenuItem> {
  const { data, error } = await supabase.from('menu_items').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateMenuItem(
  id: string,
  updates: Partial<Pick<MenuItem, 'category' | 'name' | 'description' | 'price' | 'is_active' | 'sort_order'>>
): Promise<void> {
  const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Aktionen / Karussell ────────────────────────────────────────────────

export async function fetchPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCarouselPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_published', true)
    .not('carousel_slot', 'is', null)
    .order('carousel_slot');
  if (error) throw error;
  return data;
}

export async function createPromotion(
  input: Pick<Promotion, 'title' | 'description' | 'image_path'>
): Promise<Promotion> {
  const { data, error } = await supabase.from('promotions').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Belegt einen Karussell-Slot (1-3). Der Unique-Constraint in der DB
 * verhindert, dass zwei veröffentlichte Aktionen denselben Slot belegen —
 * ist der Slot schon vergeben, muss die aufrufende Stelle vorher die alte
 * Aktion aus dem Slot nehmen (unpublishPromotion), nie automatisch/still.
 */
export async function publishPromotionToSlot(id: string, slot: 1 | 2 | 3): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .update({ is_published: true, carousel_slot: slot, published_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function unpublishPromotion(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .update({ is_published: false, carousel_slot: null })
    .eq('id', id);
  if (error) throw error;
}

export async function uploadPublicImage(file: File, folder: 'rooms' | 'promotions'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('public-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function publicImageUrl(path: string): string {
  return supabase.storage.from('public-images').getPublicUrl(path).data.publicUrl;
}

export async function deletePublicImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from('public-images').remove([path]);
  if (error) throw error;
}

// ─── Kanäle (Booking.com / Facebook) ─────────────────────────────────────

export async function fetchChannelSettings(): Promise<ChannelSettings[]> {
  const { data, error } = await supabase.from('channel_settings').select('*');
  if (error) throw error;
  return data;
}

export async function updateChannelIcalUrl(roomId: string, icalUrl: string): Promise<void> {
  const { error } = await supabase
    .from('channel_settings')
    .update({ booking_com_ical_url: icalUrl || null })
    .eq('room_id', roomId);
  if (error) throw error;
}

export async function requestChannelSync(roomId: string): Promise<void> {
  const { error } = await supabase
    .from('channel_settings')
    .update({ sync_requested_at: new Date().toISOString() })
    .eq('room_id', roomId);
  if (error) throw error;
}

export async function fetchFacebookCache(): Promise<FacebookCache | null> {
  const { data, error } = await supabase.from('facebook_cache').select('*').maybeSingle();
  if (error) throw error;
  return data;
}
