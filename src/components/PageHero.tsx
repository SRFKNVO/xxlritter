import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
}

export default function PageHero({ title, subtitle, description }: PageHeroProps) {
  return (
    <section className="relative h-72 md:h-96 flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={ASSETS.restaurant}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/70 to-obsidian/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/50 via-transparent to-obsidian/50" />
      </div>

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="divider-gold w-10" />
            <span
              className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              {subtitle}
            </span>
          </div>
          <h1
            className="font-cinzel_deco font-bold text-3xl md:text-5xl text-parchment"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-parchment/70 font-inter text-base max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Bottom fade into page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-meadow" />
    </section>
  );
}
