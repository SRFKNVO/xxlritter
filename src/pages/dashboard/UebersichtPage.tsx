import { useEffect, useState } from 'react';
import { fetchRoomBookings } from '../../lib/reservations';
import { supabaseConfigured } from '../../lib/supabase';
import type { ReservationStatus, RoomBooking } from '../../types/reservations';

const COLUMNS: { status: ReservationStatus; label: string }[] = [
  { status: 'neu', label: 'Neu' },
  { status: 'bestätigt', label: 'Bestätigt' },
  { status: 'erledigt', label: 'Erledigt' },
];

export default function UebersichtPage() {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    fetchRoomBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-cinzel font-bold text-2xl text-forest mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
        Übersicht
      </h1>
      <p className="font-inter text-sm text-forest-muted mb-8">Zimmerbuchungen auf einen Blick.</p>

      {!supabaseConfigured && (
        <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-xs text-amber-800">
            Supabase ist noch nicht verbunden — diese Ansicht zeigt erst Daten, sobald das Projekt
            eingerichtet ist (siehe README).
          </p>
        </div>
      )}

      {loading ? (
        <p className="font-inter text-sm text-forest-muted">Lädt...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const items = bookings.filter((b) => b.status === col.status);
            return (
              <div key={col.status} className="bg-white rounded-sm border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-cinzel text-xs tracking-widest uppercase text-forest font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                    {col.label}
                  </h2>
                  <span className="text-xs font-inter text-forest-muted bg-gray-100 rounded-full px-2 py-0.5">
                    {items.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {items.length === 0 && (
                    <p className="font-inter text-xs text-forest-muted/60 py-6 text-center">Keine Buchungen</p>
                  )}
                  {items.map((b) => (
                    <div key={b.id} className="border border-gray-200 rounded-sm p-3">
                      <p className="font-inter text-sm text-forest font-medium">{b.guest_name}</p>
                      <p className="font-inter text-xs text-forest-muted mt-0.5">
                        {b.check_in} – {b.check_out}
                      </p>
                      <p className="font-inter text-xs text-forest-muted/70 mt-0.5">Ref. {b.reference_code}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="font-inter text-xs text-forest-muted/60 mt-8">
        Zimmerbuchung über die Website folgt in einer späteren Ausbaustufe — diese Ansicht ist bereits
        vollständig an die Datenbank angebunden und füllt sich automatisch, sobald Buchungen eingehen.
      </p>
    </div>
  );
}
