import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BedDouble, Wifi, Coffee, Bath, Mountain, Star } from 'lucide-react';
import { ASSETS } from '../assets';

const rooms = [
  {
    title: 'Ritter-Zimmer',
    subtitle: 'Standard',
    description: 'Gemütliches Zimmer mit rustikalem Schwarzwald-Flair, modernem Bad und herrlichem Blick ins Grüne.',
    price: 'ab 89 €',
    img: ASSETS.hotel,
    amenities: ['Kostenloses WLAN', 'Frühstück inklusive', 'Private Dusche'],
    badge: 'Standard',
  },
  {
    title: 'Königs-Suite',
    subtitle: 'Premium',
    description: 'Großzügige Suite mit separatem Wohnbereich, Boxspringbett und exklusivem Badezimmer im Ritterstil.',
    price: 'ab 149 €',
    img: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    amenities: ['Himmelbett', 'Luxusbad', 'Panoramablick', 'Minibar'],
    badge: 'Beliebt',
    featured: true,
  },
  {
    title: 'Burggrafenzimmer',
    subtitle: 'Deluxe',
    description: 'Weitläufiges Deluxe-Zimmer mit rustikalem Eichenholzmobiliar, Kaminatmosphäre und Baldachinbett.',
    price: 'ab 119 €',
    img: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    amenities: ['Kaminatmosphäre', 'Baldachinbett', 'Terrasse'],
    badge: 'Deluxe',
  },
];

const amenityIcons: Record<string, React.ReactNode> = {
  'Kostenloses WLAN': <Wifi size={12} />,
  'Frühstück inklusive': <Coffee size={12} />,
  'Private Dusche': <Bath size={12} />,
  'Himmelbett': <BedDouble size={12} />,
  'Luxusbad': <Bath size={12} />,
  'Panoramablick': <Mountain size={12} />,
  'Minibar': <Coffee size={12} />,
  'Kaminatmosphäre': <Star size={12} />,
  'Baldachinbett': <BedDouble size={12} />,
  'Terrasse': <Mountain size={12} />,
};

export default function Hotel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="hotel" className="section-padding bg-meadow relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Subtle bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/3 blur-3xl" />
      </div>

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
              Ritterliche Unterkunft
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-forest mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Das <span className="text-gradient-gold">Landhotel</span>
          </h2>
          <p className="font-inter text-forest-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Übernachte wie ein König – in Zimmern, die mittelalterliche Grandeur mit
            modernem Komfort vereinen. Jede Nacht ein Abenteuer.
          </p>
        </motion.div>

        {/* Room cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room, i) => (
            <motion.div
              key={room.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className={`group relative overflow-hidden rounded-sm card-tilt ${
                room.featured ? 'ring-1 ring-gold/60' : 'border border-gold/15 hover:border-gold/35'
              } bg-white shadow-card hover:shadow-gold transition-all duration-500`}
            >
              {/* Featured badge */}
              {room.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient z-10" />
              )}

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={room.img}
                  alt={room.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  style={{ transition: 'transform 0.7s ease' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-light via-obsidian/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`font-cinzel text-[10px] tracking-[0.2em] px-3 py-1 font-bold ${
                      room.featured
                        ? 'bg-gold text-obsidian'
                        : 'bg-obsidian/80 text-gold border border-gold/40 backdrop-blur-sm'
                    }`}
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {room.badge}
                  </span>
                </div>

                {/* Stars */}
                <div className="absolute bottom-4 left-4 flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className="text-gold fill-gold animate-star-pulse"
                      style={{ animationDelay: `${s * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-7">
                <p className="font-inter text-xs tracking-widest text-gold/70 uppercase mb-1">
                  {room.subtitle}
                </p>
                <h3
                  className="font-cinzel font-bold text-xl text-forest mb-3"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {room.title}
                </h3>
                <p className="font-inter text-sm text-forest-muted leading-relaxed mb-5">
                  {room.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.amenities.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 font-inter text-[11px] text-gold/70 bg-gold/8 px-2.5 py-1 rounded-sm border border-gold/15"
                    >
                      {amenityIcons[a]}
                      {a}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="font-cinzel text-gold font-bold text-xl"
                      style={{ fontFamily: 'Cinzel, serif' }}
                    >
                      {room.price}
                    </span>
                    <span className="font-inter text-xs text-forest-muted ml-1">/ Nacht</span>
                  </div>
                  <a
                    href="#reservierung"
                    className={`font-cinzel text-xs tracking-wider uppercase px-5 py-2.5 transition-all duration-300 ${
                      room.featured
                        ? 'bg-gold text-obsidian hover:bg-gold-light'
                        : 'border border-gold/50 text-gold hover:bg-gold/10'
                    }`}
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    Buchen
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
            { label: 'Frühstück', value: '07:00 – 10:30 Uhr' },
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
