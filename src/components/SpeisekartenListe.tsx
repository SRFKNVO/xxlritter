import { useEffect, useMemo, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { fetchMenuItems } from '../lib/reservations';
import type { MenuItem } from '../types/reservations';

export default function SpeisekartenListe() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchMenuItems()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-meadow relative overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="divider-gold w-16" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Vollständige Übersicht
            </span>
            <div className="divider-gold w-16" />
          </div>
          <h2 className="font-cinzel_deco font-bold text-3xl md:text-4xl text-forest" style={{ fontFamily: '"Cinzel Decorative", serif' }}>
            Unsere <span className="text-gradient-gold">Speisekarte</span>
          </h2>
        </motion.div>

        {[...grouped.entries()].map(([category, catItems]) => (
          <div key={category} className="mb-10">
            <h3 className="font-cinzel text-sm tracking-widest uppercase text-gold mb-4 pb-2 border-b border-gold/20" style={{ fontFamily: 'Cinzel, serif' }}>
              {category}
            </h3>
            <div className="space-y-3">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-baseline gap-3">
                  <span className="font-inter text-sm text-forest font-medium">{item.name}</span>
                  <span className="flex-1 border-b border-dotted border-forest/20 translate-y-[-3px]" />
                  <span className="font-cinzel text-sm text-gold font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                    {item.price.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
