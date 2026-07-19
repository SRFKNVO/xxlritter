import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../assets';

const dishes = [
  {
    title: 'Die Ritterplatte',
    subtitle: 'Das Flaggschiff',
    description: 'Gigantische Auswahl aus Fleisch, Beilagen und mittelalterlichen Spezialitäten – eine epische Herausforderung für jeden Tafelritter.',
    price: 'ab 28,90 €',
    badge: 'XXL LEGENDE',
    img: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    tag: 'Bestseller',
  },
  {
    title: 'XXL Schnitzel',
    subtitle: '800g Wiener Art',
    description: 'Ein monumentales Schnitzel, das den Teller sprengt – paniert nach geheimer Ritterrezeptur mit hausgemachten Kartoffeln.',
    price: 'ab 22,90 €',
    badge: 'GIGANT',
    img: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    tag: 'Klassiker',
  },
  {
    title: 'König Burger',
    subtitle: 'Doppelter Burgturm',
    description: 'Zwei saftige Patties mit Bacon, Cheddar und geheimem Ritterdressing – ein Turmbau, der Maßstäbe setzt.',
    price: 'ab 19,90 €',
    badge: 'TURM',
    img: 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    tag: 'Favorit',
  },
  {
    title: 'Ritter Steak',
    subtitle: 'T-Bone Royale',
    description: 'Ein edles T-Bone nach Wahl des Königs – gereift, perfekt gegrillt, mit Kräuterbutter und Pfeffersauce.',
    price: 'ab 34,90 €',
    badge: 'PREMIUM',
    img: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    tag: 'Premium',
  },
];

