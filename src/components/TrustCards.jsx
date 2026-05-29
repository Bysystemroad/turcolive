import { motion } from 'framer-motion';
import { BadgeCheck, MessageCircle, ShieldCheck, UsersRound } from 'lucide-react';
import { fadeUp, stagger } from '../motion.js';

const cards = [
  { title: 'Hızlı İletişim', text: 'İlan sahibine tek tıkla WhatsApp üzerinden ulaş.', icon: MessageCircle },
  { title: 'Türk Topluluğu', text: 'İtalya’da yaşayan Türklerle aynı evi paylaş.', icon: UsersRound },
  { title: 'Güvenilir İlanlar', text: 'Onaylanan ilanlar sayesinde güvenle iletişim kur.', icon: ShieldCheck },
  { title: 'İtalya’da Türkler için özel', text: 'Öğrenci ve çalışan ihtiyaçlarına göre sadeleştirilmiş ilan akışı.', icon: BadgeCheck },
];

const seoKeywords = ['Roma Türk ev arkadaşı', 'Milano Türk oda ilanları', 'Bologna Türk öğrenci evi', 'İtalya Türk ev arkadaşı'];

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
              İtalya’da Türk ev arkadaşı bulmak daha hızlı ve doğrudan olmalı.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-8 text-navy/62">
              TurcoLive, İtalya’da yaşayan Türkler için oluşturulmuş topluluk odaklı bir ev ve oda paylaşım platformudur. Amacımız,
              ev arayanlar ile ilan sahiplerini hızlı, kolay ve doğrudan iletişimle buluşturmak; ev bulma sürecini daha güvenli ve
              daha pratik hale getirmektir.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              {seoKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white px-4 py-2 text-xs font-black text-navy shadow-sm ring-1 ring-navy/10">
                  {keyword}
                </span>
              ))}
            </motion.div>
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
