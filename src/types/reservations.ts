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

export interface RoomBooking {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  breakfast: boolean;
  note: string | null;
  status: ReservationStatus;
  reference_code: string;
  source: string;
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
