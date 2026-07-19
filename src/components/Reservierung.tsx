import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Clock, Users, ChevronDown, CheckCircle, Send } from 'lucide-react';

const occasions = [
  'Tischreservierung',
  'Hotelzimmer',
  'Hochzeitsfeier',
  'Geburtstagsfeier',
  'Firmenveranstaltung',
  'Ritterabend',
  'Gruppenreservierung',
  'Sonstiges',
];

const timeSlots = [
  '11:30', '12:00', '12:30', '13:00', '13:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

export default function Reservierung() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    occasion: 'Tischreservierung',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="reservierung" className="section-padding bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
          alt="Restaurant"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-obsidian/90" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
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
            Sichere deinen Platz im Königreich. Wir freuen uns auf deinen Besuch
            und bestätigen deine Reservierung so schnell wie möglich.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {!submitted ? (
            <div className="relative rounded-sm border border-gold/25 bg-obsidian-light overflow-hidden shadow-card">
              {/* Top gold line */}
              <div className="h-0.5 bg-gold-gradient" />

              <form onSubmit={handleSubmit} className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
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

                  {/* Email */}
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="deine@email.de"
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+49 ..."
                      className="w-full bg-obsidian border border-steel text-white placeholder-stone-lighter/40 px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      <Calendar size={12} className="inline mr-2" />
                      Datum *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={form.date}
                      onChange={handleChange}
                      className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 [color-scheme:dark]"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      <Clock size={12} className="inline mr-2" />
                      Uhrzeit *
                    </label>
                    <div className="relative">
                      <select
                        name="time"
                        required
                        value={form.time}
                        onChange={handleChange}
                        className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 appearance-none cursor-pointer"
                      >
                        <option value="">Uhrzeit wählen</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t} Uhr</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  {/* Guests */}
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
                        {[1, 2, 3, 4, 5, 6, 7, 8, '9-15', '16-30', '31-50', '50+'].map((n) => (
                          <option key={n} value={n}>{n} {typeof n === 'string' ? 'Personen' : n === 1 ? 'Person' : 'Personen'}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label className="block font-cinzel text-xs tracking-[0.2em] uppercase text-gold/80 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      Anlass
                    </label>
                    <div className="relative">
                      <select
                        name="occasion"
                        value={form.occasion}
                        onChange={handleChange}
                        className="w-full bg-obsidian border border-steel text-white px-4 py-3 font-inter text-sm rounded-sm transition-all duration-300 hover:border-gold/40 appearance-none cursor-pointer"
                      >
                        {occasions.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
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

                {/* Submit */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="font-inter text-xs text-stone-lighter/50 text-center sm:text-left">
                    * Pflichtfelder · Wir antworten innerhalb von 24 Stunden
                  </p>
                  <button
                    type="submit"
                    className="group flex-shrink-0 inline-flex items-center gap-3 font-cinzel text-sm tracking-[0.15em] uppercase px-10 py-4 bg-gold text-obsidian font-bold hover:bg-gold-light transition-all duration-300 hover:shadow-gold-lg"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    <Send size={16} className="transition-transform group-hover:translate-x-1" />
                    Reservierung absenden
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
                Reservation erhalten!
              </h3>
              <p className="font-inter text-stone-lighter/70 max-w-md mx-auto mb-2">
                Vielen Dank, <strong className="text-gold">{form.name}</strong>! Deine Anfrage wurde entgegengenommen.
              </p>
              <p className="font-inter text-stone-lighter/60 text-sm">
                Wir bestätigen deine Reservierung per E-Mail an <strong className="text-gold/80">{form.email}</strong>.
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