function DishCard({ dish, index }: { dish: typeof dishes[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
      className="group relative"
    >
      <div
        className="relative overflow-hidden transition-all duration-500 hover:shadow-gold"
        style={{
          background: 'linear-gradient(160deg, #F5EDD8 0%, #EDE0C4 40%, #E8D5B0 100%)',
          boxShadow: '0 4px 24px rgba(20,10,0,0.45), inset 0 1px 0 rgba(255,220,120,0.3)',
          border: '2px solid rgba(120,70,20,0.55)',
        }}
      >
        {/* Inner sheen */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(200,130,42,0.25), inset 0 0 16px rgba(80,40,10,0.10)' }}
        />

        {/* Gold rivets */}
        {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} z-20 w-3 h-3 rounded-full pointer-events-none`}
            style={{
              background: 'radial-gradient(circle at 35% 35%, #D4A840, #8A5818)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,100,0.4)',
            }}
          />
        ))}

        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={dish.img}
            alt={dish.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A1008]/80 via-[#2A1008]/20 to-transparent" />

          <div className="absolute top-3 right-3 z-10">
            <span
              className="font-cinzel text-[9px] tracking-[0.2em] px-3 py-1.5 font-bold"
              style={{
                fontFamily: 'Cinzel, serif',
                background: 'linear-gradient(135deg, #C8822A 0%, #F0A850 50%, #8A5818 100%)',
                color: '#1B1005',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,230,120,0.4)',
              }}
            >
              {dish.badge}
            </span>
          </div>

          <div className="absolute top-3 left-3 z-10">
            <span
              className="flex items-center gap-1 font-inter text-[10px] tracking-widest uppercase px-2 py-1"
              style={{
                color: '#F0A850',
                background: 'rgba(20,8,0,0.75)',
                border: '1px solid rgba(200,130,42,0.4)',
              }}
            >
              <Flame size={10} />
              {dish.tag}
            </span>
          </div>
        </div>

        {/* Parchment content */}
        <div className="p-5 relative">
          <div
            className="absolute top-0 left-4 right-4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(120,70,20,0.4), transparent)' }}
          />
          <span className="font-inter text-[10px] tracking-widest uppercase block mb-1" style={{ color: '#8A5818' }}>
            {dish.subtitle}
          </span>
          <h3 className="font-cinzel font-bold text-lg mb-2" style={{ fontFamily: 'Cinzel, serif', color: '#2A1408' }}>
            {dish.title}
          </h3>
          <p className="font-inter text-sm leading-relaxed mb-5" style={{ color: '#5A3A1A' }}>
            {dish.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-cinzel font-bold text-lg" style={{ fontFamily: 'Cinzel, serif', color: '#8A5818' }}>
              {dish.price}
            </span>
            <Link
              to="/kontakt"
              className="font-cinzel text-[10px] tracking-widest uppercase px-4 py-2 transition-all duration-300 hover:opacity-90"
              style={{
                fontFamily: 'Cinzel, serif',
                background: 'linear-gradient(135deg, #1B4A28, #245E33)',
                color: '#F0A850',
                border: '1px solid rgba(200,130,42,0.4)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              Bestellen
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Speisekarte() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      id="speisekarte"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ paddingTop: '7rem', paddingBottom: '7rem' }}
    >
      {/* ── Photo background with parallax ── */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY, scale: 1.1 }}>
        <img
          src={ASSETS.restaurant2}
          alt="XXL Ritter Gaststube"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* ── Dark overlay – keeps cards readable, lets warm wood tones glow through ── */}
      <div className="absolute inset-0 z-0" style={{ background: 'rgba(15, 7, 2, 0.76)' }} />

      {/* ── Warm torch-glow at center ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(150,70,8,0.22) 0%, transparent 65%)' }}
      />

      {/* ── Subtle wood-grain texture ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            180deg,
            transparent 0px, transparent 22px,
            rgba(255,180,60,0.07) 22px, rgba(255,180,60,0.07) 23px
          )`,
        }}
      />

      {/* ── Metal side strips ── */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[3px] z-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(200,130,42,0.6) 0%, rgba(90,50,10,0.8) 50%, rgba(200,130,42,0.6) 100%)' }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-[3px] z-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(200,130,42,0.6) 0%, rgba(90,50,10,0.8) 50%, rgba(200,130,42,0.6) 100%)' }}
      />

      {/* ── Corner rivet ornaments ── */}
      {['top-5 left-5', 'top-5 right-5', 'bottom-5 left-5', 'bottom-5 right-5'].map((pos) => (
        <svg key={pos} className={`absolute ${pos} w-14 h-14 opacity-[0.22] pointer-events-none z-0`} viewBox="0 0 56 56" fill="none">
          <rect x="0.75" y="0.75" width="54.5" height="54.5" stroke="#C8822A" strokeWidth="1.5" />
          <line x1="0" y1="28" x2="56" y2="28" stroke="#C8822A" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="28" y1="0" x2="28" y2="56" stroke="#C8822A" strokeWidth="0.75" strokeDasharray="3 3" />
          <circle cx="28" cy="28" r="5.5" stroke="#C8822A" strokeWidth="1.25" fill="none" />
          <circle cx="28" cy="28" r="2" fill="#C8822A" opacity="0.9" />
        </svg>
      ))}

      {/* ── TOP fade – blends seamlessly into section above (meadow green) ── */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-20"
        style={{ height: '140px', background: 'linear-gradient(to bottom, #E8F5E8 0%, rgba(232,245,232,0.55) 45%, transparent 100%)' }}
      />

      {/* ── BOTTOM fade – blends into footer (forest dark) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{ height: '160px', background: 'linear-gradient(to top, #1B4A28 0%, rgba(27,74,40,0.65) 45%, transparent 100%)' }}
      />

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="divider-gold w-20" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Die Tafelrunde
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-parchment mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            XXL <span className="text-gradient-gold">Spezialitäten</span>
          </h2>
          <p className="font-inter text-parchment-dark/65 max-w-2xl mx-auto text-lg leading-relaxed">
            Gigantische Portionen, die Legenden erschaffen. Jedes Gericht ist eine Huldigung
            an den unstillbaren Hunger der Ritter von einst.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish, i) => (
            <DishCard key={dish.title} dish={dish} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14"
        >
          <Link
            to="/speisekarte"
            className="inline-flex items-center gap-3 font-cinzel text-sm tracking-[0.2em] uppercase px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <Flame size={16} className="animate-flicker" />
            Zur vollständigen Speisekarte
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
