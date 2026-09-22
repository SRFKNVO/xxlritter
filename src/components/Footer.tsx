import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../assets';

const navLinks = [
  { label: 'Speisekarte', to: '/speisekarte' },
  { label: 'Das Erlebnis', to: '/erlebnis' },
  { label: 'Landhotel', to: '/hotel' },
  { label: 'Events & Feiern', to: '/events' },
  { label: 'Galerie', to: '/galerie' },
  { label: 'Reservierung', to: '/kontakt' },
];

const hours = [
  { label: 'Montag', value: 'Ruhetag' },
  { label: 'Di – Sa', value: '17:00 – 22:00' },
  { label: 'Sonntag', value: '11:00–14:00, 17:00–21:00' },
];

export default function Footer() {
  return (
    <footer className="relative bg-obsidian overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img
                src={ASSETS.logo}
                alt="XXL Ritter Logo"
                className="h-12 w-auto flex-shrink-0"
                style={{ filter: 'brightness(0) saturate(100%) invert(65%) sepia(70%) saturate(600%) hue-rotate(5deg) brightness(110%)' }}
              />
              <div>
                <div className="font-cinzel_deco font-bold text-2xl shimmer-gold"
                  style={{ fontFamily: '"Cinzel Decorative", serif' }}>
                  RITTER
                </div>
                <div className="font-cinzel text-gold/60 text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'Cinzel, serif' }}>
                  XXL Gastronomie
                </div>
              </div>
            </Link>
            <p className="font-inter text-sm text-parchment/50 leading-relaxed mb-6">
              Seit 2003 das außergewöhnlichste Ritter-Restaurant im Schwarzwald.
              Gigantische Portionen, rustikale Atmosphäre und unvergessliche Erlebnisse.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/RitterRestaurant" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold/60 hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold/60 hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}>
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}
                    className="font-inter text-sm text-parchment/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 group">
                    <span className="w-3 h-px bg-gold/30 group-hover:w-5 group-hover:bg-gold transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}>
              Öffnungszeiten
            </h4>
            <ul className="space-y-3">
              {hours.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4">
                  <span className="font-inter text-xs text-parchment/50 flex items-center gap-2">
                    <Clock size={11} className="text-gold/50" />
                    {item.label}
                  </span>
                  <span className="font-cinzel text-xs text-gold font-semibold"
                    style={{ fontFamily: 'Cinzel, serif' }}>
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel font-bold text-parchment text-sm tracking-widest uppercase mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}>
              Kontakt
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+49772123686"
                  className="flex items-start gap-3 font-inter text-sm text-parchment/50 hover:text-gold transition-colors duration-300 group">
                  <Phone size={15} className="text-gold/60 mt-0.5 flex-shrink-0 group-hover:text-gold" />
                  07721 23686
                </a>
              </li>
              <li>
                <a href="mailto:info@xxlritter.de"
                  className="flex items-start gap-3 font-inter text-sm text-parchment/50 hover:text-gold transition-colors duration-300 group">
                  <Mail size={15} className="text-gold/60 mt-0.5 flex-shrink-0 group-hover:text-gold" />
                  info@xxlritter.de
                </a>
              </li>
              <li>
                <a href="https://maps.google.com/maps/dir//Glaserstra%C3%9Fe+2,+78052+Villingen-Schwenningen"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 font-inter text-sm text-parchment/50 hover:text-gold transition-colors duration-300 group">
                  <MapPin size={15} className="text-gold/60 mt-0.5 flex-shrink-0 group-hover:text-gold" />
                  <span>Glaserstraße 2<br />78052 Villingen-Schwenningen</span>
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/kontakt"
                className="inline-block font-cinzel text-xs tracking-[0.2em] uppercase px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                style={{ fontFamily: 'Cinzel, serif' }}>
                Tisch reservieren
              </Link>
            </div>
          </div>
        </div>

        <div className="divider-gold mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-inter text-xs text-parchment/35">
            © {new Date().getFullYear()} XXL Ritter Restaurant & Landhotel. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="font-inter text-xs text-parchment/35 hover:text-gold transition-colors duration-300">Impressum</a>
            <a href="#" className="font-inter text-xs text-parchment/35 hover:text-gold transition-colors duration-300">Datenschutz</a>
            <a href="#" className="font-inter text-xs text-parchment/35 hover:text-gold transition-colors duration-300">AGB</a>
            <Link to="/login" className="font-inter text-xs text-parchment/35 hover:text-gold transition-colors duration-300">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
