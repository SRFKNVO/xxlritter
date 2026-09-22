export type ReservationStatus = 'neu' | 'bestätigt' | 'erledigt' | 'storniert';

export interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface TableReservation {
  id: string;
  table_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  note: string | null;
  status: ReservationStatus;
  reference_code: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  price_per_night: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export type RoomBookingSource = 'website' | 'booking_com' | 'blocked';

export interface RoomBooking {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  breakfast: boolean;
  note: string | null;
  status: ReservationStatus;
  reference_code: string;
  source: RoomBookingSource;
  external_uid: string | null;
  created_at: string;
}

export interface OpeningHoursRange {
  id: string;
  weekday: number;
  open_time: string;
  close_time: string;
}

export interface TableDurationSettings {
  min_minutes: number;
  max_minutes: number;
  step_minutes: number;
  default_minutes: number;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  is_published: boolean;
  carousel_slot: 1 | 2 | 3 | null;
  created_at: string;
  published_at: string | null;
}

export interface ChannelSettings {
  id: string;
  room_id: string;
  booking_com_ical_url: string | null;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  last_imported_count: number | null;
  sync_requested_at: string | null;
  created_at: string;
}

export interface FacebookCache {
  id: boolean;
  post_id: string | null;
  message: string | null;
  permalink_url: string | null;
  picture_url: string | null;
  posted_at: string | null;
  fetched_at: string;
}
