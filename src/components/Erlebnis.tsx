import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sword, Castle, Users, Crown, Music, Flame } from 'lucide-react';

const timeline = [
  {
    year: '1994',
    icon: <Castle size={20} />,
    title: 'Die Gründung',
    description: 'Als kleiner Gasthof mit großem Herz eröffnet – die Ritter-Legende begann.',
  },
  {
    year: '2003',
    icon: <Sword size={20} />,
    title: 'Das XXL-Konzept',
    description: 'Die legendären XXL-Portionen wurden eingeführt und sorgten schnell für Aufsehen weit über die Region hinaus.',
  },
  {
    year: '2010',
    icon: <Crown size={20} />,
    title: 'Das Landhotel',
    description: 'Eröffnung des Ritter-Landhotels mit einzigartiger mittelalterlicher Dekoration und modernem Komfort.',
  },
  {
    year: '2018',
    icon: <Users size={20} />,
    title: 'Eventlocation',
    description: 'Ritterbankette, Hochzeiten und Firmenfeiern im authentischen mittelalterlichen Ambiente.',
  },
  {
    year: 'Heute',
    icon: <Flame size={20} />,
    title: 'Lebende Legende',
    description: 'Über 30 Jahre Leidenschaft, Tradition und unvergessliche Erlebnisse für tausende Gäste.',
  },
];

const features = [
  {
    icon: <Castle size={28} />,
    title: 'Historisches Ambiente',
    description: 'Steinmauern, Ritterrüstungen und Feuerfackeln schaffen eine Atmosphäre, die in die Vergangenheit entführt.',
  },
  {
    icon: <Music size={28} />,
    title: 'Ritterevents',
    description: 'Regelmäßige Ritterbankette mit Mittelaltermärkten, Schwertkampfdemonstrationen und Barden-Musik.',
  },
  {
    icon: <Users size={28} />,
    title: 'Familienerlebnis',
    description: 'Großes Kinderprogramm, mittelalterliche Kostüme zum Anprobieren und familienfreundliche XXL-Menüs.',
  },
  {
    icon: <Crown size={28} />,
    title: 'Ehrenkodex',
    description: 'Jeder Gast wird wie ein König behandelt – persönlicher Service, der sich wie Mittelalterhospitalität anfühlt.',
  },
];

export default function Erlebnis() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="erlebnis" className="section-padding relative overflow-hidden" style={{ background: '#0C1E10' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Background image overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Medieval hall"
          className="w-full h-full object-cover opacity-8"
          style={{ opacity: 0.06 }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
              Geschichte & Atmosphäre
            </span>
            <div className="divider-gold w-20" />
          </div>
          <h2
            className="font-cinzel_deco font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6"
            style={{ fontFamily: '"Cinzel Decorative", serif' }}
          >
            Das <span className="text-gradient-gold">Rittererlebnis</span>
          </h2>
          <p className="font-inter text-stone-lighter/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Tauche ein in eine Welt, die Zeit und Raum überbrückt – wo Mittelalter und
            Moderne zu einem unvergesslichen Erlebnis verschmelzen.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="group glass-dark rounded-sm p-8 hover:border-gold/40 transition-all duration-400 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/40 text-gold mb-5 group-hover:bg-gold/10 group-hover:border-gold transition-all duration-300 mx-auto">
                {f.icon}
              </div>
              <h3
                className="font-cinzel font-bold text-lg text-white mb-3"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {f.title}
              </h3>
              <p className="font-inter text-sm text-stone-lighter/70 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="text-center mb-12">
            <h3
              className="font-cinzel font-bold text-2xl md:text-3xl text-gradient-gold"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Unsere Geschichte
            </h3>
          </div>

          {/* Timeline line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="relative text-center"
              >
                {/* Year circle */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-gold bg-obsidian flex items-center justify-center text-gold">
                      {item.icon}
                    </div>
                  </div>
                </div>
                <div
                  className="font-cinzel text-gold font-bold text-sm mb-2"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {item.year}
                </div>
                <h4
                  className="font-cinzel font-bold text-white text-base mb-2"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {item.title}
                </h4>
                <p className="font-inter text-xs text-stone-lighter/60 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
