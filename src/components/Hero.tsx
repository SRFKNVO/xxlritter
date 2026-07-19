import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Utensils, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../assets';

// Page background color – must match meadow DEFAULT
const PAGE_BG = '#E8F5E8';

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const yLogo = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] flex items-center justify-center"
      style={{ overflow: 'visible' }}
      aria-label="Willkommensbereich"
    >
      {/* ─── Background layers ─── */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
        {/* Deep forest green base */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1B4A28 0%, #0F2E18 60%, #162814 100%)' }} />

        {/* Subtle warm glow at center */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, rgba(200,130,42,0.35) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-80 h-48 rounded-full opacity-20 blur-3xl"
            style={{ background: 'rgba(180,90,20,0.4)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-48 rounded-full opacity-15 blur-3xl"
            style={{ background: 'rgba(180,90,20,0.3)' }} />
        </div>
      </motion.div>

      {/* ─── Giant logo as decorative background ─── */}
      <motion.div
        style={{ y: yLogo }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <img
          src={ASSETS.logo}
          alt=""
          className="w-[55vh] md:w-[65vh] lg:w-[70vh] max-w-2xl h-auto select-none"
          style={{
            opacity: 0.10,
            filter: 'brightness(0) saturate(100%) invert(65%) sepia(70%) saturate(600%) hue-rotate(5deg) brightness(130%)',
            transform: 'translateY(4%)',
          }}
          draggable={false}
        />
      </motion.div>

      {/* Subtle grid texture overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(200,130,42,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(200,130,42,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent z-10" />

      {/* ─── Content ─── */}
      <motion.div style={{ opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Small logo above title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center mb-6"
        >
          <img
            src={ASSETS.logo}
            alt="Ritter XXL Logo"
            className="h-16 md:h-20 w-auto"
            style={{
              filter: 'brightness(0) saturate(100%) invert(65%) sepia(70%) saturate(600%) hue-rotate(5deg) brightness(120%)',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-7"
        >
          <div className="divider-gold w-16" />
          <span className="font-cinzel text-gold/90 text-xs tracking-[0.4em] uppercase"
            style={{ fontFamily: 'Cinzel, serif' }}>
            Seit 2003 · Herzogenweiler
          </span>
          <div className="divider-gold w-16" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
          className="font-cinzel_deco font-bold leading-tight mb-6"
          style={{ fontFamily: '"Cinzel Decorative", serif' }}
        >
          <span className="block text-4xl md:text-6xl lg:text-7xl text-parchment mb-2">
            Willkommen im
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl text-gradient-gold">
            Königreich
          </span>
          <span className="block text-3xl md:text-5xl lg:text-6xl text-parchment/90 mt-2">
            der XXL-Genüsse
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg md:text-xl text-parchment-dark/75 max-w-2xl mx-auto mb-12 font-inter leading-relaxed"
        >
          Erlebe rustikale Ritteratmosphäre, gigantische Portionen und unvergessliche Abende
          im Herzen des Schwarzwalds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/kontakt"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gold text-obsidian font-cinzel font-semibold text-sm tracking-[0.15em] uppercase overflow-hidden transition-all duration-300 hover:shadow-gold-lg"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <span className="absolute inset-0 bg-gold-light translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500" />
            <Utensils size={18} className="relative z-10" />
            <span className="relative z-10">Tisch Reservieren</span>
          </Link>
          <Link
            to="/hotel"
            className="group inline-flex items-center gap-3 px-8 py-4 border border-gold/70 text-gold font-cinzel text-sm tracking-[0.15em] uppercase hover:border-gold hover:bg-gold/10 transition-all duration-300"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <BedDouble size={18} />
            <span>Hotel Buchen</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center justify-center gap-8 md:gap-16 mt-16"
        >
          {[
            { value: '20+', label: 'Jahre Tradition' },
            { value: '80+', label: 'XXL-Gerichte' },
            { value: '200+', label: 'Gästeplätze' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-cinzel_deco text-2xl md:text-3xl text-gradient-gold font-bold"
                style={{ fontFamily: '"Cinzel Decorative", serif' }}>
                {stat.value}
              </div>
              <div className="font-inter text-xs text-parchment-darker tracking-widest uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-bounce"
        aria-hidden="true"
      >
        <span className="font-cinzel text-[10px] tracking-[0.3em] text-gold/60 uppercase"
          style={{ fontFamily: 'Cinzel, serif' }}>
          Entdecken
        </span>
        <ChevronDown size={20} className="text-gold/60" />
      </motion.div>

      {/* ─── Soft overflow fade to page background ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          height: '180px',
          background: `linear-gradient(to bottom, transparent 0%, ${PAGE_BG} 100%)`,
        }}
      />
    </section>
  );
}
