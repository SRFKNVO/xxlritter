import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCarouselPromotions, publicImageUrl } from '../lib/reservations';
import type { Promotion } from '../types/reservations';

const ROTATE_MS = 5000;

export default function AktionenKarussell() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchCarouselPromotions()
      .then(setPromotions)
      .catch(() => setPromotions([]));
  }, []);

  useEffect(() => {
    if (paused || promotions.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % promotions.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, promotions.length]);

  if (promotions.length === 0) return null;

  const current = promotions[index];

  return (
    <section className="section-padding bg-obsidian relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="divider-gold w-16" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Gerade Angesagt
            </span>
            <div className="divider-gold w-16" />
          </div>
          <h2 className="font-cinzel_deco font-bold text-3xl md:text-4xl text-white" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
            Aktuelle <span className="text-gradient-gold">Aktionen</span>
          </h2>
        </motion.div>

        <div
          className="relative rounded-sm border border-gold/25 overflow-hidden bg-obsidian-light"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {current.image_path && (
            <div className="h-64 md:h-80">
              <img src={publicImageUrl(current.image_path)} alt={current.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 text-center">
            <h3 className="font-cinzel font-bold text-xl text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              {current.title}
            </h3>
            {current.description && (
              <p className="font-inter text-sm text-stone-lighter/70">{current.description}</p>
            )}
          </div>

          {promotions.length > 1 && (
            <>
              <button
                onClick={() => {
                  setPaused(true);
                  setIndex((i) => (i - 1 + promotions.length) % promotions.length);
                }}
                aria-label="Vorherige Aktion"
                className="absolute left-3 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-obsidian/70 text-gold flex items-center justify-center hover:bg-obsidian"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  setPaused(true);
                  setIndex((i) => (i + 1) % promotions.length);
                }}
                aria-label="Nächste Aktion"
                className="absolute right-3 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-obsidian/70 text-gold flex items-center justify-center hover:bg-obsidian"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {promotions.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPaused(true);
                      setIndex(i);
                    }}
                    aria-label={`Aktion ${i + 1} anzeigen`}
                    className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-gold' : 'bg-gold/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
