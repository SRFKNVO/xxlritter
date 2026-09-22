import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Navigation as NavIcon, MessageCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import Reservierung from '../components/Reservierung';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Adresse',
    lines: ['Glaserstraße 2', '78052 Villingen-Schwenningen', 'Deutschland'],
  },
  {
    icon: Phone,
    title: 'Telefon',
    lines: ['07721 23686'],
    href: 'tel:+49772123686',
  },
  {
    icon: Mail,
    title: 'E-Mail',
    lines: ['info@xxlritter.de'],
    href: 'mailto:info@xxlritter.de',
  },
  {
    icon: Clock,
    title: 'Öffnungszeiten',
    lines: ['Montag: Ruhetag', 'Di – Sa: 17:00 – 22:00 Uhr', 'So: 11:00–14:00, 17:00–21:00 Uhr'],
  },
];

const MAPS_EMBED = 'https://maps.google.com/maps?q=Glaserstra%C3%9Fe+2+78052+Villingen-Schwenningen&output=embed&z=14';
const MAPS_NAVIGATE = 'https://maps.google.com/maps/dir//Glaserstra%C3%9Fe+2,+78052+Villingen-Schwenningen,+Deutschland';
const WHATSAPP = `https://wa.me/49772123686?text=${encodeURIComponent('Hallo Ritter XXL! Ich möchte gerne einen Tisch reservieren.')}`;

export default function KontaktPage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div>
      <PageHero
        title="Kontakt & Anfahrt"
        subtitle="So findest du uns"
        description="Wir freuen uns auf deinen Besuch – hier findest du alle Informationen zur Anfahrt und Kontaktaufnahme."
      />

      <section ref={ref} className="section-padding bg-meadow">
        <div className="max-w-7xl mx-auto">

          {/* Contact info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {contactInfo.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="card-meadow rounded-sm p-6"
              >
                <div className="w-10 h-10 rounded-sm bg-obsidian flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-gold" />
                </div>
                <h3 className="font-cinzel font-bold text-forest text-sm tracking-widest uppercase mb-3"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  {item.title}
                </h3>
                {item.lines.map((line, j) => (
                  item.href && j === 0 ? (
                    <a key={j} href={item.href}
                      className="block font-inter text-sm text-gold hover:text-gold-light transition-colors">
                      {line}
                    </a>
                  ) : (
                    <p key={j} className="font-inter text-sm text-forest-muted leading-relaxed">
                      {line}
                    </p>
                  )
                ))}
              </motion.div>
            ))}
          </div>

          {/* Map + Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Google Maps embed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="divider-gold w-10" />
                <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  Standort
                </span>
              </div>
              <h2 className="font-cinzel_deco font-bold text-2xl md:text-3xl text-forest mb-5"
                style={{ fontFamily: '"Cinzel Decorative", serif' }}>
                Uns <span className="text-gradient-gold">finden</span>
              </h2>

              {/* Map iframe */}
              <div className="relative w-full rounded-sm overflow-hidden shadow-forest"
                style={{ paddingBottom: '60%' }}>
                <iframe
                  src={MAPS_EMBED}
                  title="XXL Ritter Restaurant – Google Maps Standort"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="flex flex-col justify-center gap-5"
            >
              <div className="card-meadow rounded-sm p-6">
                <h3 className="font-cinzel font-bold text-forest text-sm tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  Direkt navigieren
                </h3>
                <p className="font-inter text-sm text-forest-muted leading-relaxed mb-5">
                  Öffne Google Maps und lass dich direkt zum Ritter XXL navigieren.
                </p>
                <a
                  href={MAPS_NAVIGATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center justify-center gap-3 px-5 py-3 bg-obsidian text-parchment font-cinzel text-sm tracking-widest uppercase hover:bg-obsidian-mid transition-all duration-300 rounded-sm"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  <NavIcon size={16} className="text-gold" />
                  <span>Route starten</span>
                </a>
              </div>

              <div className="card-meadow rounded-sm p-6">
                <h3 className="font-cinzel font-bold text-forest text-sm tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  WhatsApp
                </h3>
                <p className="font-inter text-sm text-forest-muted leading-relaxed mb-5">
                  Schreib uns direkt auf WhatsApp – schnell, unkompliziert, persönlich.
                </p>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-5 py-3 text-white font-cinzel text-sm tracking-widest uppercase transition-all duration-300 rounded-sm hover:opacity-90"
                  style={{ background: '#25D366', fontFamily: 'Cinzel, serif' }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp öffnen</span>
                </a>
              </div>

              <div className="card-meadow rounded-sm p-6">
                <h3 className="font-cinzel font-bold text-forest text-sm tracking-widest uppercase mb-2"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  Parken
                </h3>
                <p className="font-inter text-sm text-forest-muted leading-relaxed">
                  Kostenlose Parkplätze direkt am Restaurant vorhanden.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reservation form below map */}
      <Reservierung />
    </div>
  );
}
