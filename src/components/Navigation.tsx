import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ASSETS } from '../assets';

const navLinks = [
  { label: 'Speisekarte', href: '/speisekarte' },
  { label: 'Erlebnis', href: '/erlebnis' },
  { label: 'Hotel', href: '/hotel' },
  { label: 'Events', href: '/events' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Kontakt', href: '/kontakt' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // On non-home pages, always show dark nav (no hero behind it)
  const alwaysDark = !isHome;
  const isDark = alwaysDark || scrolled;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          isDark
            ? 'glass-darker py-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'py-4 bg-gradient-to-b from-black/60 to-transparent'
        }`}
        role="navigation"
        aria-label="Hauptnavigation"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            aria-label="XXL Ritter – Zurück zur Startseite"
            className="flex items-center gap-3 group"
          >
            <img
              src={ASSETS.logo}
              alt="XXL Ritter Helm-Logo"
              className="h-11 w-auto transition-all duration-300 group-hover:scale-105"
              style={{
                filter: 'brightness(0) saturate(100%) invert(65%) sepia(70%) saturate(600%) hue-rotate(5deg) brightness(110%)',
              }}
              width="44"
              height="44"
            />
            <div className="flex flex-col leading-none">
              <span
                className="font-cinzel_deco font-bold text-base tracking-[0.1em] shimmer-gold"
                style={{ fontFamily: '"Cinzel Decorative", serif' }}
              >
                RITTER
              </span>
              <span
                className="font-cinzel text-gold/70 text-[8px] tracking-[0.35em] uppercase mt-0.5"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                XXL Gastronomie
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`font-cinzel text-[11px] tracking-widest uppercase relative group transition-all duration-300 ${
                    active ? 'text-gold' : 'text-parchment/80 hover:text-gold'
                  }`}
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              to="/kontakt"
              className="font-cinzel text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300 rounded-sm font-semibold"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Reservieren
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gold p-1"
            aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 backdrop-blur-xl"
            style={{ background: 'rgba(22, 60, 30, 0.97)' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col items-center mb-2">
              <img
                src={ASSETS.logo}
                alt="XXL Ritter"
                className="h-16 w-auto mb-3"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(65%) sepia(70%) saturate(600%) hue-rotate(5deg) brightness(110%)',
                }}
              />
              <span className="font-cinzel_deco font-bold text-xl tracking-widest shimmer-gold"
                style={{ fontFamily: '"Cinzel Decorative", serif' }}>
                RITTER
              </span>
              <span className="font-cinzel text-gold/60 text-[9px] tracking-[0.4em] uppercase mt-1"
                style={{ fontFamily: 'Cinzel, serif' }}>
                XXL Gastronomie
              </span>
            </div>

            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={link.href}
                  className={`font-cinzel text-2xl tracking-widest uppercase transition-colors ${
                    location.pathname === link.href ? 'text-gold' : 'text-parchment hover:text-gold'
                  }`}
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/kontakt"
                className="mt-2 font-cinzel text-sm tracking-[0.2em] uppercase px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Tisch Reservieren
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
