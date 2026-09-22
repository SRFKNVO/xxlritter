import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Lock, Plus, X } from 'lucide-react';
import {
  blockRoomDates,
  createRoom,
  fetchRoomBookings,
  fetchRooms,
  publicImageUrl,
  updateRoom,
  uploadPublicImage,
} from '../../lib/reservations';
import { resizeImageFile } from '../../lib/image';
import { supabaseConfigured } from '../../lib/supabase';
import type { Room, RoomBooking } from '../../types/reservations';

const SOURCE_LABEL: Record<string, string> = {
  website: 'Website',
  booking_com: 'Booking.com',
  blocked: 'Gesperrt',
};

const SOURCE_STYLE: Record<string, string> = {
  website: 'bg-emerald-500',
  booking_com: 'bg-blue-500',
  blocked: 'bg-gray-400',
};

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

export default function ZimmerkalenderPage() {
  const [tab, setTab] = useState<'kalender' | 'verwalten'>('kalender');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState<{ start: string; end: string; note: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchRooms(), fetchRoomBookings()])
      .then(([r, b]) => {
        setRooms(r);
        setBookings(b);
        setSelectedRoomId((prev) => prev || r[0]?.id || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.room_id === selectedRoomId && b.status !== 'storniert'),
    [bookings, selectedRoomId]
  );

  const bookingForDay = (iso: string) =>
    roomBookings.find((b) => b.check_in <= iso && iso < b.check_out);

  const days = useMemo(() => {
    const first = new Date(month);
    const startWeekday = (first.getDay() + 6) % 7; // Montag = 0
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array(startWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return cells;
  }, [month]);

  const selectedBooking = selectedDay ? bookingForDay(selectedDay) : null;

  const handleDayClick = (date: Date) => {
    const iso = toISO(date);
    const booking = bookingForDay(iso);
    if (booking) {
      setSelectedDay(iso);
      setBlockForm(null);
    } else {
      setSelectedDay(null);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      setBlockForm({ start: iso, end: toISO(end), note: '' });
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm || !selectedRoomId) return;
    setSaving(true);
    try {
      await blockRoomDates(selectedRoomId, blockForm.start, blockForm.end, blockForm.note || undefined);
      setBlockForm(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cinzel font-bold text-2xl text-forest" style={{ fontFamily: 'Cinzel, serif' }}>
            Zimmerkalender
          </h1>
          <p className="font-inter text-sm text-forest-muted mt-1">
            Website-, Booking.com- und gesperrte Tage auf einen Blick.
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-sm p-1">
          <button
            onClick={() => setTab('kalender')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'kalender' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => setTab('verwalten')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'verwalten' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Zimmer verwalten
          </button>
        </div>
      </div>

      {!supabaseConfigured && (
        <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-xs text-amber-800">
            Supabase ist noch nicht verbunden — diese Ansicht zeigt erst Daten, sobald das Projekt eingerichtet ist.
          </p>
        </div>
      )}

      {loading ? (
        <p className="font-inter text-sm text-forest-muted">Lädt...</p>
      ) : tab === 'verwalten' ? (
        <ZimmerVerwalten rooms={rooms} onChanged={load} />
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRoomId(r.id);
                  setSelectedDay(null);
                  setBlockForm(null);
                }}
                className={`px-4 py-2 rounded-sm text-sm font-inter transition-colors ${
                  selectedRoomId === r.id ? 'bg-forest text-white' : 'bg-gray-100 text-forest-muted hover:bg-gray-200'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="p-2 rounded-sm hover:bg-gray-100 text-forest-muted"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-cinzel text-sm font-bold text-forest capitalize" style={{ fontFamily: 'Cinzel, serif' }}>
              {monthLabel(month)}
            </span>
            <button
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="p-2 rounded-sm hover:bg-gray-100 text-forest-muted"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-4 mb-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
                <div key={d} className="text-center text-xs font-inter text-forest-muted uppercase">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                if (!date) return <div key={i} />;
                const iso = toISO(date);
                const booking = bookingForDay(iso);
                return (
                  <button
                    key={iso}
                    onClick={() => handleDayClick(date)}
                    className={`relative h-16 rounded-sm border text-left p-1.5 text-xs font-inter transition-colors ${
                      booking ? 'border-transparent text-white' : 'border-gray-200 hover:border-forest/40 text-forest'
                    } ${booking ? SOURCE_STYLE[booking.source] : 'bg-white'}`}
                  >
                    <span className="block font-semibold">{date.getDate()}</span>
                    {booking && <span className="block text-[10px] opacity-90 truncate">{SOURCE_LABEL[booking.source]}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 mb-8 text-xs font-inter text-forest-muted">
            {Object.entries(SOURCE_LABEL).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${SOURCE_STYLE[key]}`} />
                {label}
              </span>
            ))}
          </div>

          {selectedBooking && (
            <div className="bg-white border border-gray-200 rounded-sm p-5 max-w-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-cinzel text-sm font-bold text-forest" style={{ fontFamily: 'Cinzel, serif' }}>
                  {SOURCE_LABEL[selectedBooking.source]}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="text-forest-muted hover:text-forest">
                  <X size={16} />
                </button>
              </div>
              <p className="font-inter text-sm text-forest">
                {selectedBooking.check_in} – {selectedBooking.check_out}
              </p>
              {selectedBooking.guest_name && (
                <p className="font-inter text-sm text-forest mt-1">{selectedBooking.guest_name}</p>
              )}
              {selectedBooking.guest_phone && (
                <p className="font-inter text-xs text-forest-muted mt-0.5">{selectedBooking.guest_phone}</p>
              )}
              {selectedBooking.note && (
                <p className="font-inter text-xs text-forest-muted mt-2 italic">„{selectedBooking.note}"</p>
              )}
            </div>
          )}

          {blockForm && (
            <form onSubmit={handleBlockSubmit} className="bg-white border border-gray-200 rounded-sm p-5 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={15} className="text-forest-muted" />
                <h3 className="font-cinzel text-sm font-bold text-forest" style={{ fontFamily: 'Cinzel, serif' }}>
                  Zeitraum sperren
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-inter text-forest-muted mb-1">Von</label>
                  <input
                    type="date"
                    value={blockForm.start}
                    onChange={(e) => setBlockForm((f) => (f ? { ...f, start: e.target.value } : f))}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-inter text-forest-muted mb-1">Bis</label>
                  <input
                    type="date"
                    value={blockForm.end}
                    onChange={(e) => setBlockForm((f) => (f ? { ...f, end: e.target.value } : f))}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
                  />
                </div>
              </div>
              <input
                placeholder="Notiz (z. B. Renovierung)"
                value={blockForm.note}
                onChange={(e) => setBlockForm((f) => (f ? { ...f, note: e.target.value } : f))}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest mb-4"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-forest text-white text-sm font-inter px-4 py-2 rounded-sm hover:bg-forest-mid transition-colors disabled:opacity-60"
                >
                  {saving ? 'Sperre...' : 'Sperren'}
                </button>
                <button
                  type="button"
                  onClick={() => setBlockForm(null)}
                  className="text-sm font-inter text-forest-muted px-4 py-2"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function ZimmerVerwalten({ rooms, onChanged }: { rooms: Room[]; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createRoom({
        name: name.trim(),
        description: description.trim() || null,
        price_per_night: price ? Number(price) : null,
        image_url: null,
      });
      setName('');
      setDescription('');
      setPrice('');
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (room: Room) => {
    await updateRoom(room.id, { is_active: !room.is_active });
    onChanged();
  };

  const handleFieldBlur = async (room: Room, field: 'name' | 'description', value: string) => {
    if (value === (room[field] || '')) return;
    await updateRoom(room.id, { [field]: value || null });
    onChanged();
  };

  const handlePriceBlur = async (room: Room, value: string) => {
    const num = value ? Number(value) : null;
    if (num === room.price_per_night) return;
    await updateRoom(room.id, { price_per_night: num });
    onChanged();
  };

  const handleImageUpload = async (room: Room, file: File) => {
    setUploadingId(room.id);
    try {
      const resized = await resizeImageFile(file);
      const path = await uploadPublicImage(resized, 'rooms');
      await updateRoom(room.id, { image_url: path });
      onChanged();
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100 mb-6">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-4 px-4 py-3">
            <label className="relative w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0">
              {room.image_url ? (
                <img src={publicImageUrl(room.image_url)} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus size={18} className="text-gray-400" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(room, file);
                }}
              />
              {uploadingId === room.id && (
                <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-inter text-forest-muted">
                  ...
                </span>
              )}
            </label>
            <input
              defaultValue={room.name}
              onBlur={(e) => handleFieldBlur(room, 'name', e.target.value)}
              className="font-inter text-sm text-forest bg-transparent border-b border-transparent hover:border-gray-300 focus:border-forest outline-none px-1 py-0.5 w-32"
            />
            <input
              defaultValue={room.description || ''}
              onBlur={(e) => handleFieldBlur(room, 'description', e.target.value)}
              placeholder="Beschreibung"
              className="font-inter text-xs text-forest-muted bg-transparent border-b border-transparent hover:border-gray-300 focus:border-forest outline-none px-1 py-0.5 flex-1"
            />
            <label className="flex items-center gap-2 text-xs font-inter text-forest-muted">
              €/Nacht
              <input
                type="number"
                min={0}
                defaultValue={room.price_per_night ?? ''}
                onBlur={(e) => handlePriceBlur(room, e.target.value)}
                className="w-20 border border-gray-200 rounded-sm px-2 py-1 text-forest"
              />
            </label>
            <button
              onClick={() => handleToggleActive(room)}
              className={`text-xs font-inter uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ${
                room.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {room.is_active ? 'Aktiv' : 'Deaktiviert'}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-sm border border-gray-200 p-4 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Neues Zimmer – Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Suite"
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Beschreibung</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div>
          <label className="block text-xs font-inter text-forest-muted mb-1">€/Nacht</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-24 border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-forest text-white text-sm font-inter px-4 py-2 rounded-sm hover:bg-forest-mid transition-colors disabled:opacity-60"
        >
          <Plus size={15} />
          Hinzufügen
        </button>
      </form>
    </div>
  );
}
