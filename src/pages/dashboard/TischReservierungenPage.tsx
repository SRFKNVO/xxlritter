import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import {
  createRestaurantTable,
  fetchRestaurantTables,
  fetchTableReservations,
  updateRestaurantTable,
  updateTableReservationStatus,
} from '../../lib/reservations';
import { supabaseConfigured } from '../../lib/supabase';
import type { ReservationStatus, RestaurantTable, TableReservation } from '../../types/reservations';

type Filter = 'heute' | 'woche' | 'alle';

const STATUS_OPTIONS: ReservationStatus[] = ['neu', 'bestätigt', 'erledigt', 'storniert'];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  neu: 'bg-amber-100 text-amber-800',
  bestätigt: 'bg-emerald-100 text-emerald-800',
  erledigt: 'bg-gray-100 text-gray-600',
  storniert: 'bg-red-100 text-red-700',
};

function isSameWeek(dateStr: string, today: Date): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

export default function TischReservierungenPage() {
  const [tab, setTab] = useState<'reservierungen' | 'tische'>('reservierungen');
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filter, setFilter] = useState<Filter>('heute');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchTableReservations(), fetchRestaurantTables()])
      .then(([r, t]) => {
        setReservations(r);
        setTables(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const tableById = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);

  const overlapWarningIds = useMemo(() => {
    const flagged = new Set<string>();
    const byTable = new Map<string, TableReservation[]>();
    for (const r of reservations) {
      if (r.status === 'storniert') continue;
      const list = byTable.get(r.table_id) || [];
      list.push(r);
      byTable.set(r.table_id, list);
    }
    for (const list of byTable.values()) {
      const sameDay = new Map<string, TableReservation[]>();
      for (const r of list) {
        const day = sameDay.get(r.reservation_date) || [];
        day.push(r);
        sameDay.set(r.reservation_date, day);
      }
      for (const day of sameDay.values()) {
        day.sort((a, b) => a.start_time.localeCompare(b.start_time));
        for (let i = 1; i < day.length; i++) {
          if (day[i].start_time < day[i - 1].end_time) {
            flagged.add(day[i].id);
            flagged.add(day[i - 1].id);
          }
        }
      }
    }
    return flagged;
  }, [reservations]);

  const filtered = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    return reservations.filter((r) => {
      if (filter === 'heute') return r.reservation_date === todayStr;
      if (filter === 'woche') return isSameWeek(r.reservation_date, today);
      return true;
    });
  }, [reservations, filter]);

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateTableReservationStatus(id, status);
    } catch {
      load();
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-cinzel font-bold text-2xl text-forest" style={{ fontFamily: 'Cinzel, serif' }}>
            Tisch Reservierungen
          </h1>
        </div>
        <div className="flex gap-2 bg-gray-100 rounded-sm p-1">
          <button
            onClick={() => setTab('reservierungen')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'reservierungen' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Reservierungen
          </button>
          <button
            onClick={() => setTab('tische')}
            className={`px-4 py-1.5 rounded-sm text-sm font-inter transition-colors ${
              tab === 'tische' ? 'bg-white text-forest shadow-sm' : 'text-forest-muted'
            }`}
          >
            Tische verwalten
          </button>
        </div>
      </div>

      {!supabaseConfigured && (
        <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-xs text-amber-800">
            Supabase ist noch nicht verbunden — diese Ansicht zeigt erst Daten, sobald das Projekt
            eingerichtet ist (siehe README).
          </p>
        </div>
      )}

      {tab === 'reservierungen' ? (
        <>
          <div className="flex gap-2 mb-5">
            {(['heute', 'woche', 'alle'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-inter uppercase tracking-wide transition-colors ${
                  filter === f ? 'bg-forest text-white' : 'bg-gray-100 text-forest-muted hover:bg-gray-200'
                }`}
              >
                {f === 'heute' ? 'Heute' : f === 'woche' ? 'Diese Woche' : 'Alle'}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="font-inter text-sm text-forest-muted">Lädt...</p>
          ) : filtered.length === 0 ? (
            <p className="font-inter text-sm text-forest-muted">Keine Reservierungen in diesem Zeitraum.</p>
          ) : (
            <>
              {/* Mobile: Kartenliste statt Tabelle */}
              <div className="md:hidden space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} className="bg-white rounded-sm border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-inter text-sm font-semibold text-forest">
                          {r.reservation_date} · {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}
                        </p>
                        <p className="font-inter text-xs text-forest-muted mt-0.5">
                          {tableById.get(r.table_id)?.name || '—'} · {r.party_size} Personen
                          {overlapWarningIds.has(r.id) && (
                            <span title="Zeitliche Überschneidung an diesem Tisch prüfen" className="inline-flex ml-1.5 align-middle">
                              <AlertTriangle size={13} className="text-amber-600" />
                            </span>
                          )}
                        </p>
                      </div>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as ReservationStatus)}
                        className={`text-xs font-inter rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer flex-shrink-0 ${STATUS_STYLES[r.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="font-inter text-sm text-forest">{r.guest_name}</p>
                    <p className="font-inter text-xs text-forest-muted">{r.guest_phone}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: Tabelle */}
              <div className="hidden md:block bg-white rounded-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm font-inter">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-forest-muted text-xs uppercase tracking-wide">
                      <th className="px-4 py-3">Datum</th>
                      <th className="px-4 py-3">Uhrzeit</th>
                      <th className="px-4 py-3">Tisch</th>
                      <th className="px-4 py-3">Personen</th>
                      <th className="px-4 py-3">Gast</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-forest">{r.reservation_date}</td>
                        <td className="px-4 py-3 text-forest">
                          {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3 text-forest">
                          {tableById.get(r.table_id)?.name || '—'}
                          {overlapWarningIds.has(r.id) && (
                            <span title="Zeitliche Überschneidung an diesem Tisch prüfen" className="inline-flex ml-2 align-middle">
                              <AlertTriangle size={14} className="text-amber-600" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-forest">{r.party_size}</td>
                        <td className="px-4 py-3 text-forest">
                          <div>{r.guest_name}</div>
                          <div className="text-xs text-forest-muted">{r.guest_phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value as ReservationStatus)}
                            className={`text-xs font-inter rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer ${STATUS_STYLES[r.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <TischeVerwalten tables={tables} onChanged={load} />
      )}
    </div>
  );
}

function TischeVerwalten({ tables, onChanged }: { tables: RestaurantTable[]; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(6);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createRestaurantTable(name.trim(), capacity);
      setName('');
      setCapacity(6);
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (t: RestaurantTable) => {
    await updateRestaurantTable(t.id, { is_active: !t.is_active });
    onChanged();
  };

  const handleCapacityChange = async (t: RestaurantTable, value: number) => {
    await updateRestaurantTable(t.id, { capacity: value });
    onChanged();
  };

  const handleNameChange = async (t: RestaurantTable, value: string) => {
    await updateRestaurantTable(t.id, { name: value });
    onChanged();
  };

  return (
    <div>
      <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100 mb-6">
        {tables.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <input
              defaultValue={t.name}
              onBlur={(e) => e.target.value !== t.name && handleNameChange(t, e.target.value)}
              className="font-inter text-sm text-forest bg-transparent border-b border-transparent hover:border-gray-300 focus:border-forest outline-none px-1 py-0.5 flex-1 min-w-[120px]"
            />
            <label className="flex items-center gap-2 text-xs font-inter text-forest-muted">
              Kapazität
              <input
                type="number"
                min={1}
                defaultValue={t.capacity}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (v && v !== t.capacity) handleCapacityChange(t, v);
                }}
                className="w-16 border border-gray-200 rounded-sm px-2 py-1 text-forest"
              />
            </label>
            <button
              onClick={() => handleToggleActive(t)}
              className={`text-xs font-inter uppercase tracking-wide px-3 py-1.5 rounded-full transition-colors ${
                t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {t.is_active ? 'Aktiv' : 'Deaktiviert'}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-sm border border-gray-200 p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-inter text-forest-muted mb-1">Neuer Tisch – Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Tisch 5"
            className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
          />
        </div>
        <div>
          <label className="block text-xs font-inter text-forest-muted mb-1">Kapazität</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
            className="w-20 border border-gray-200 rounded-sm px-3 py-2 text-sm font-inter text-forest"
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
