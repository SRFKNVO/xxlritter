import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { BedDouble, Calendar, CheckCircle, Coffee, Loader2, Send, AlertCircle, Wifi } from 'lucide-react';
import {
  createRoomBooking,
  fetchRooms,
  findAvailableRooms,
  publicImageUrl,
  reservationErrorMessage,
} from '../lib/reservations';
import type { Room } from '../types/reservations';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function Hotel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', email: '', breakfast: false, note: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceCode, setReferenceCode] = useState('');

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    setLoading(true);
    setSearched(true);
    setSelectedRoom(null);
    try {
      const available = await findAvailableRooms(checkIn, checkOut);
      setRooms(available);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setStatus('submitting');
    try {
      const booking = await createRoomBooking({
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guestName: form.name,
        guestPhone: form.phone,
        guestEmail: form.email || undefined,
        breakfast: form.breakfast,
        note: form.note || undefined,
      });
      setReferenceCode(booking.reference_code);
      setStatus('success');
    } catch (err) {
      setErrorMessage(reservationErrorMessage(err));
      setStatus('error');
    }
  };

  return (
    <section id="hotel" className="section-padding bg-meadow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="divider-gold w-20" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Verfügbarkeit prüfen
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2 className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-forest mb-6" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
            Das <span className="text-gradient-gold">Landhotel</span>
          </h2>
          <p className="font-inter text-forest-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Übernachte wie ein König – Zimmer wählen, Zeitraum prüfen, sofort buchen.
          </p>
        </motion.div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto border border-gold/30 bg-obsidian-light rounded-sm p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-gold" />
            </div>
            <h3 className="font-cinzel_deco font-bold text-3xl text-white mb-4" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
              Buchung bestätigt!
            </h3>
            <p className="font-inter text-stone-lighter/70 max-w-md mx-auto mb-2">
              Vielen Dank, <strong className="text-gold">{form.name}</strong>! Dein Zimmer „{selectedRoom?.name}" ist vom {checkIn} bis {checkOut} reserviert.
            </p>
            <p className="font-inter text-stone-lighter/60 text-sm">
              Referenznummer: <strong className="text-gold/80">{referenceCode}</strong>
            </p>
          </motion.div>
        ) : selectedRoom ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="relative rounded-sm border border-gold/25 bg-obsidian-light overflow-hidden shadow-card">
              <div className="h-0.5 bg-gold-gradient" />
              <form onSubmit={handleSubmit} className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-cinzel font-bold text-xl text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                    {selectedRoom.name} · {checkIn} – {checkOut}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(null)}
                    className="font-inter text-xs text-gold/70 hover:text-gold underline"
                  >
                    Zimmer wechseln
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm hover:border-gold/40"
                      placeholder="Dein vollständiger Name"
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Telefon *
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm hover:border-gold/40"
                      placeholder="+49 ..."
                    />
                  </div>
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      E-Mail
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm hover:border-gold/40"
                      placeholder="deine@email.de"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 font-inter text-sm text-stone-lighter/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.breakfast}
                        onChange={(e) => setForm((f) => ({ ...f, breakfast: e.target.checked }))}
                        className="w-4 h-4 accent-gold"
                      />
                      <Coffee size={15} className="text-gold/70" />
                      Frühstück dazubuchen
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Besondere Wünsche
                    </label>
                    <textarea
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      rows={3}
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm hover:border-gold/40 resize-none"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="mt-6 flex items-start gap-3 border border-ember/40 bg-ember/10 rounded-sm p-4">
                    <AlertCircle size={18} className="text-ember-glow flex-shrink-0 mt-0.5" />
                    <p className="font-inter text-sm text-ember-glow">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-8 w-full group inline-flex items-center justify-center gap-3 font-cinzel text-sm tracking-[0.15em] uppercase px-10 py-4 bg-gold text-obsidian font-bold hover:bg-gold-light transition-all duration-300 disabled:opacity-60"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  <Send size={16} />
                  {status === 'submitting' ? 'Wird gesendet...' : 'Jetzt buchen'}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Search form */}
            <motion.form
              onSubmit={handleCheckAvailability}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="max-w-3xl mx-auto mb-14 glass-light rounded-sm p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label className="block font-inter text-xs tracking-widest text-gold/70 uppercase mb-2">
                  <Calendar size={12} className="inline mr-1" /> Anreise
                </label>
                <input
                  type="date"
                  required
                  min={todayISO()}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-white border border-forest/20 text-forest px-3 py-2.5 font-inter text-sm rounded-sm"
                />
              </div>
              <div>
                <label className="block font-inter text-xs tracking-widest text-gold/70 uppercase mb-2">
                  <Calendar size={12} className="inline mr-1" /> Abreise
                </label>
                <input
                  type="date"
                  required
                  min={checkIn || tomorrowISO()}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-white border border-forest/20 text-forest px-3 py-2.5 font-inter text-sm rounded-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 font-cinzel text-xs tracking-widest uppercase px-6 py-3 bg-obsidian text-parchment hover:bg-obsidian-mid transition-colors rounded-sm"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Verfügbarkeit prüfen
              </button>
            </motion.form>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-gold" />
              </div>
            ) : (
              <>
                {searched && rooms.length === 0 && (
                  <p className="text-center font-inter text-forest-muted mb-10">
                    Für diesen Zeitraum ist leider kein Zimmer mehr frei. Bitte probiere andere Daten.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {rooms.map((room, i) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.7 }}
                      className="group relative overflow-hidden rounded-sm border border-gold/15 hover:border-gold/35 bg-white shadow-card hover:shadow-gold transition-all duration-500"
                    >
                      <div className="relative h-56 overflow-hidden bg-obsidian">
                        {room.image_url ? (
                          <img
                            src={publicImageUrl(room.image_url)}
                            alt={room.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BedDouble size={40} className="text-gold/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-light via-obsidian/30 to-transparent" />
                      </div>

                      <div className="p-7">
                        <h3 className="font-cinzel font-bold text-xl text-forest mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                          {room.name}
                        </h3>
                        <p className="font-inter text-sm text-forest-muted leading-relaxed mb-5">
                          {room.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="flex items-center gap-1.5 font-inter text-[11px] text-gold/70 bg-gold/8 px-2.5 py-1 rounded-sm border border-gold/15">
                            <Wifi size={12} /> WLAN
                          </span>
                          <span className="flex items-center gap-1.5 font-inter text-[11px] text-gold/70 bg-gold/8 px-2.5 py-1 rounded-sm border border-gold/15">
                            <Coffee size={12} /> Frühstück optional
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {room.price_per_night ? (
                              <>
                                <span className="font-cinzel text-gold font-bold text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
                                  {room.price_per_night} €
                                </span>
                                <span className="font-inter text-xs text-forest-muted ml-1">/ Nacht</span>
                              </>
                            ) : (
                              <span className="font-inter text-xs text-forest-muted">Preis auf Anfrage</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (!checkIn || !checkOut) return;
                              setSelectedRoom(room);
                            }}
                            disabled={!checkIn || !checkOut}
                            title={!checkIn || !checkOut ? 'Bitte zuerst Anreise/Abreise wählen' : undefined}
                            className="font-cinzel text-xs tracking-wider uppercase px-5 py-2.5 border border-gold/50 text-gold hover:bg-gold/10 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Cinzel, serif' }}
                          >
                            Buchen
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 glass-light rounded-sm p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Check-in', value: 'Ab 15:00 Uhr' },
            { label: 'Check-out', value: 'Bis 11:00 Uhr' },
            { label: 'Frühstück', value: 'auf Wunsch zubuchbar' },
            { label: 'Parken', value: 'Kostenlos' },
          ].map((info) => (
            <div key={info.label} className="text-center">
              <p className="font-inter text-xs tracking-widest text-gold/60 uppercase mb-1">{info.label}</p>
              <p className="font-cinzel text-forest font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                {info.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
