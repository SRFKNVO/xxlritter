import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, CheckCircle, Send, AlertCircle } from 'lucide-react';
import {
  createTableReservation,
  fetchOpeningHours,
  fetchTableDurationSettings,
  reservationErrorMessage,
} from '../lib/reservations';
import { supabaseConfigured } from '../lib/supabase';
import type { OpeningHoursRange, TableDurationSettings } from '../types/reservations';

function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function Reservierung() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [openingHours, setOpeningHours] = useState<OpeningHoursRange[]>([]);
  const [durationSettings, setDurationSettings] = useState<TableDurationSettings | null>(null);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceCode, setReferenceCode] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    duration: '',
    message: '',
  });

  useEffect(() => {
    if (!supabaseConfigured) return;
    fetchOpeningHours().then(setOpeningHours).catch(() => setOpeningHours([]));
    fetchTableDurationSettings()
      .then((s) => {
        setDurationSettings(s);
        setForm((f) => ({ ...f, duration: String(s.default_minutes) }));
      })
      .catch(() => {});
  }, []);

  const durationOptions = useMemo(() => {
    if (!durationSettings) return [];
    const opts: number[] = [];
    for (let m = durationSettings.min_minutes; m <= durationSettings.max_minutes; m += durationSettings.step_minutes) {
      opts.push(m);
    }
    return opts;
  }, [durationSettings]);

  const timeSlots = useMemo(() => {
    if (!form.date || !durationSettings) return [];
    const weekday = weekdayOf(form.date);
    const ranges = openingHours.filter((r) => r.weekday === weekday);
    const minDuration = Number(form.duration) || durationSettings.min_minutes;
    const slots: string[] = [];
    for (const range of ranges) {
      const start = timeToMinutes(range.open_time);
      const end = timeToMinutes(range.close_time) - minDuration;
      for (let m = start; m <= end; m += 30) {
        slots.push(minutesToTime(m));
      }
    }
    return slots;
  }, [form.date, form.duration, openingHours, durationSettings]);

  const isClosedDay = form.date && openingHours.every((r) => r.weekday !== weekdayOf(form.date));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value, ...(name === 'date' ? { time: '' } : {}) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.time) return;
    setStatus('submitting');
    try {
      const reservation = await createTableReservation({
        date: form.date,
        startTime: form.time,
        durationMinutes: Number(form.duration),
        partySize: Number(form.guests),
        guestName: form.name,
        guestPhone: form.phone,
        guestEmail: form.email || undefined,
        note: form.message || undefined,
      });
      setReferenceCode(reservation.reference_code);
      setStatus('success');
    } catch (err) {
      setErrorMessage(reservationErrorMessage(err));
      setStatus('error');
    }
  };

  return (
    <section id="reservierung" className="section-padding bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
          alt="Restaurant"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-obsidian/90" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
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
              Dein Platz am Tisch
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Jetzt <span className="text-gradient-gold">Reservieren</span>
          </h2>
          <p className="font-inter text-stone-lighter/70 max-w-xl mx-auto text-lg leading-relaxed">
            Sichere deinen Platz im Königreich. Deine Reservierung wird sofort bestätigt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {status !== 'success' ? (
            <div className="relative rounded-sm border border-gold/25 bg-obsidian-light overflow-hidden shadow-card">
              <div className="h-0.5 bg-gold-gradient" />

              {!supabaseConfigured && (
                <div className="mx-8 md:mx-12 mt-8 border border-gold/30 bg-gold/10 rounded-sm p-4">
                  <p className="font-inter text-xs text-gold/90">
                    Die Online-Reservierung ist technisch fertig, aber noch nicht mit einer Datenbank
                    verbunden (Supabase-Projekt fehlt). Sobald das Projekt verbunden ist, läuft dieses
                    Formular live.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Dein vollständiger Name"
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40"
                    />
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+49 ..."
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40"
                    />
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      E-Mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="deine@email.de"
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40"
                    />
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      <Calendar size={12} className="inline mr-2" />
                      Datum *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.date}
                      onChange={handleChange}
                      className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 [color-scheme:dark]"
                    />
                    {isClosedDay ? (
                      <p className="mt-2 font-inter text-xs text-ember-glow">Montag ist Ruhetag – bitte einen anderen Tag wählen.</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      <Clock size={12} className="inline mr-2" />
                      Uhrzeit *
                    </label>
                    <div className="relative">
                      <select
                        name="time"
                        required
                        disabled={!form.date || timeSlots.length === 0}
                        value={form.time}
                        onChange={handleChange}
                        className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">{form.date ? 'Uhrzeit wählen' : 'Erst Datum wählen'}</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t} Uhr</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      <Users size={12} className="inline mr-2" />
                      Personen *
                    </label>
                    <div className="relative">
                      <select
                        name="guests"
                        value={form.guests}
                        onChange={handleChange}
                        className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'Personen'}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Dauer
                    </label>
                    <div className="relative">
                      <select
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 appearance-none cursor-pointer"
                      >
                        {durationOptions.map((m) => (
                          <option key={m} value={m}>{m} Minuten</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Besondere Wünsche
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Allergien, Sitzplatzwünsche, Sonderanfragen..."
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 resize-none"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="mt-6 flex items-start gap-3 border border-ember/40 bg-ember/10 rounded-sm p-4">
                    <AlertCircle size={18} className="text-ember-glow flex-shrink-0 mt-0.5" />
                    <p className="font-inter text-sm text-ember-glow">{errorMessage}</p>
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="font-inter text-xs text-stone-lighter/50 text-center sm:text-left">
                    * Pflichtfelder · Deine Reservierung wird sofort bestätigt
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group flex-shrink-0 inline-flex items-center gap-3 font-cinzel text-sm tracking-[0.15em] uppercase px-10 py-4 bg-gold text-obsidian font-bold hover:bg-gold-light transition-all duration-300 hover:shadow-gold-lg disabled:opacity-60"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    <Send size={16} className="transition-transform group-hover:translate-x-1" />
                    {status === 'submitting' ? 'Wird gesendet...' : 'Reservierung absenden'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-gold/30 bg-obsidian-light rounded-sm p-12 text-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <CheckCircle size={36} className="text-gold" />
              </div>
              <h3
                className="font-cinzel_deco font-bold text-3xl text-white mb-4"
                style={{ fontFamily: '"Cinzel Decorative", serif' }}
              >
                Reservierung bestätigt!
              </h3>
              <p className="font-inter text-stone-lighter/70 max-w-md mx-auto mb-2">
                Vielen Dank, <strong className="text-gold">{form.name}</strong>! Dein Tisch am {form.date} um {form.time} Uhr ist reserviert.
              </p>
              <p className="font-inter text-stone-lighter/60 text-sm">
                Referenznummer: <strong className="text-gold/80">{referenceCode}</strong>
              </p>
              <div className="mt-8 divider-gold" />
              <p
                className="mt-6 font-cinzel text-gold/70 text-sm tracking-widest"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Möge das Mahl glorreich sein.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
