import { motion } from 'framer-motion';
import { BadgeCheck, Camera, ShieldCheck, UsersRound } from 'lucide-react';
import { fadeUp, stagger } from '../motion.js';

const cards = [
  { title: 'Türk topluluğu odaklı', text: 'Aynı dili konuşan insanlarla daha rahat iletişim.', icon: UsersRound },
  { title: 'Fotoğraflı ilanlar', text: 'Mekanı ilk bakışta anlamayı kolaylaştıran görsel deneyim.', icon: Camera },
  { title: 'Daha şeffaf ev paylaşımı', text: 'Kira, depozito, ev tipi ve yaşam düzeni daha net görünür.', icon: ShieldCheck },
  { title: 'İtalya’daki Türkler için özel', text: 'Öğrenci ve çalışan ihtiyaçlarına göre sadeleştirilmiş akış.', icon: BadgeCheck },
];

export default function TrustCards() {
  return (
    <section className="relative overflow-hidden bg-porcelain py-24">
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-turco/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-navy/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div className="lg:pt-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">Neden TurcoLive?</motion.p>
            <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-black tracking-tight text-navy sm:text-5xl">
              Aynı dili konuşan, benzer beklentileri paylaşan bir topluluk.
            </motion.h2>
          </motion.div>
          <motion.div className="grid gap-5 sm:grid-cols-2" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  variants={fadeUp}
                  whileHover={{ y: -9, scale: 1.02 }}
                  className="premium-surface group rounded-[2rem] border border-white/80 p-7 ring-1 ring-navy/5"
                >
                  <span className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl bg-blush text-turco ring-1 ring-turco/10 transition group-hover:bg-turco group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 text-lg font-black text-navy">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-navy/58">{card.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
