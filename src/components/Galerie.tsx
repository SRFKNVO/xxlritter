import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { ASSETS } from '../assets';

const photos = [
  {
    src: ASSETS.restaurant,
    alt: 'XXL Ritter Restaurant Innenraum – gemütliche Abendstimmung mit Lichterketten',
    span: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    src: ASSETS.aussen,
    alt: 'XXL Ritter Restaurant Außenansicht Herzogenweiler – Terrasse und Biergarten',
    span: 'col-span-1',
  },
  {
    src: ASSETS.hotel,
    alt: 'XXL Ritter Landhotel Herzogenweiler – Hotelgebäude mit Blumenbalkon',
    span: 'col-span-1',
  },
  {
    src: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=500&fit=crop',
    alt: 'XXL Ritterplatte – gigantische Fleischspezialitäten',
    span: 'col-span-1 row-span-2',
  },
  {
    src: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    alt: 'Festliche Feier im Ritter Restaurant',
    span: 'col-span-1',
  },
  {
    src: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    alt: 'XXL Steak – Ritter Spezialität',
    span: 'col-span-1',
  },
  {
    src: 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    alt: 'XXL König Burger – Schwarzwald Spezialität',
    span: 'col-span-1',
  },
  {
    src: 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    alt: 'Firmenfeier und Events im Ritter Restaurant',
    span: 'col-span-1 md:col-span-2',
  },
];

export default function Galerie() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="galerie" className="section-padding bg-meadow relative overflow-hidden" aria-label="Bildergalerie">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="divider-gold w-20" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Einblicke
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-forest mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Unsere <span className="text-gradient-gold">Galerie</span>
          </h2>
          <p className="font-inter text-forest-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Entdecke das XXL Ritter Restaurant – von der gemütlichen Gaststube bis zum
            herrlichen Biergarten im Schwarzwald.
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.alt}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className={`${photo.span} relative overflow-hidden rounded-sm cursor-pointer group`}
              style={{ minHeight: '200px' }}
              onClick={() => setLightbox({ src: photo.src, alt: photo.alt })}
              role="button"
              aria-label={`Bild vergrößern: ${photo.alt}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLightbox({ src: photo.src, alt: photo.alt })}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ minHeight: '200px' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-meadow/0 group-hover:bg-meadow/40 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/60 flex items-center justify-center backdrop-blur-sm">
                  <ZoomIn size={18} className="text-gold" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold/0 group-hover:bg-gold/60 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Bildvorschau"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-h-[85vh] w-auto object-contain"
              />
              <button
                onClick={() => setLightbox(null)}
                aria-label="Schließen"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-obsidian/80 border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <p className="font-cinzel text-parchment text-sm text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                  {lightbox.alt}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
