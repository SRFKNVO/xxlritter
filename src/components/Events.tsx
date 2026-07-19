import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Heart, Briefcase, Crown, Swords, Users, ArrowRight } from 'lucide-react';

const events = [
  {
    icon: <Heart size={28} />,
    title: 'Hochzeiten',
    subtitle: 'Im Ritterstil',
    description: 'Erlebe deinen Hochzeitstag in einer märchenhaften Kulisse. Wir gestalten dein Fest zu einem Erlebnis, das Legenden schreibt.',
    highlights: ['Bis 200 Gäste', 'Komplettservice', 'Ritter-Zeremonie', 'Brautbankett'],
    img: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    color: 'from-rose-900/40',
  },
  {
    icon: <Swords size={28} />,
    title: 'Ritterabende',
    subtitle: 'Mittelalterspektakel',
    description: 'Authentische Ritterbankette mit Schwertkampf, Minnesang und mittelalterlichem Festmahl – ein unvergessliches Gruppenspektakel.',
    highlights: ['Schwertkampf', 'Minnesang', 'XXL-Bankett', 'Kostüme'],
    img: 'https://images.pexels.com/photos/1556706/pexels-photo-1556706.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    color: 'from-amber-900/40',
    featured: true,
  },
  {
    icon: <Briefcase size={28} />,
    title: 'Firmenfeiern',
    subtitle: 'Corporate Events',
    description: 'Außergewöhnliche Teamevents und Firmenfeiern, die Ihr Team zusammenschweißen – einmalig, motivierend, unvergesslich.',
    highlights: ['Teambuilding', 'Catering', 'AV-Technik', 'Beamer'],
    img: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    color: 'from-blue-900/30',
  },
  {
    icon: <Crown size={28} />,
    title: 'Geburtstage',
    subtitle: 'Königs-Feiern',
    description: 'Feiere deinen Geburtstag wie ein König. Von der intimen Runde bis zur großen Tafelrunde – wir machen jeden Anlass majestätisch.',
    highlights: ['Ab 10 Personen', 'Tortenservice', 'Dekoration', 'DJ möglich'],
    img: 'https://images.pexels.com/photos/796606/pexels-photo-796606.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    color: 'from-purple-900/30',
  },
];

export default function Events() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="events" className="section-padding relative overflow-hidden" style={{ background: '#0C1E10' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="divider-gold w-20" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Im Burgsaal
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Events & <span className="text-gradient-gold">Feiern</span>
          </h2>
          <p className="font-inter text-stone-lighter/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Jeder Anlass verdient einen epischen Rahmen. Unser Burgsaal ist die perfekte
            Bühne für Momente, die in Erinnerung bleiben.
          </p>
        </motion.div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className={`group relative overflow-hidden rounded-sm cursor-pointer ${
                event.featured ? 'ring-1 ring-gold/50' : 'border border-gold/15 hover:border-gold/35'
              } transition-all duration-500 hover:shadow-gold`}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${event.color} via-obsidian/80 to-obsidian/95`} />
              </div>

              {/* Featured top bar */}
              {event.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient z-10" />
              )}

              {/* Content */}
              <div className="relative z-10 p-8 md:p-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/40 text-gold bg-obsidian/60 backdrop-blur-sm">
                    {event.icon}
                  </div>
                  {event.featured && (
                    <span
                      className="font-cinzel text-[10px] tracking-[0.2em] px-3 py-1 bg-gold text-obsidian font-bold"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      BELIEBT
                    </span>
                  )}
                </div>

                <p className="font-inter text-xs tracking-widest text-gold/70 uppercase mb-1">
                  {event.subtitle}
                </p>
                <h3
                  className="font-cinzel font-bold text-2xl md:text-3xl text-white mb-4"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {event.title}
                </h3>
                <p className="font-inter text-sm text-stone-lighter/75 leading-relaxed mb-6 max-w-sm">
                  {event.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {event.highlights.map((h) => (
                    <span
                      key={h}
                      className="font-inter text-[11px] text-gold/80 bg-gold/10 px-3 py-1 rounded-sm border border-gold/20"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <a
                  href="#reservierung"
                  className="inline-flex items-center gap-2 font-cinzel text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-bright transition-colors duration-300 group/link"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  Anfrage senden
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 glass-dark rounded-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <Users size={18} className="text-gold" />
              <span
                className="font-cinzel font-bold text-xl text-white"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Individuelle Anfrage
              </span>
            </div>
            <p className="font-inter text-sm text-stone-lighter/70">
              Besondere Wünsche? Wir erstellen dir ein maßgeschneidertes Angebot für deine Veranstaltung.
            </p>
          </div>
          <a
            href="#reservierung"
            className="flex-shrink-0 font-cinzel text-sm tracking-[0.2em] uppercase px-8 py-4 bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors duration-300"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Angebot anfragen
          </a>
        </motion.div>
      </div>
    </section>
  );
}
