import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  fetchChannelSettings,
  fetchFacebookCache,
  fetchRooms,
  requestChannelSync,
  updateChannelIcalUrl,
} from '../../lib/reservations';
import { supabaseConfigured } from '../../lib/supabase';
import type { ChannelSettings, FacebookCache, Room } from '../../types/reservations';

export default function KanaelePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [settings, setSettings] = useState<ChannelSettings[]>([]);
  const [facebook, setFacebook] = useState<FacebookCache | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchRooms(), fetchChannelSettings(), fetchFacebookCache()])
      .then(([r, s, f]) => {
        setRooms(r);
        setSettings(s);
        setFacebook(f);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const settingsForRoom = (roomId: string) => settings.find((s) => s.room_id === roomId);

  const handleUrlBlur = async (roomId: string, value: string) => {
    const current = settingsForRoom(roomId)?.booking_com_ical_url || '';
    if (value === current) return;
    await updateChannelIcalUrl(roomId, value);
    load();
  };

  const handleSync = async (roomId: string) => {
    await requestChannelSync(roomId);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="font-cinzel font-bold text-2xl text-forest mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
        Kanäle
      </h1>
      <p className="font-inter text-sm text-forest-muted mb-6">Booking.com-Synchronisation und Facebook-Vorschau.</p>

      {!supabaseConfigured && (
        <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm p-4">
          <p className="font-inter text-xs text-amber-800">
            Supabase ist noch nicht verbunden — diese Ansicht zeigt erst Daten, sobald das Projekt eingerichtet ist.
          </p>
        </div>
      )}

      {loading ? (
        <p className="font-inter text-sm text-forest-muted">Lädt...</p>
      ) : (
        <>
          <h2 className="font-cinzel text-xs tracking-widest uppercase text-forest-muted mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Booking.com (iCal)
          </h2>
          <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100 mb-8">
            {rooms.map((room) => {
              const s = settingsForRoom(room.id);
              return (
                <div key={room.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-inter text-sm font-medium text-forest">{room.name}</p>
                    <button
                      onClick={() => handleSync(room.id)}
                      disabled={!s?.booking_com_ical_url}
                      className="flex items-center gap-1.5 text-xs font-inter uppercase tracking-wide px-3 py-1.5 rounded-full bg-forest text-white hover:bg-forest-mid disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={12} />
                      Jetzt synchronisieren
                    </button>
                  </div>
                  <input
                    defaultValue={s?.booking_com_ical_url || ''}
                    onBlur={(e) => handleUrlBlur(room.id, e.target.value)}
                    placeholder="Booking.com Export-iCal-URL einfügen"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-xs font-inter text-forest mb-2"
                  />
                  <div className="flex items-center gap-4 text-xs font-inter text-forest-muted">
                    <span>
                      Letzter Sync:{' '}
                      {s?.last_synced_at ? new Date(s.last_synced_at).toLocaleString('de-DE') : 'noch nie'}
                    </span>
                    {s?.last_sync_status && (
                      <span className={s.last_sync_status === 'ok' ? 'text-emerald-700' : 'text-red-600'}>
                        {s.last_sync_status === 'ok'
                          ? `${s.last_imported_count ?? 0} Buchungen importiert`
                          : `Fehler: ${s.last_sync_error}`}
                      </span>
                    )}
                    {s?.sync_requested_at &&
                      (!s.last_synced_at || s.sync_requested_at > s.last_synced_at) && (
                        <span className="text-amber-700">Sync angefordert, läuft in Kürze...</span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="font-cinzel text-xs tracking-widest uppercase text-forest-muted mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            Facebook-Vorschau
          </h2>
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            {facebook?.post_id ? (
              <div className="flex gap-4">
                {facebook.picture_url && (
                  <img src={facebook.picture_url} alt="" className="w-20 h-20 rounded-sm object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-inter text-sm text-forest">{facebook.message || '(ohne Text)'}</p>
                  <p className="font-inter text-xs text-forest-muted mt-1">
                    Abgerufen: {new Date(facebook.fetched_at).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-inter text-xs text-forest-muted">
                Noch kein Facebook-Post abgerufen — Page-Access-Token auf der VPS einrichten (siehe README).
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
