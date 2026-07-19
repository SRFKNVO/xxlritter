import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Stefan M.',
    location: 'München',
    rating: 5,
    text: 'Das beste Erlebnis-Restaurant weit und breit! Die Ritterplatte ist ein Kunstwerk der Küche – gigantisch und unglaublich lecker. Das Ambiente ist wie aus einem anderen Jahrhundert.',
    date: 'März 2024',
    highlight: true,
  },
  {
    name: 'Maria K.',
    location: 'Stuttgart',
    rating: 5,
    text: 'Wir haben hier unsere Hochzeit gefeiert und es war absolut magisch. Das Team hat alles perfekt organisiert. Unsere Gäste reden noch heute davon.',
    date: 'Januar 2024',
    highlight: false,
  },
  {
    name: 'Thomas R.',
    location: 'Frankfurt',
    rating: 5,
    text: 'Das XXL Schnitzel ist legendär – ich habe selten etwas so Zartes und gleichzeitig so Riesiges gegessen. Der Service ist herzlich und aufmerksam. Gerne wieder!',
    date: 'April 2024',
    highlight: false,
  },
  {
    name: 'Familie Berger',
    location: 'Nürnberg',
    rating: 5,
    text: 'Perfekt für die Familie! Die Kinder waren begeistert von den Ritterrüstungen und dem Ambiente. Das Essen war für alle ein Highlight. Wir kommen jedes Jahr wieder.',
    date: 'Februar 2024',
    highlight: true,
  },
  {
    name: 'Andreas W.',
    location: 'Leipzig',
    rating: 5,
    text: 'Das Landhotel ist wunderschön – rustikale Einrichtung, super saubere Zimmer und ein hervorragendes Frühstück. Idealer Ausgangspunkt für Ausflüge in der Region.',
    date: 'Mai 2024',
    highlight: false,
  },
  {
    name: 'Claudia S.',
    location: 'Hamburg',
    rating: 5,
    text: 'Der Ritterabend mit dem Betrieb war ein voller Erfolg! Schwertkampf, Musik und das Bankett haben das ganze Team begeistert. So ein Event vergisst man nicht so schnell.',
    date: 'März 2024',
    highlight: false,
  },
];

function ReviewCard({ review, index }: { review: typeof reviews[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7 }}
      className={`group relative rounded-sm p-7 transition-all duration-500 animate-float-delayed ${
        review.highlight
          ? 'ring-1 ring-gold/40 bg-white hover:shadow-gold'
          : 'glass-light hover:border-gold/30'
      }`}
      style={{ animationDelay: `${index * 0.8}s` }}
    >
      {/* Quote icon */}
      <div className="absolute top-6 right-6 text-gold/10">
        <Quote size={40} />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(review.rating)].map((_, s) => (
          <Star
            key={s}
            size={14}
            className="text-gold fill-gold"
          />
        ))}
      </div>

      {/* Text */}
      <p className="font-inter text-sm text-forest leading-relaxed mb-6 relative z-10">
        "{review.text}"
      </p>

      {/* Divider */}
      <div className="divider-gold mb-5" />

      {/* Author */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="font-cinzel font-bold text-forest text-sm"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {review.name}
          </p>
          <p className="font-inter text-xs text-forest-muted mt-0.5">
            {review.location}
          </p>
        </div>
        <span className="font-inter text-xs text-gold/50">{review.date}</span>
      </div>

      {/* Hover gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/50 transition-all duration-500 rounded-b-sm" />
    </motion.div>
  );
}

export default function Bewertungen() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="section-padding relative overflow-hidden" style={{ background: '#E8F5E8' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gold/3 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="divider-gold w-20" />
            <span className="font-cinzel text-gold text-xs tracking-[0.4em] uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              Was Gäste sagen
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-forest mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Stimmen der <span className="text-gradient-gold">Tafelrunde</span>
          </h2>

          {/* Overall rating */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} className="text-gold fill-gold animate-star-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span
              className="font-cinzel_deco text-3xl text-gradient-gold font-bold"
              style={{ fontFamily: '"Cinzel Decorative", serif' }}
            >
              4.9
            </span>
            <span className="font-inter text-stone-lighter/50 text-sm">/ 5.0 · 1.200+ Bewertungen</span>
          </div>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ReviewCard key={review.name} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
