import { supabase } from './supabase';
import type {
  OpeningHoursRange,
  ReservationStatus,
  RestaurantTable,
  RoomBooking,
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
