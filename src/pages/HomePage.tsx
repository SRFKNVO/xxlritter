import Hero from '../components/Hero';
import Bewertungen from '../components/Bewertungen';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Utensils, BedDouble, PartyPopper, Images, Phone, ChevronRight } from 'lucide-react';
import { ASSETS } from '../assets';

const sections = [
  {
    icon: Utensils,
    title: 'Speisekarte',
    subtitle: 'XXL-Gerichte',
    description: 'Gigantische Portionen, regionale Spezialitäten und legendäre Ritterplatten.',
    href: '/speisekarte',
    color: 'from-obsidian to-obsidian-mid',
  },
  {
    icon: BedDouble,
    title: 'Landhotel',
    subtitle: 'Übernachten',
    description: 'Komfortables Landhotel mit rustikalem Flair mitten im Schwarzwald.',
    href: '/hotel',
    color: 'from-obsidian-light to-obsidian',
  },
  {
    icon: PartyPopper,
    title: 'Events',
    subtitle: 'Feiern & Erleben',
    description: 'Ritterbankette, Hochzeiten und unvergessliche Firmenfeiern.',
    href: '/events',
    color: 'from-obsidian to-obsidian-mid',
  },
  {
    icon: Images,
    title: 'Galerie',
    subtitle: 'Einblicke',
    description: 'Bilder aus dem Restaurant, dem Hotel und unvergesslichen Momenten.',
    href: '/galerie',
    color: 'from-obsidian-light to-obsidian',
  },
  {
    icon: Phone,
    title: 'Kontakt',
    subtitle: 'Anfahrt & Reservierung',
    description: 'So findest du uns – mit Google Maps und direkter Reservierungsanfrage.',
    href: '/kontakt',
    color: 'from-obsidian to-obsidian-mid',
  },
];

export default function HomePage() {
  return (
    <div>
      <Hero />

      {/* Section navigation cards */}
      <section className="section-padding bg-meadow" aria-label="Bereiche">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="divider-gold w-16" />
              <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase"
                style={{ fontFamily: 'Cinzel, serif' }}>
                Entdecke
              </span>
              <div className="divider-gold w-16" />
            </div>
            <h2
              className="font-cinzel_deco font-bold text-3xl md:text-5xl text-forest mb-4"
              style={{ fontFamily: '"Cinzel Decorative", serif' }}
            >
              Das <span className="text-gradient-gold">Ritter XXL</span>
            </h2>
            <p className="text-forest-muted max-w-xl mx-auto font-inter leading-relaxed">
              Restaurant, Hotel, Events und mehr – alles unter einem Dach im Herzen des Schwarzwalds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((s, i) => (
              <motion.div
                key={s.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={s.href}
                  className="group flex flex-col h-full card-meadow rounded-sm p-7 overflow-hidden relative"
                >
                  {/* Decorative corner */}
                  <span className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="w-12 h-12 rounded-sm bg-obsidian flex items-center justify-center mb-5 group-hover:bg-gold transition-colors duration-300">
                    <s.icon size={22} className="text-gold group-hover:text-obsidian transition-colors duration-300" />
                  </div>

                  <span className="font-cinzel text-gold text-[10px] tracking-[0.3em] uppercase mb-1"
                    style={{ fontFamily: 'Cinzel, serif' }}>
                    {s.subtitle}
                  </span>
                  <h3 className="font-cinzel_deco font-bold text-xl text-forest mb-3"
                    style={{ fontFamily: '"Cinzel Decorative", serif' }}>
                    {s.title}
                  </h3>
                  <p className="text-forest-muted font-inter text-sm leading-relaxed flex-1">
                    {s.description}
                  </p>
                  <div className="flex items-center gap-2 mt-5 text-gold font-cinzel text-xs tracking-widest uppercase font-semibold"
                    style={{ fontFamily: 'Cinzel, serif' }}>
                    <span>Entdecken</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interior atmosphere photo section */}
      <section className="relative overflow-hidden" style={{ height: '70vh', minHeight: '420px' }}>
        <motion.div
          initial={{ scale: 1.06 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={ASSETS.restaurantInterior}
            alt="XXL Ritter Restaurant – gemütliche Atmosphäre mit Lichterketten"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/30 to-meadow/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-meadow/50 via-transparent to-transparent" />
        </motion.div>

        {/* Centered quote */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="text-center px-6 max-w-2xl"
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="divider-gold w-14" />
              <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase"
                style={{ fontFamily: 'Cinzel, serif' }}>
                Das Erlebnis
              </span>
              <div className="divider-gold w-14" />
            </div>
            <p className="font-cinzel_deco text-2xl md:text-4xl text-parchment font-bold leading-tight mb-6"
              style={{ fontFamily: '"Cinzel Decorative", serif' }}>
              "Nicht nur essen –<br />
              <span className="text-gradient-gold">ein Abenteuer erleben"</span>
            </p>
            <Link
              to="/erlebnis"
              className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.25em] uppercase text-gold border-b border-gold/40 hover:border-gold transition-colors pb-0.5"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Mehr entdecken
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* Bottom fade to page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
          style={{ height: '120px', background: 'linear-gradient(to bottom, transparent, #E8F5E8)' }}
        />
      </section>

      {/* Bewertungen on homepage */}
      <Bewertungen />
    </div>
  );
}
